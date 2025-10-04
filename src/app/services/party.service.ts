import { Injectable, signal, computed } from "@angular/core";

export interface Party {
  id: string;
  name: string;
  cashBalance: number; // currency
  metalBalance: number; // grams
  createdAt: string; // ISO
}

const STORAGE_KEY = "gold-pos:parties";

@Injectable({ providedIn: "root" })
export class PartyService {
  private readonly _parties = signal<Party[]>(this.load());
  readonly parties = this._parties.asReadonly();

  readonly names = computed(() => {
    return this._parties().map((p) => p.name).filter(Boolean);
  });

  add(input: Omit<Party, "id" | "createdAt">) {
    const party: Party = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const next = [party, ...this._parties()];
    this._parties.set(next);
    this.persist(next);
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
    return !!this.findByName(name);
  }

  ensureFreshNames(trigger: "app_open" | "new_party" | "timer") {
    // No-op for local storage implementation
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
}
