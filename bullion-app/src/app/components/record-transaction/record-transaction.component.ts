// src/app/components/record-transaction/record-transaction.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { PartyService } from '../../services/party.service';
import { PrintService } from '../../services/print.service';
import { Transaction } from '../../models/transaction';
import { Party } from '../../models/party';

@Component({
  selector: 'app-record-transaction',
  templateUrl: './record-transaction.component.html',
  styleUrls: ['./record-transaction.component.css']
})
export class RecordTransactionComponent implements OnInit {
  transaction: Transaction = { id: 0, date: '', type: '', metalQuantity: 0, cashAmount: 0, rate: 0, party: { id: 0, name: '', cashBalance: 0, metalBalance: 0 }};
  parties: Party[] = [];

  constructor(
    private transactionService: TransactionService,
    private partyService: PartyService,
    private printService: PrintService
  ) {}

  ngOnInit(): void {
    this.partyService.getAllParties().subscribe(data => {
      this.parties = data;
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.transactionService.createTransaction(this.transaction).subscribe(response => {
        console.log('Transaction recorded:', response);
        this.printService.printDocument('Transaction Receipt', response);
        form.resetForm();
      });
    }
  }
}
