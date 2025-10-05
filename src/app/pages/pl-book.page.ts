import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService, PLResponse } from '../services/reports.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pl-book',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
    <header class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
      <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        <a [routerLink]="['/']" class="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center">
          <svg viewBox='0 0 24 24' class='h-5 w-5 text-slate-700' fill='currentColor'><path d='M15 6l-6 6 6 6'/></svg>
          <span class="sr-only">Back</span>
        </a>
        <div>
          <h1 class="text-lg font-semibold text-slate-900 leading-tight">P/L Book</h1>
          <p class="text-xs text-slate-500 -mt-0.5">Profit & Loss summary</p>
        </div>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-4 pb-24">
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label class="block text-xs text-slate-600 mb-1">From</label>
          <input type="date" [value]="from()" (change)="from.set(($any($event.target)).value)" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" />
        </div>
        <div>
          <label class="block text-xs text-slate-600 mb-1">To</label>
          <input type="date" [value]="to()" (change)="to.set(($any($event.target)).value)" class="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" />
        </div>
      </div>
      <div class="mb-4">
        <button (click)="fetch()" class="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 shadow-soft">Apply</button>
      </div>

      <section *ngIf="data() as d" class="grid grid-cols-2 gap-3">
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Sales</p><p class="mt-1 text-xl font-semibold">{{ d.totals.sales | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Purchases</p><p class="mt-1 text-xl font-semibold">{{ d.totals.purchases | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Cash In</p><p class="mt-1 text-xl font-semibold">{{ d.totals.cashin | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Cash Out</p><p class="mt-1 text-xl font-semibold">{{ d.totals.cashout | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Metal In</p><p class="mt-1 text-xl font-semibold">{{ d.totals.metalIn | number:'1.3-3' }} g</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4"><p class="text-xs text-slate-500">Metal Out</p><p class="mt-1 text-xl font-semibold">{{ d.totals.metalOut | number:'1.3-3' }} g</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4 col-span-2"><p class="text-xs text-slate-500">Gross Profit</p><p class="mt-1 text-2xl font-semibold">{{ d.totals.grossProfit | currency:'INR':'symbol':'1.0-0' }}</p></div>
        <div class="rounded-xl bg-white shadow-soft p-4 col-span-2"><p class="text-xs text-slate-500">Net</p><p class="mt-1 text-2xl font-semibold" [class.text-emerald-600]="d.totals.net>=0" [class.text-rose-600]="d.totals.net<0">{{ d.totals.net | currency:'INR':'symbol':'1.0-0' }}</p></div>
      </section>
    </main>
  </div>
  `,
})
export class PLBookPageComponent {
  private readonly reports = inject(ReportsService);

  readonly from = signal(this.dayOffset(-7));
  readonly to = signal(this.dayOffset(0));
  readonly data = signal<PLResponse | null>(null);

  constructor() { this.fetch(); }

  fetch() {
    this.reports.getPL({ from: this.from(), to: this.to() }).subscribe({
      next: (d) => this.data.set(d),
      error: () => this.data.set({ from: this.from(), to: this.to(), totals: { sales: 0, purchases: 0, cashin: 0, cashout: 0, metalIn: 0, metalOut: 0, grossProfit: 0, net: 0 } })
    });
  }

  private dayOffset(offset: number) {
    const t = new Date();
    t.setDate(t.getDate()+offset);
    const yyyy = t.getFullYear();
    const mm = String(t.getMonth()+1).padStart(2,'0');
    const dd = String(t.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
