import { Injectable, signal, inject, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SyncService } from "./sync.service";

export interface Party {
  name: string;
  cashBalance: number;
  metalBalance: number;
  createdAt: string;
}

const STORAGE_KEY = "gold-pos:parties";
const TEN_MIN = 10 * 60 * 1000;
export const API_BASE = "http://localhost:8080/api";

@Injectable({ providedIn: "root" })
export class PartyService {
  private readonly http = inject(HttpClient);
  private readonly sync = inject(SyncService);
  private readonly _parties = signal<Party[]>(this.load());
  readonly parties = this._parties.asReadonly();
  readonly allNames = computed(() =>
    Array.from(
      new Set(this._parties().map(p => p.name).filter(n => typeof n === "string"))
    ).sort((a, b) => a.localeCompare(b))
  );
  private lastNamesFetch = 0;

  constructor() {
    setInterval(() => this.ensureFreshNames(), TEN_MIN);
    this.refreshParties();
  }

  add(input: Omit<Party, "createdAt">): Party {
    const party = { ...input, createdAt: new Date().toISOString() };
    const updated = [party, ...this._parties()];
    this._parties.set(updated);
    this.persist(updated);

    // Optimistically POST, sync on error
    this.http.post<Party>(`${API_BASE}/parties`, party).subscribe({
      next: (saved) => {
        if (!saved) return;
        const idx = this._parties().findIndex(
          p => p.name.toLowerCase() === party.name.toLowerCase()
        );
        if (idx !== -1) {
          const parties = [...this._parties()];
          parties[idx] = { ...party, ...saved };
          this._parties.set(parties);
          this.persist(parties);
        }
      },
      error: () => this.sync.enqueue("POST", `${API_BASE}/parties`, party)
    });

    this.ensureFreshNames();
    return party;
  }

  findByName(name: string) {
    const v = (name || "").toLowerCase();
    return this._parties().find(p => p.name.toLowerCase() === v);
  }

  existsName(name: string) {
    const v = (name || "").trim().toLowerCase();
    return !!v && this.allNames().some(n => n.toLowerCase() === v);
  }

  ensureFreshNames() {
    const now = Date.now();
    const stale = !this.lastNamesFetch || now - this.lastNamesFetch > TEN_MIN;
    if (stale) this.refreshParties();
  }

  refreshParties() {
    this.fetchParties().subscribe({
      next: (list) => {
        const valid = Array.isArray(list) ? list.filter(Boolean) : [];
        this._parties.set(valid);
        this.persist(valid);
        this.lastNamesFetch = Date.now();
      }
    });
  }

  private load(): Party[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch { return []; }
  }

  private persist(list: Party[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  }

  fetchParties() {
    return this.http.get<Party[]>(`${API_BASE}/parties`);
  }
  fetchPartyById(id: string) {
    return this.http.get<Party>(`${API_BASE}/parties/${id}`);
  }
}