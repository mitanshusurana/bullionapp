import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordTransactionComponent } from './record-transaction.component';

describe('RecordTransactionComponent', () => {
  let component: RecordTransactionComponent;
  let fixture: ComponentFixture<RecordTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordTransactionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecordTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
