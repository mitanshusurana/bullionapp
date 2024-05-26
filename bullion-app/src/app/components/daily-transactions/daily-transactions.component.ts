// src/app/components/daily-transactions/daily-transactions.component.ts
import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-daily-transactions',
  templateUrl: './daily-transactions.component.html',
  styleUrls: ['./daily-transactions.component.css']
})
export class DailyTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getAllTransactions().subscribe(data => {
      this.transactions = data;
    });
  }
}
