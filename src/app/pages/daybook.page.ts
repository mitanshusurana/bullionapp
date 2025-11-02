import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportsService, DaybookEntry, DaybookResponse } from '../services/reports.service';
import { TransactionDetailModalComponent } from '../components/transaction-detail-modal.component';

@Component({
  selector: 'app-daybook',
  standalone: true,
  imports: [CommonModule, RouterModule, TransactionDetailModalComponent],
  providers: [DatePipe],
  template: `
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
      <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        <a [routerLink]="['/']" class="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <svg viewBox='0 0 24 24' class='h-5 w-5 text-slate-700' fill='currentColor'><path d='M15 6l-6 6 6 6'/></svg>
          <span class="sr-only">Back</span>
        </a>
        <div>
          <h1 class="text-lg font-semibold text-slate-900 leading-tight">Daybook</h1>
          <p class="text-xs text-slate-500 -mt-0.5">Daily transactions summary</p>
        </div>
        <div class="ml-auto">
          <input type="date" [value]="date()" (change)="onDate($event)" class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" />
        </div>
      </div>
    </header>

    <!-- Summary cards -->
    <main class="max-w-md mx-auto px-4 py-4 pb-24">
      <section class="grid grid-cols-2 gap-3" *ngIf="data() as d">
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Sales</p><p class="mt-1 text-xl font-semibold">{{ d.totals.sale | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Purchases</p><p class="mt-1 text-xl font-semibold">{{ d.totals.purchase | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Cash In</p><p class="mt-1 text-xl font-semibold">{{ d.totals.cashin | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Cash Out</p><p class="mt-1 text-xl font-semibold">{{ d.totals.cashout | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4 col-span-2"><p class="text-xs text-slate-500">Net</p><p class="mt-1 text-2xl font-semibold" [class.text-emerald-600]="d.totals.net>=0" [class.text-rose-600]="d.totals.net<0">{{ d.totals.net | currency:'INR':'symbol':'1.0-0' }}</p></div>
      </section>

      <!-- Entries -->
      <section class="mt-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-2">Entries</h2>
        <div class="space-y-2" *ngIf="data()?.entries?.length; else empty">
          <div *ngFor="let t of data()?.entries" 
               (click)="openTransactionDetails(t)"
               class="rounded-xl bg-white shadow-soft p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
            <div class="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                 [ngClass]="{
                   'bg-emerald-600': t.type==='sale', 
                   'bg-amber-600': t.type==='purchase', 
                   'bg-blue-600': t.type==='cashin', 
                   'bg-rose-600': t.type==='cashout', 
                   'bg-cyan-600': t.type==='metalin', 
                   'bg-fuchsia-600': t.type==='metalout' 
                 }">
              <svg viewBox='0 0 24 24' class='h-5 w-5' fill='currentColor'><path d='M12 12h0'/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 capitalize">{{ t.type }} <span *ngIf="t.name" class="text-slate-500">• {{ t.name }}</span></p>
              <p class="text-xs text-slate-500 truncate" *ngIf="t.type==='metalin' || t.type==='metalout'">{{ t.netWt || t.grossWt || 0 }} g at {{ t.purity || 0 }}%</p>
              <p class="text-xs text-slate-500 truncate" *ngIf="t.type!=='metalin' && t.type!=='metalout'">{{ t.note || '' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-900" *ngIf="t.type!=='metalin' && t.type!=='metalout'">{{ (t.amount || 0) | currency:'INR':'symbol':'1.0-0' }}</p>
              <p class="text-[10px] text-slate-500">{{ t.createdAt | date:'shortTime' }}</p>
            </div>
          </div>
        </div>
        <ng-template #empty>
          <div class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">No entries for selected date.</div>
        </ng-template>
      </section>
    </main>

    <!-- Transaction Details Modal -->
    <app-transaction-detail-modal
      [transaction]="selectedTransaction"
      (close)="closeModal()">
    </app-transaction-detail-modal>
  </div>
  `
})
export class DaybookPageComponent {
  private readonly reports = inject(ReportsService);

  readonly date = signal(this.today());
  readonly data = signal<DaybookResponse | null>(null);
  readonly searchQuery = signal('');
  readonly selectedTypes = signal<Set<string>>(new Set());

  selectedTransaction: DaybookEntry | null = null;

  readonly filteredEntries = signal<DaybookEntry[]>([]);

  constructor() {
    this.fetch();
    this.updateFilteredEntries();
  }

  constructor() { this.fetch(); }

  onDate(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.date.set(v);
    this.fetch();
  }

  private fetch() {
    this.reports.getDaybook(this.date()).subscribe({
      next: (d) => this.data.set(d),
      error: () => this.data.set({ date: this.date(), entries: [], totals: { sale: 0, purchase: 0, cashin: 0, cashout: 0, net: 0 } })
    });
  }

  today() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
  }

  openTransactionDetails(transaction: DaybookEntry) {
    this.selectedTransaction = transaction;
  }

  closeModal() {
    this.selectedTransaction = null;
  }
}
