import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PartyService } from '../services/party.service';

@Component({
  selector: 'app-party-list',
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
          <h1 class="text-lg font-semibold text-slate-900 leading-tight">Parties</h1>
          <p class="text-xs text-slate-500 -mt-0.5">Cash and metal balances</p>
        </div>
        <a [routerLink]="['/party/new']" class="ml-auto text-sm text-brand-700 underline underline-offset-4">New Party</a>
      </div>
    </header>

    <main class="max-w-md mx-auto px-4 py-4 pb-24">
      <div *ngIf="!parties().length" class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">No parties yet. Create one.</div>

      <div class="space-y-2">
        <a *ngFor="let p of parties()" [routerLink]="['/parties', p.name]" class="block rounded-xl bg-white shadow-soft p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ p.name }}</p>
              <p class="text-[11px] text-slate-500">Tap to view transactions</p>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-500">Cash</div>
              <div class="text-sm font-semibold">{{ p.cashBalance | currency:'INR':'symbol':'1.0-0' }}</div>
              <div class="text-xs text-slate-500 mt-2">Metal</div>
              <div class="text-sm font-semibold">{{ p.metalBalance | number:'1.3-3' }} g</div>
            </div>
          </div>
        </a>
      </div>
    </main>
  </div>
  `,
})
export class PartyListPageComponent {
  private readonly partiesSvc = inject(PartyService);
  readonly parties = computed(() => this.partiesSvc.parties().slice().sort((a,b)=> a.name.localeCompare(b.name)));
}
