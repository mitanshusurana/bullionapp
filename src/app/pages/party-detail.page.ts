import { Component, computed, inject, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { PartyService } from "../services/party.service";
import { TransactionService } from "../services/transaction.service";
import { TransactionDetailModalComponent } from "../components/transaction-detail-modal.component";

@Component({
  selector: "app-party-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, TransactionDetailModalComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
        <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <a [routerLink]="['/parties']" class="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="h-5 w-5 text-slate-700" fill="currentColor"><path d="M15 6l-6 6 6 6" /></svg>
            <span class="sr-only">Back</span>
          </a>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-semibold text-slate-900 leading-tight truncate">{{ party()?.name || "Party" }}</h1>
            <p class="text-xs text-slate-500 -mt-0.5">Ledger & Transactions</p>
          </div>
          <a [routerLink]="['/transaction/new']" [queryParams]="{ name: party()?.name }" class="text-sm text-brand-700 underline underline-offset-4">New Tx</a>
        </div>
      </header>

      <main class="max-w-md mx-auto px-4 py-4 pb-24">
        <section class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-white shadow-soft p-4">
            <p class="text-xs text-slate-500">Cash Balance</p>
            <p class="mt-1 text-xl font-semibold">{{ party()?.cashBalance || 0 | currency: "INR" : "symbol" : "1.0-0" }}</p>
          </div>
          <div class="rounded-xl bg-white shadow-soft p-4">
            <p class="text-xs text-slate-500">Metal Balance</p>
            <p class="mt-1 text-xl font-semibold">{{ party()?.metalBalance || 0 | number: "1.3-3" }} g</p>
          </div>
        </section>

        <section class="mt-6">
          <h2 class="text-sm font-semibold text-slate-700 mb-3">Transactions</h2>

          <div class="mb-4">
            <input
              type="text"
              placeholder="Search by note, amount, or type..."
              (input)="onSearch($event.target.value)"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              *ngFor="let type of ['sale','purchase','cashin','cashout','metalin','metalout','rateCutsales','ratecutPurchase']"
              (click)="toggleType(type)"
              [class]="
                'text-xs px-3 py-1 rounded-lg border transition ' +
                (isTypeSelected(type)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400')"
            >
              {{ (type === 'rateCutsales' ? 'RATE CUT SALE' : type === 'ratecutPurchase' ? 'RATE CUT BUY' : type) | uppercase }}
            </button>
          </div>

          <div class="space-y-2" *ngIf="getFilteredTransactions(loadedTransactions())?.length; else empty">
            <div *ngFor="let t of getFilteredTransactions(loadedTransactions())"
              (click)="openTxDetail(t)"
              class="rounded-xl bg-white shadow-soft p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition">
              <div class="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                [ngClass]="{
                  'bg-emerald-600': t.type==='sale',
                  'bg-amber-600': t.type==='purchase',
                  'bg-blue-600': t.type==='cashin',
                  'bg-rose-600': t.type==='cashout',
                  'bg-cyan-600': t.type==='metalin',
                  'bg-fuchsia-600': t.type==='metalout',
                  'bg-teal-600': t.type==='rateCutsales',
                  'bg-orange-600': t.type==='ratecutPurchase'
                }">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                  <path d="M12 12h0" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 capitalize">{{ t.type }}</p>
                <p class="text-xs text-slate-500 truncate">
                  {{t.note || (t.type==='metalin'||t.type==='metalout'? (t.netWt||t.grossWt||0) + ' g':'')}}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-slate-900" *ngIf="t.type!=='metalin' && t.type!=='metalout'">
                  {{ t.amount || 0 | currency:'INR':'symbol':'1.0-0' }}
                </p>
                <p class="text-[10px] text-slate-500">{{ t.createdAt | date: "short" }}</p>
              </div>
            </div>
          </div>
          <ng-template #empty>
            <div class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">No transactions for this party.</div>
          </ng-template>

          <div *ngIf="hasMore() && getFilteredTransactions(loadedTransactions())?.length" class="mt-4 text-center">
            <button (click)="loadMore()" [disabled]="isLoading()" class="px-6 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition">
              {{ isLoading() ? "Loading..." : "Load More" }}
            </button>
          </div>
        </section>
      </main>
      <app-transaction-detail-modal [transaction]="selectedTx()" (close)="closeTxDetail()"></app-transaction-detail-modal>
    </div>
  `,
})
export class PartyDetailPageComponent {
  private route = inject(ActivatedRoute);
  private parties = inject(PartyService);
  private txSvc = inject(TransactionService);

  readonly party = computed(() =>
    this.parties.parties().find(p => p.name === this.route.snapshot.paramMap.get("id"))
  );
  readonly selectedTx = signal<any | null>(null);
  readonly searchQuery = signal("");
  readonly selectedTypes = signal<Set<string>>(new Set());

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly hasMore = signal(true);
  readonly loadedTransactions = signal<any[]>([]);
  readonly isLoading = signal(false);

  constructor() {
    this.parties.ensureFreshNames();
    this.loadTransactions();
    effect(() => this.updateFilteredTransactions());
  }

  private loadTransactions() {
    const name = this.party()?.name || "";
    if (!name) return;
    this.isLoading.set(true);
    this.txSvc.fetchByParty(name, this.currentPage(), this.pageSize()).subscribe({
      next: txs => {
        const next = this.currentPage() === 0 ? txs : [...this.loadedTransactions(), ...txs];
        this.loadedTransactions.set(next);
        this.hasMore.set(txs.length === this.pageSize());
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasMore.set(false);
      },
    });
  }

  loadMore() {
    if (this.isLoading() || !this.hasMore()) return;
    this.currentPage.set(this.currentPage() + 1);
    this.loadTransactions();
  }

  private updateFilteredTransactions() {
    // Filtering is handled here for future expansion; currently done in getFilteredTransactions
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
  }
  toggleType(type: string) {
    const types = new Set(this.selectedTypes());
    types.has(type) ? types.delete(type) : types.add(type);
    this.selectedTypes.set(types);
  }
  isTypeSelected(type: string) {
    return this.selectedTypes().has(type);
  }
  getFilteredTransactions(transactions: any[]): any[] {
    if (!transactions) return [];
    const query = this.searchQuery().toLowerCase().trim();
    const types = this.selectedTypes();
    return transactions.filter(tx => {
      if (types.size && !types.has(tx.type)) return false;
      if (query) {
        const searchable = [
          tx.note || "",
          tx.type,
          tx.amount?.toString() || "",
          tx.netWt?.toString() || "",
        ].join(" ").toLowerCase();
        if (!searchable.includes(query)) return false;
      }
      return true;
    });
  }
  openTxDetail(tx: any) { this.selectedTx.set(tx); }
  closeTxDetail() { this.selectedTx.set(null); }
}
