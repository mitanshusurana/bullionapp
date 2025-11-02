import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from './party.service';

export interface DaybookEntry {
  id: string;
  type: 'sale' | 'purchase' | 'cashin' | 'cashout' | 'metalin' | 'metalout';
  name?: string;
  amount?: number;
  cashIn?: number;
  cashOut?: number;
  grossWt?: number;
  netWt?: number;
  purity?: number;
  rate?: number;
  note?: string;
  balance?: number;
  createdAt: string; // ISO
}

export interface DaybookResponse {
  date: string; // yyyy-MM-dd
  entries: DaybookEntry[];
  totals: {
    sale: number; purchase: number; cashin: number; cashout: number; net: number;
  };
}

export interface PLResponse {
  from?: string; to?: string; date?: string;
  totals: {
    sales: number;
    purchases: number;
    cashin: number;
    cashout: number;
    metalIn: number;
    metalOut: number;
    grossProfit: number;
    net: number;
  };
}

export interface InventoryResponse {
  totalCash: number;
  totalMetal: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);

  // API: GET /api/daybook?date=yyyy-MM-dd
  getDaybook(date: string) {
    return this.http.get<DaybookResponse>(`${API_BASE}/daybook`, { params: { date } });
  }

  // API: GET /api/pl?from=yyyy-MM-dd&to=yyyy-MM-dd (or ?date=yyyy-MM-dd)
  getPL(params: { from?: string; to?: string; date?: string }) {
    return this.http.get<PLResponse>(`${API_BASE}/pl`, { params: { ...params } as any });
  }
}
