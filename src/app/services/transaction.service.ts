import { Injectable, computed, signal, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_BASE } from "./party.service";
import { v4 as uuidv4 } from "uuid";
import { SyncService } from "./sync.service";

export type TxType =
  | "sale"
  | "purchase"
  | "cashin"
  | "cashout"
  | "metalin"
  | "metalout";

export interface Transaction {
  id: string;
  type: TxType;
  // Common fields
  name?: string;
  date?: string; // yyyy-MM-dd
  note?: string;

  // Currency-related
  amount: number; // currency amount for sale/purchase/cash in/out
  cashIn?: number;
  cashOut?: number;
  balance?: number; // amount - cashIn/cashOut for sale/purchase

  // Metal-related (weights)
  grossWt?: number; // grams
  purity?: number; // percent (0-100)
  netWt?: number; // grams (gross * purity/100)
  rate?: number; // currency per gram

  createdAt: string; // ISO
}

export interface SummaryTotals {
  sale: number;
  purchase: number;
  cashin: number;
  cashout: number;
  net: number; // sale - purchase + cashin - cashout
}

const STORAGE_KEY = "gold-pos:transactions";

@Injectable({ providedIn: "root" })
export class TransactionService {
  private readonly _transactions = signal<Transaction[]>(this.load());
  private readonly sync = inject(SyncService);

  readonly transactions = this._transactions.asReadonly();

  readonly totals = computed<SummaryTotals>(() => {
    const acc: SummaryTotals = {
      sale: 0,
      purchase: 0,
      cashin: 0,
      cashout: 0,
      net: 0,
    };
    for (const t of this._transactions()) {
      if (t.type in acc) {
        // @ts-expect-error index by type keys existing in acc
        acc[t.type] += t.amount || 0;
      }
    }
    acc.net = acc.sale - acc.purchase + acc.cashin - acc.cashout;
    return acc;
  });

  add(input: Omit<Transaction, "id" | "createdAt">) {
    const tx: Transaction = {
      ...input,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    // Optimistically update local store
    const next = [tx, ...this._transactions()];
    this._transactions.set(next);
    this.persist(next);

    // Send to backend (fire-and-forget). If backend returns a different payload/id, reconcile local state.
    this.http.post<Transaction>(`${API_BASE}/transactions`, tx).subscribe({
      next: (saved) => {
        if (!saved) return;
        const list = this._transactions();
        const idx = list.findIndex((t) => t.id === tx.id);
        if (idx === -1) return;
        const updated = [...list];
        updated[idx] = { ...tx, ...saved };
        this._transactions.set(updated);
        this.persist(updated);
      },
      error: () => {
        this.sync.enqueue("POST", `${API_BASE}/transactions`, tx);
      },
    });

    return tx;
  }

  uniqueNames(): string[] {
    const set = new Set<string>();
    for (const t of this._transactions()) {
      if (t.name) set.add(t.name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  clearAll() {
    this._transactions.set([]);
    this.persist([]);
  }

  private load(): Transaction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Transaction[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(Boolean);
    } catch {
      return [];
    }
  }

  private persist(list: Transaction[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // API: GET /api/transactions
  private readonly http = inject(HttpClient);
  fetchAll() {
    return this.http.get<Transaction[]>(`${API_BASE}/transactions`);
  }

  // API: GET /api/transactions?party=Name
  fetchByParty(name: string) {
    return this.http.get<Transaction[]>(`${API_BASE}/transactions`, { params: { party: name } });
  }
}
