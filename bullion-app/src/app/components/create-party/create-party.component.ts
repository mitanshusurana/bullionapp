// src/app/components/create-party/create-party.component.ts
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PartyService } from '../../services/party.service';
import { Party } from '../../models/party';

@Component({
  selector: 'app-create-party',
  templateUrl: './create-party.component.html',
  styleUrls: ['./create-party.component.css']
})
export class CreatePartyComponent {
  party: Party = { id: 0, name: '', cashBalance: 0, metalBalance: 0 };

  constructor(private partyService: PartyService) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.partyService.createParty(this.party).subscribe(response => {
        console.log('Party created:', response);
        form.resetForm();
      });
    }
  }
}
