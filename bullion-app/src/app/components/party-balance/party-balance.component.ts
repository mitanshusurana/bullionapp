// src/app/components/party-balance/party-balance.component.ts
import { Component, OnInit } from '@angular/core';
import { PartyService } from '../../services/party.service';
import { Party } from '../../models/party';

@Component({
  selector: 'app-party-balance',
  templateUrl: './party-balance.component.html',
  styleUrls: ['./party-balance.component.css']
})
export class PartyBalanceComponent implements OnInit {
  parties: Party[] = [];

  constructor(private partyService: PartyService) {}

  ngOnInit(): void {
    this.partyService.getAllParties().subscribe(data => {
      this.parties = data;
    });
  }
}
