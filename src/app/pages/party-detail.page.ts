import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PartyService } from '../services/party.service';
import { TransactionService } from '../services/transaction.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-party-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
      <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        <a [routerLink]="['/parties']" class="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <svg viewBox='0 0 24 24' class='h-5 w-5 text-slate-700' fill='currentColor'><path d='M15 6l-6 6 6 6'/></svg>
          <span class="sr-only">Back</span>
        </a>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-semibold text-slate-900 leading-tight truncate">{{ party()?.name || 'Party' }}</h1>
          <p class="text-xs text-slate-500 -mt-0.5">Ledger & Transactions</p>
        </div>
        <a [routerLink]="['/transaction/new']" [queryParams]="{ name: party()?.name }" class="text-sm text-brand-700 underline underline-offset-4">New Tx</a>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-md mx-auto px-4 py-4 pb-24">
      <section class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-white shadow-soft p-4">
          <p class="text-xs text-slate-500">Cash Balance</p>
          <p class="mt-1 text-xl font-semibold">{{ (party()?.cashBalance || 0) | currency:'INR':'symbol':'1.0-0' }}</p>
        </div>
        <div class="rounded-xl bg-white shadow-soft p-4">
          <p class="text-xs text-slate-500">Metal Balance</p>
          <p class="mt-1 text-xl font-semibold">{{ (party()?.metalBalance || 0) | number:'1.3-3' }} g</p>
        </div>
      </section>

      <!-- Transactions -->
      <section class="mt-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-2">Transactions</h2>

        <div class="space-y-2" *ngIf="(txs() | async)?.length; else empty">
          <div 
            *ngFor="let t of (txs() | async)" 
            (click)="openTxDetail(t)"
            class="rounded-xl bg-white shadow-soft p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition">
            <div class="h-10 w-10 rounded-lg flex items-center justify-center text-white"
              [ngClass]="{ 'bg-emerald-600': t.type==='sale', 'bg-amber-600': t.type==='purchase', 'bg-blue-600': t.type==='cashin', 'bg-rose-600': t.type==='cashout', 'bg-cyan-600': t.type==='metalin', 'bg-fuchsia-600': t.type==='metalout' }">
              <svg viewBox='0 0 24 24' class='h-5 w-5' fill='currentColor'><path d='M12 12h0'/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 capitalize">{{ t.type }}</p>
              <p class="text-xs text-slate-500 truncate">{{ t.note || (t.type==='metalin'||t.type==='metalout' ? (t.netWt || t.grossWt || 0) + ' g' : '') }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-900" *ngIf="t.type!=='metalin' && t.type!=='metalout'">{{ (t.amount || 0) | currency:'INR':'symbol':'1.0-0' }}</p>
              <p class="text-[10px] text-slate-500">{{ t.createdAt | date:'short' }}</p>
            </div>
          </div>
        </div>

        <ng-template #empty>
          <div class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
            No transactions for this party.
          </div>
        </ng-template>
      </section>
    </main>

    <!-- Modal -->
    <div *ngIf="selectedTx()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="relative bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-6">
        <button (click)="closeTxDetail()" class="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-xl leading-none">✕</button>
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Transaction Details</h3>

        <div class="space-y-2 text-sm text-slate-700">
          <p><span class="font-medium">Type:</span> {{ selectedTx()?.type }}</p>
          <p><span class="font-medium">Name:</span> {{ selectedTx()?.name }}</p>
          <p><span class="font-medium">Date:</span> {{ selectedTx()?.date | date:'mediumDate' }}</p>
          <p><span class="font-medium">Note:</span> {{ selectedTx()?.note || '—' }}</p>
          <p><span class="font-medium">Gross Wt:</span> {{ selectedTx()?.grossWt }} g</p>
          <p><span class="font-medium">Purity:</span> {{ selectedTx()?.purity }}%</p>
          <p><span class="font-medium">Net Wt:</span> {{ selectedTx()?.netWt }} g</p>
          <p><span class="font-medium">Rate:</span> ₹{{ selectedTx()?.rate }}</p>
          <p><span class="font-medium">Amount:</span> ₹{{ selectedTx()?.amount }}</p>
          <p><span class="font-medium">Cash In:</span> {{ selectedTx()?.cashIn || '—' }}</p>
          <p><span class="font-medium">Cash Out:</span> {{ selectedTx()?.cashOut || '—' }}</p>
          <p><span class="font-medium">Balance:</span> ₹{{ selectedTx()?.balance }}</p>
          <p><span class="font-medium">Created At:</span> {{ selectedTx()?.createdAt | date:'medium' }}</p>
          <p><span class="font-medium">Transaction ID:</span> {{ selectedTx()?.id }}</p>
        </div>

        <div class="mt-5 text-right">
          <button (click)="closeTxDetail()" class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900">Close</button>
        </div>
      </div>
    </div>
  </div>
  `,
})
export class PartyDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly parties = inject(PartyService);
  private readonly txSvc = inject(TransactionService);

  readonly party = computed(() => {
    const name = this.route.snapshot.paramMap.get('id');
    return this.parties.parties().find(p => p.name === name);
  });

  readonly txs = computed(() => {
    const name = this.party()?.name || '';
    if (!name) return of([]);
    return this.txSvc.fetchByParty(name);
  });

  readonly selectedTx = signal<any | null>(null);

  openTxDetail(tx: any) {
    this.selectedTx.set(tx);
  }

  closeTxDetail() {
    this.selectedTx.set(null);
  }
}
