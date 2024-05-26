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
  parties: Party[] = [
    {
      "id": 1,
      "name": "Hydrogen",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 2,
      "name": "Helium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 3,
      "name": "Lithium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 4,
      "name": "Beryllium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 5,
      "name": "Boron",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 6,
      "name": "Carbon",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 7,
      "name": "Nitrogen",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 8,
      "name": "Oxygen",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 9,
      "name": "Fluorine",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 10,
      "name": "Neon",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 11,
      "name": "Sodium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 12,
      "name": "Magnesium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 13,
      "name": "Aluminum",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 14,
      "name": "Silicon",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 15,
      "name": "Phosphorus",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 16,
      "name": "Sulfur",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 17,
      "name": "Chlorine",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 18,
      "name": "Argon",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 19,
      "name": "Potassium",
      "cashBalance": 0,
      "metalBalance": 0
    },
    {
      "id": 20,
      "name": "Calcium",
      "cashBalance": 0,
      "metalBalance": 0
    }
  ];

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
