import { Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TransactionService } from "../services/transaction.service";

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header
        class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200"
      >
        <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div
            class="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 shadow-soft flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5 text-white"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l9 5-9 5-9-5 9-5zm0 7l9 5-9 5-9-5 9-5z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">
              Gold POS
            </h1>
            <p class="text-xs text-slate-500 -mt-0.5">
              Fast, simple transactions
            </p>
          </div>
          <div class="ml-auto">
            <a
              class="text-sm text-brand-700 hover:text-brand-800 underline underline-offset-4"
              [routerLink]="['/transaction/new']"
              >New</a
            >
          </div>
        </div>
      </header>

      <main class="max-w-md mx-auto px-4 py-4 pb-28">
        <!-- Totals -->
        <section class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-white shadow-soft p-4">
            <p class="text-xs text-slate-500">Net</p>
            <p
              class="mt-1 text-2xl font-semibold"
              [class.text-emerald-600]="totals().net >= 0"
              [class.text-rose-600]="totals().net < 0"
            >
              {{ totals().net | currency: "INR" : "symbol" : "1.0-0" }}
            </p>
          </div>
          <div class="rounded-xl bg-white shadow-soft p-4">
            <p class="text-xs text-slate-500">Transactions</p>
            <p class="mt-1 text-2xl font-semibold text-slate-900">
              {{ count() }}
            </p>
          </div>
        </section>

        <!-- Quick actions -->
        <section class="mt-4 grid grid-cols-2 gap-3">
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'sale' }"
            class="group rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-emerald-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M7 13h10v-2H7v2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-emerald-900">Sale</p>
              <p class="text-xs text-emerald-700">Sell gold items</p>
            </div>
          </a>
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'purchase' }"
            class="group rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-amber-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M17 11H7v2h10v-2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-amber-900">Purchase</p>
              <p class="text-xs text-amber-700">Buy from supplier</p>
            </div>
          </a>
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'cashin' }"
            class="group rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M12 3l4 4h-3v6h-2V7H8l4-4zM5 19h14v2H5v-2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-blue-900">Cash In</p>
              <p class="text-xs text-blue-700">Add cash</p>
            </div>
          </a>
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'cashout' }"
            class="group rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-rose-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M12 21l-4-4h3V11h2v6h3l-4 4zM5 3h14v2H5V3z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-rose-900">Cash Out</p>
              <p class="text-xs text-rose-700">Withdraw cash</p>
            </div>
          </a>
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'metalin' }"
            class="group rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-cyan-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M5 12h14v2H5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-cyan-900">Metal In</p>
              <p class="text-xs text-cyan-700">Receive metal</p>
            </div>
          </a>
          <a
            [routerLink]="['/transaction/new']"
            [queryParams]="{ type: 'metalout' }"
            class="group rounded-xl bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 border border-fuchsia-200 p-4 flex items-center gap-3"
          >
            <div class="p-2 rounded-lg bg-fuchsia-600 text-white">
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M5 10h14v2H5z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-fuchsia-900">Metal Out</p>
              <p class="text-xs text-fuchsia-700">Issue metal</p>
            </div>
          </a>
        </section>

        <!-- Recent -->
        <section class="mt-6">
          <h2 class="text-sm font-semibold text-slate-700 mb-2">Recent</h2>
          <div class="space-y-2" *ngIf="transactions().length; else empty">
            <div
              *ngFor="let t of transactions()"
              class="rounded-xl bg-white shadow-soft p-4 flex items-center gap-3"
            >
              <div
                class="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                [ngClass]="{
                  'bg-emerald-600': t.type === 'sale',
                  'bg-amber-600': t.type === 'purchase',
                  'bg-blue-600': t.type === 'cashin',
                  'bg-rose-600': t.type === 'cashout',
                  'bg-cyan-600': t.type === 'metalin',
                  'bg-fuchsia-600': t.type === 'metalout',
                }"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                  <path *ngIf="t.type === 'sale'" d="M7 13h10v-2H7v2z" />
                  <path *ngIf="t.type === 'purchase'" d="M17 11H7v2h10v-2z" />
                  <path
                    *ngIf="t.type === 'cashin'"
                    d="M12 3l4 4h-3v6h-2V7H8l4-4z"
                  />
                  <path
                    *ngIf="t.type === 'cashout'"
                    d="M12 21l-4-4h3v-6h2v6h3l-4 4z"
                  />
                  <path *ngIf="t.type === 'metalin'" d="M5 12h14v2H5z" />
                  <path *ngIf="t.type === 'metalout'" d="M5 10h14v2H5z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 capitalize">
                  {{ t.type }}
                  <span *ngIf="t.name" class="text-slate-500"
                    >• {{ t.name }}</span
                  >
                </p>
                <p
                  class="text-xs text-slate-500 truncate"
                  *ngIf="t.type === 'metalin' || t.type === 'metalout'"
                >
                  {{ t.netWt || t.grossWt || 0 }} g at {{ t.purity || 0 }}%
                </p>
                <p
                  class="text-xs text-slate-500 truncate"
                  *ngIf="t.type !== 'metalin' && t.type !== 'metalout'"
                >
                  {{ t.note || "No note" }}
                </p>
              </div>
              <div class="text-right">
                <p
                  class="text-sm font-semibold text-slate-900"
                  *ngIf="t.type !== 'metalin' && t.type !== 'metalout'"
                >
                  {{ t.amount || 0 | currency: "INR" : "symbol" : "1.0-0" }}
                </p>
                <p class="text-[10px] text-slate-500">
                  {{ t.createdAt | date: "short" }}
                </p>
              </div>
            </div>
          </div>
          <ng-template #empty>
            <div
              class="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500"
            >
              No transactions yet. Start by recording one.
            </div>
          </ng-template>
        </section>
      </main>

      <a
        [routerLink]="['/transaction/new']"
        class="fixed right-4 bottom-24 md:bottom-8 h-12 w-12 rounded-full shadow-soft bg-brand-500 hover:bg-brand-600 active:scale-95 transition flex items-center justify-center text-white"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor">
          <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
        </svg>
        <span class="sr-only">New transaction</span>
      </a>
    </div>
  `,
})
export class HomePageComponent {
  private readonly tx = inject(TransactionService);

  readonly transactions = this.tx.transactions;
  readonly totals = this.tx.totals;
  readonly count = computed(() => this.tx.transactions().length);
}
