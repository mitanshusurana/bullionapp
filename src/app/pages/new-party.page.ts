import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PartyService } from "../services/party.service";

@Component({
  selector: "app-new-party",
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
              New Party
            </h1>
            <p class="text-xs text-slate-500 -mt-0.5">
              Create party with opening balances
            </p>
          </div>
        </div>
      </header>

      <main class="max-w-md mx-auto px-4 py-4 pb-24">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-2"
              >Name</label
            >
            <input
              formControlName="name"
              type="text"
              placeholder="Party name"
              class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Cash Balance (₹)</label
              >
              <input
                formControlName="cashBalance"
                type="number"
                step="0.01"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 mb-2"
                >Metal Balance (g)</label
              >
              <input
                formControlName="metalBalance"
                type="number"
                step="0.001"
                class="w-full rounded-xl border border-slate-300 bg-white p-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div class="pt-2">
            <button
              type="submit"
              [disabled]="form.invalid"
              class="w-full inline-flex items-center justify-center rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold py-3 shadow-soft active:scale-[.99] transition"
            >
              Save Party
            </button>
          </div>
        </form>
      </main>
    </div>
  `,
})
export class NewPartyPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly parties = inject(PartyService);

  readonly form = this.fb.group({
    name: this.fb.control<string>("", { validators: [Validators.required] }),
    cashBalance: this.fb.control<number>(0),
    metalBalance: this.fb.control<number>(0),
  });

  constructor() {
    const pre = this.route.snapshot.queryParamMap.get("name");
    if (pre) this.form.controls.name.setValue(pre);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, cashBalance, metalBalance } = this.form.getRawValue();
    this.parties.add({
      name: name!.trim(),
      cashBalance: Number(cashBalance) || 0,
      metalBalance: Number(metalBalance) || 0,
    });
    this.parties.ensureFreshNames("new_party");
    this.router.navigateByUrl("/");
  }
}
