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
const NAMES_KEY = "gold-pos:party-names";
const TEN_MIN = 10 * 60 * 1000;
export const API_BASE = "/api";

@Injectable({ providedIn: "root" })
export class PartyService {
  private readonly http = inject(HttpClient);
  private readonly sync = inject(SyncService);

  private readonly _parties = signal<Party[]>(this.load());
  readonly parties = this._parties.asReadonly();

  private readonly _names = signal<string[]>(this.loadNamesCache().names);
  readonly names = this._names.asReadonly();
  readonly allNames = computed(() => Array.from(new Set([
    ...this._names(),
    ...this._parties().map(p => p.name)
  ])).sort((a,b)=>a.localeCompare(b)));

  private lastNamesFetch = this.loadNamesCache().ts;

  constructor() {
    this.ensureFreshNames("app_open");
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
      }
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
        const idx = list.findIndex((p) => p.name.toLowerCase() === party.name.toLowerCase());
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

    // Refresh names cache
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
    return (
      this.allNames().some((n) => n.toLowerCase() === v) ||
      !!this.findByName(name)
    );
  }

  ensureFreshNames(trigger: "app_open" | "new_party" | "timer") {
    const now = Date.now();
    const stale = !this.lastNamesFetch || now - this.lastNamesFetch > TEN_MIN;
    if (trigger === "new_party" || stale || this._names().length === 0) {
      this.fetchNames();
    }
  }

  private fetchNames() {
    this.http.get<string[]>(`${API_BASE}/parties/namesfiltered`).subscribe({
      next: (list) => {
        const unique = Array.from(new Set(list.filter(Boolean)));
        this._names.set(unique);
        this.lastNamesFetch = Date.now();
        this.persistNamesCache(unique, this.lastNamesFetch);
      },
      error: () => {
        // keep existing cache on error
      },
    });
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

  private loadNamesCache(): { names: string[]; ts: number } {
    try {
      const raw = localStorage.getItem(NAMES_KEY);
      if (!raw) return { names: [], ts: 0 };
      const parsed = JSON.parse(raw) as { names: string[]; ts: number };
      return {
        names: Array.isArray(parsed.names) ? parsed.names : [],
        ts: Number(parsed.ts) || 0,
      };
    } catch {
      return { names: [], ts: 0 };
    }
  }

  private persistNamesCache(names: string[], ts: number) {
    try {
      localStorage.setItem(NAMES_KEY, JSON.stringify({ names, ts }));
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
