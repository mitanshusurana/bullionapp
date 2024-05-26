// src/app/components/party-ledger/party-ledger.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartyService } from '../../services/party.service';
import { TransactionService } from '../../services/transaction.service';
import { Party } from '../../models/party';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-party-ledger',
  templateUrl: './party-ledger.component.html',
  styleUrls: ['./party-ledger.component.css']
})
export class PartyLedgerComponent implements OnInit {
  party: Party | undefined;
  transactions: Transaction[] = [];

  constructor(
    private route: ActivatedRoute,
    private partyService: PartyService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const partyId = Number(this.route.snapshot.paramMap.get('id'));
    this.partyService.getParty(partyId).subscribe(party => {
      this.party = party;
    });
    this.transactionService.getAllTransactions().subscribe(transactions => {
      this.transactions = transactions.filter(transaction => transaction.party.id === partyId);
    });
  }
}
