// src/app/components/stock/stock.component.ts
import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  metalStock: number = 0;
  cashStock: number = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.getAllTransactions().subscribe(data => {
      this.calculateStock(data);
    });
  }

  calculateStock(transactions: Transaction[]) {
    transactions.forEach(transaction => {
      this.metalStock += transaction.metalQuantity;
      this.cashStock += transaction.cashAmount;
    });
  }
}
