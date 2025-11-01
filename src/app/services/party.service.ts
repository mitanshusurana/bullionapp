import { Injectable, signal, inject, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SyncService } from "./sync.service";

export interface Party {
  name: string;
  cashBalance: number; // currency
  metalBalance: number; // grams
  createdAt: string; // ISO
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

  // Compute all unique party names from the parties array
  readonly allNames = computed(() => {
    const partyNamesArr = this._parties().map(p => p.name);
    const uniqueStrings = Array.from(new Set(partyNamesArr)).filter((name): name is string => typeof name === "string");
    return uniqueStrings.sort((a, b) => a.localeCompare(b));
  });

  private lastNamesFetch = 0;

  constructor() {
    setInterval(() => this.ensureFreshNames("timer"), TEN_MIN);

    // Load parties from backend as source-of-truth, cache locally
    this.fetchParties().subscribe({
      next: (list) => {
        const valid = Array.isArray(list) ? list.filter(Boolean) : [];
        this._parties.set(valid);
        this.persist(valid);
      },
      error: () => {
        // keep cached local parties on error
      },
    });
  }

  add(input: Omit<Party, "createdAt">) {
    const party: Party = {
      ...input,
      createdAt: new Date().toISOString(),
    };
    // Optimistic add
    const next = [party, ...this._parties()];
    this._parties.set(next);
    this.persist(next);

    // Try to persist to backend; on failure, enqueue for retry
    this.http.post<Party>(`${API_BASE}/parties`, party).subscribe({
      next: (saved) => {
        if (!saved) return;
        // Replace with server's canonical data if returned
        const list = this._parties();
        const idx = list.findIndex(
          (p) => p.name.toLowerCase() === party.name.toLowerCase(),
        );
        if (idx !== -1) {
          const updated = [...list];
          updated[idx] = { ...party, ...saved };
          this._parties.set(updated);
          this.persist(updated);
        }
      },
      error: () => {
        this.sync.enqueue("POST", `${API_BASE}/parties`, party);
      },
    });

    // Optionally re-fetch parties/names from backend if needed
    this.ensureFreshNames("new_party");
    return party;
  }

  findByName(name: string): Party | undefined {
    return this._parties().find(
      (p) => p.name.toLowerCase() === (name || "").toLowerCase(),
    );
  }

  existsName(name: string): boolean {
    const v = (name || "").trim().toLowerCase();
    if (!v) return false;
    return this.allNames().some((n) => n.toLowerCase() === v);
  }

  ensureFreshNames(trigger: "new_party" | "timer") {
    const now = Date.now();
    const stale = !this.lastNamesFetch || now - this.lastNamesFetch > TEN_MIN;
    if (trigger === "new_party" || stale) {
      this.fetchParties().subscribe({
        next: (list) => {
          const valid = Array.isArray(list) ? list.filter(Boolean) : [];
          this._parties.set(valid);
          this.persist(valid);
          this.lastNamesFetch = Date.now();
        },
        error: () => {
          // keep cached local parties on error
        },
      });
    }
  }

  private load(): Party[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Party[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(Boolean);
    } catch {
      return [];
    }
  }

  private persist(list: Party[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }

  // API: GET /api/parties
  fetchParties() {
    return this.http.get<Party[]>(`${API_BASE}/parties`);
  }

  // API: GET /api/parties/:id
  fetchPartyById(id: string) {
    return this.http.get<Party>(`${API_BASE}/parties/${id}`);
  }
}