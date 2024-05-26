import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyLedgerComponent } from './party-ledger.component';

describe('PartyLedgerComponent', () => {
  let component: PartyLedgerComponent;
  let fixture: ComponentFixture<PartyLedgerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyLedgerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PartyLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
