import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { DaybookEntry } from "../services/reports.service";
import { Transaction } from "../services/transaction.service";

type TransactionData = DaybookEntry | Transaction;

@Component({
  selector: "app-transaction-detail-modal",
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div
      *ngIf="transaction"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-6 relative">
        <button
          (click)="onClose()"
          class="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-2xl font-bold leading-none"
        >
          ✕
        </button>

        <h3 class="text-lg font-semibold text-slate-900 mb-4">
          Transaction Details
        </h3>

        <div class="space-y-2 text-sm text-slate-700">
          <p>
            <span class="font-medium">Type:</span>
            <span class="capitalize">{{ transaction.type }}</span>
          </p>
          <p *ngIf="transaction.name">
            <span class="font-medium">Name:</span> {{ transaction.name }}
          </p>
          <p *ngIf="getDisplayDate()">
            <span class="font-medium">Date:</span>
            {{ getDisplayDate() | date: "mediumDate" }}
          </p>
          <p *ngIf="transaction.note">
            <span class="font-medium">Note:</span> {{ transaction.note }}
          </p>
          <p
            *ngIf="
              transaction.grossWt !== undefined && transaction.grossWt !== null
            "
          >
            <span class="font-medium">Gross Wt:</span>
            {{ transaction.grossWt }} g
          </p>
          <p
            *ngIf="
              transaction.purity !== undefined && transaction.purity !== null
            "
          >
            <span class="font-medium">Purity:</span> {{ transaction.purity }}%
          </p>
          <p
            *ngIf="
              transaction.netWt !== undefined && transaction.netWt !== null
            "
          >
            <span class="font-medium">Net Wt:</span> {{ transaction.netWt }} g
          </p>
          <p
            *ngIf="transaction.rate !== undefined && transaction.rate !== null"
          >
            <span class="font-medium">Rate:</span> ₹{{ transaction.rate }}
          </p>
          <p
            *ngIf="
              transaction.amount !== undefined && transaction.amount !== null
            "
          >
            <span class="font-medium">Amount:</span>
            {{ transaction.amount | currency: "INR" : "symbol" : "1.0-0" }}
          </p>
          <p
            *ngIf="
              transaction.cashIn !== undefined && transaction.cashIn !== null
            "
          >
            <span class="font-medium">Cash In:</span>
            {{ transaction.cashIn | currency: "INR" : "symbol" : "1.0-0" }}
          </p>
          <p
            *ngIf="
              transaction.cashOut !== undefined && transaction.cashOut !== null
            "
          >
            <span class="font-medium">Cash Out:</span>
            {{ transaction.cashOut | currency: "INR" : "symbol" : "1.0-0" }}
          </p>
          <p
            *ngIf="
              transaction.balance !== undefined && transaction.balance !== null
            "
          >
            <span class="font-medium">Balance:</span>
            {{ transaction.balance | currency: "INR" : "symbol" : "1.0-0" }}
          </p>
          <p *ngIf="transaction.createdAt">
            <span class="font-medium">Created At:</span>
            {{ transaction.createdAt | date: "medium" }}
          </p>
          <p *ngIf="transaction.id">
            <span class="font-medium">Transaction ID:</span>
            {{ transaction.id }}
          </p>
        </div>

        <div class="mt-5 text-right">
          <button
            (click)="onClose()"
            class="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TransactionDetailModalComponent {
  @Input() transaction: TransactionData | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  getDisplayDate(): string | null {
    if (!this.transaction) return null;
    // Try to get date from either the 'date' or 'createdAt' field
    const date =
      (this.transaction as any).date || (this.transaction as any).createdAt;
    return date || null;
  }
}
