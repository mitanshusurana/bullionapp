import { Component, effect, inject, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { TxType, TransactionService } from "../services/transaction.service";
import { PartyService } from "../services/party.service";

@Component({
  selector: "app-new-transaction",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header
        class="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200"
      >
        <div class="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <a
            [routerLink]="['/']"
            class="h-9 w-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5 text-slate-700"
              fill="currentColor"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <span class="sr-only">Back</span>
          </a>
          <div>
            <h1 class="text-lg font-semibold text-slate-900 leading-tight">
              Record Transaction
            </h1>
            <p class="text-xs text-slate-500 -mt-0.5">
              Sale, Purchase, Cash/Metal In/Out
            </p>
          </div>
        </div>
      </header>

      <main class="max-w-md mx-auto px-4 py-4 pb-24">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <!-- Type selector -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-2"
              >Type</label
            >
            <div class="grid grid-cols-6 gap-2">
              <button
                type="button"
                (click)="setType('sale')"
                [class]="segClass('sale')"
              >
                Sale
              </button>
              <button
                type="button"
                (click)="setType('purchase')"
                [class]="segClass('purchase')"
              >
                Purchase
              </button>
              <button
                type="button"
                (click)="setType('cashin')"
                [class]="segClass('cashin')"
              >
                Cash In
              </button>
              <button
                type="button"
                (click)="setType('cashout')"
                [class]="segClass('cashout')"
              >
                Cash Out
              </button>
              <button
                type="button"
                (click)="setType('metalin')"
                [class]="segClass('metalin')"
              >
                Metal In
              </button>
              <button
                type="button"
                (click)="setType('metalout')"
                [class]="segClass('metalout')"
              >
                Metal Out
              </button>
              <button
                type="button"
                (click)="setType('rateCutsales')"
                [class]="segClass('rateCutsales')"
              >
                Rate Cut Sale
              </button>
              <button
                type="button"
                (click)="setType('ratecutPurchase')"
                [class]="segClass('ratecutPurchase')"
              >
                Rate Cut Buy
              </button>
            </div>
            <p class="mt-1 text-[11px] text-slate-500">
              Selected: <span class="capitalize">{{ formatTypeLabel(type()) }}</span>
            </p>
          </div>

          <!-- Name + Date -->
          <div class="grid grid-cols-2 gap-3">
            <div class="relative">
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Name</label
              >
              <input
                (focus)="openSuggestions()"
                (input)="openSuggestions()"
                (blur)="closeSuggestionsLater()"
                formControlName="name"
                type="text"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                placeholder="Customer / Supplier"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <div
                *ngIf="showSuggestions()"
                class="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white shadow-soft"
              >
                <ng-container *ngIf="filteredNames().length; else noMatch">
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-xs text-slate-500 border-b border-slate-100"
                  >
                    Select a party
                  </button>
                  <button
                  type="button"
                  *ngFor="let n of filteredNames()"
                  (mousedown)="selectName(n)"
                  (click)="selectName(n)"
                  class="w-full px-3 py-2 text-sm hover:bg-slate-50"
                >
                    {{ n }}
                  </button>
                </ng-container>
                <ng-template #noMatch>
                  <div class="px-3 py-2 text-sm text-slate-500">No matches</div>
                </ng-template>
                <button
                  *ngIf="missingParty()"
                  type="button"
                  (mousedown)="$event.preventDefault()"
                  (click)="createPartyFromName()"
                  class="block w-full text-left px-3 py-2 text-sm text-brand-700 hover:bg-slate-50"
                >
                  Create "{{ form.controls.name.value }}"
                </button>
              </div>
              <div class="mt-1 flex items-center gap-3">
                <span
                  *ngIf="!partyValid() && form.controls.name.value"
                  class="text-[11px] text-rose-600"
                  >Please select from dropdown or create new.</span
                >
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Date</label
              >
              <input
                formControlName="date"
                type="date"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <!-- SALE / PURCHASE / RATECUT SALES / RATECUT PURCHASE -->
          <div
            *ngIf="type() === 'sale' || type() === 'purchase' || type() === 'rateCutsales' || type() === 'ratecutPurchase'"
            class="space-y-4"
          >
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Gross Wt (g)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="grossWt"
                  type="number"
                  step="0.001"
                  inputmode="decimal"
                  class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Purity (%)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="purity"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Net Wt (g)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="netWt"
                  type="number"
                  step="0.001"
                  readonly
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Rate (₹/g)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="rate"
                  type="number"
                  step="0.01"
                  inputmode="decimal"
                  class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Amount (₹)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="amount"
                  type="number"
                  step="0.01"
                  readonly
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div *ngIf="type() === 'sale' || type() === 'rateCutsales'">
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Cash In (₹)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="cashIn"
                  type="number"
                  step="0.01"
                  inputmode="decimal"
                  class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div *ngIf="type() === 'purchase' || type() === 'ratecutPurchase'">
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Cash Out (₹)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="cashOut"
                  type="number"
                  step="0.01"
                  inputmode="decimal"
                  class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-2"
                  >Balance (₹)</label
                >
                <input
                  [attr.disabled]="!partyValid() ? '' : null"
                  formControlName="balance"
                  type="number"
                  step="0.01"
                  readonly
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base"
                />
              </div>
            </div>
          </div>

          <!-- METAL IN/OUT -->
          <div
            *ngIf="type() === 'metalin' || type() === 'metalout'"
            class="grid grid-cols-3 gap-3"
          >
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Gross Wt (g)</label
              >
              <input
                [attr.disabled]="!partyValid() ? '' : null"
                formControlName="grossWt"
                type="number"
                step="0.001"
                inputmode="decimal"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Purity (%)</label
              >
              <input
                [attr.disabled]="!partyValid() ? '' : null"
                formControlName="purity"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Net Wt (g)</label
              >
              <input
                [attr.disabled]="!partyValid() ? '' : null"
                formControlName="netWt"
                type="number"
                step="0.001"
                readonly
                class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-base"
              />
            </div>
          </div>

          <!-- CASH IN/OUT only -->
          <div *ngIf="type() === 'cashin' || type() === 'cashout'">
            <label class="block text-xs font-medium text-slate-600 mb-2"
              >Amount (₹)</label
            >
            <input
              [attr.disabled]="!partyValid() ? '' : null"
              formControlName="amount"
              type="number"
              step="0.01"
              inputmode="decimal"
              class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <!-- Note -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-2"
              >Note (optional)</label
            >
            <input
              formControlName="note"
              type="text"
              maxlength="120"
              placeholder="e.g. 22k ring"
              class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              [disabled]="submitDisabled() || !partyValid()"
              class="w-full inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 shadow-soft active:scale-[.99] transition"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </main>
    </div>
  `,
})
export class NewTransactionPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tx = inject(TransactionService);
  private readonly partyService = inject(PartyService);

  readonly type = signal<TxType>("sale");
  readonly names = this.partyService.allNames;

  showSuggestions = signal(false);
  private hideTimer: any;
  private nameQuery = signal("");
  readonly filteredNames = computed(() => {
    const q = this.nameQuery();
    const list = this.names();
    if (!q) return list.slice(0, 8);
    return list.filter((n) => n.toLowerCase().includes(q)).slice(0, 8);
  });

  readonly form = this.fb.group({
    name: this.fb.control<string>(""),
    date: this.fb.control<string>(""),

    // weights
    grossWt: this.fb.control<number | null>(null),
    purity: this.fb.control<number>(100),
    netWt: this.fb.control<number | null>({ value: null, disabled: true }),

    // pricing
    rate: this.fb.control<number | null>(null),
    amount: this.fb.control<number | null>(null),

    // cash movement
    cashIn: this.fb.control<number | null>(null),
    cashOut: this.fb.control<number | null>(null),
    balance: this.fb.control<number | null>({ value: null, disabled: true }),

    // misc
    note: this.fb.control<string>(""),
  });

  constructor() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    this.form.controls.date.setValue(`${yyyy}-${mm}-${dd}`);

    effect(() => {
      const q = this.route.snapshot.queryParamMap;
      const t = (q.get("type") as TxType) || "sale";
      const preName = q.get('name');
      this.setType(t);
      if (preName) {
        this.form.controls.name.setValue(preName);
        this.nameQuery.set(preName.toLowerCase());
      }
    });

    this.form.controls.name.valueChanges.subscribe((val) => {
      const q = (val || '').toLowerCase().trim();
      this.nameQuery.set(q);
      if (q) { this.showSuggestions.set(true); }
    });
    // Auto calculations and suggestions
    this.form.valueChanges.subscribe(() => {


      const g = Number(this.form.controls.grossWt.value) || 0;
      const p = Number(this.form.controls.purity.value) || 0;
      const rate = Number(this.form.controls.rate.value) || 0;
      const type = this.type();

      const net = +(g * (p / 100)).toFixed(3);
      if (!Number.isNaN(net))
        this.form.controls.netWt.setValue(net, { emitEvent: false });

      if (type === "sale" || type === "purchase" || type === "rateCutsales" || type === "ratecutPurchase") {
        const amt = +(net * rate).toFixed(2);
        this.form.controls.amount.setValue(amt, { emitEvent: false });

        const cashIn = Number(this.form.controls.cashIn.value) || 0;
        const cashOut = Number(this.form.controls.cashOut.value) || 0;
        const bal =
          (type === "sale" || type === "rateCutsales")
            ? +(amt - cashIn).toFixed(2)
            : +(cashOut - amt).toFixed(2);
        this.form.controls.balance.setValue(bal, { emitEvent: false });
      }
    });
  }

  openSuggestions() {
    this.showSuggestions.set(true);
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
  closeSuggestionsLater() {
    this.hideTimer = setTimeout(() => this.showSuggestions.set(false), 250);
  }
  selectName(n: string) {
    this.form.controls.name.setValue(n);
    this.showSuggestions.set(false);
  }

  createPartyFromName() {
    const name = (this.form.controls.name.value || '').trim();
    if (!name) return;
    this.router.navigate(["/party/new"], { queryParams: { name } });
  }

  missingParty(): boolean {
    const v = (this.form.controls.name.value || "").trim();
    if (!v) return false;
    return !this.partyService.existsName(v);
  }

  segClass(kind: TxType) {
    const base = "text-xs font-medium rounded-xl px-3 py-2 border transition";
    const active = "text-white border-transparent";
    const inactive = "border-slate-300";
    switch (kind) {
      case "sale":
        return `${base} ${this.type() === "sale" ? active + " bg-emerald-600" : inactive + " bg-white"}`;
      case "purchase":
        return `${base} ${this.type() === "purchase" ? active + " bg-amber-600" : inactive + " bg-white"}`;
      case "cashin":
        return `${base} ${this.type() === "cashin" ? active + " bg-blue-600" : inactive + " bg-white"}`;
      case "cashout":
        return `${base} ${this.type() === "cashout" ? active + " bg-rose-600" : inactive + " bg-white"}`;
      case "metalin":
        return `${base} ${this.type() === "metalin" ? active + " bg-cyan-600" : inactive + " bg-white"}`;
      case "metalout":
        return `${base} ${this.type() === "metalout" ? active + " bg-fuchsia-600" : inactive + " bg-white"}`;
      case "rateCutsales":
        return `${base} ${this.type() === "rateCutsales" ? active + " bg-teal-600" : inactive + " bg-white"}`;
      case "ratecutPurchase":
        return `${base} ${this.type() === "ratecutPurchase" ? active + " bg-orange-600" : inactive + " bg-white"}`;
    }
  }

  setType(t: TxType) {
    this.type.set(t);
    this.form.patchValue(
      {
        grossWt: null,
        rate: null,
        amount: null,
        cashIn: null,
        cashOut: null,
        balance: null,
      },
      { emitEvent: true },
    );
  }

  partyValid(): boolean {
    return this.partyService.existsName(this.form.controls.name.value || "");
  }

  submitDisabled(): boolean {
    const t = this.type();
    if (t === "sale" || t === "purchase" || t === "rateCutsales" || t === "ratecutPurchase") {
      return (
        !this.form.controls.amount.value ||
        !this.form.controls.grossWt.value ||
        !this.form.controls.rate.value
      );
    }
    if (t === "cashin" || t === "cashout") {
      return !this.form.controls.amount.value;
    }
    // metal in/out
    return !this.form.controls.grossWt.value;
  }

  submit() {
    const t = this.type();
    const name = this.form.controls.name.value || undefined;
    const date = this.form.controls.date.value || undefined;
    const note = this.form.controls.note.value || "";

    if (t === "sale" || t === "purchase" || t === "rateCutsales" || t === "ratecutPurchase") {
      const grossWt = Number(this.form.controls.grossWt.value) || 0;
      const purity = Number(this.form.controls.purity.value) || 0;
      const netWt = Number(this.form.controls.netWt.value) || 0;
      const rate = Number(this.form.controls.rate.value) || 0;
      const amount = Number(this.form.controls.amount.value) || 0;
      const cashIn = Number(this.form.controls.cashIn.value) || 0;
      const cashOut = Number(this.form.controls.cashOut.value) || 0;
      const balance =
        Number(this.form.controls.balance.value) ||
        amount - ((t === "sale" || t === "rateCutsales") ? cashIn : cashOut);

      this.tx.add({
        type: t,
        name,
        date,
        note,
        grossWt,
        purity,
        netWt,
        rate,
        amount,
        cashIn: (t === "sale" || t === "rateCutsales") ? cashIn : undefined,
        cashOut: (t === "purchase" || t === "ratecutPurchase") ? cashOut : undefined,
        balance,
      });
    } else if (t === "cashin" || t === "cashout") {
      const amount = Number(this.form.controls.amount.value) || 0;
      const balance = t === "cashin" ? -1*amount : amount;
      this.tx.add({ type: t, name, date, note, amount, balance });
    } else {
      // metal in/out
      const grossWt = Number(this.form.controls.grossWt.value) || 0;
      const purity = Number(this.form.controls.purity.value) || 0;
      const netWt = Number(this.form.controls.netWt.value) || 0;
      this.tx.add({
        type: t,
        name,
        date,
        note,
        amount: 0,
        grossWt,
        purity,
        netWt,
      });
    }

    this.router.navigateByUrl("/");
  }
}
