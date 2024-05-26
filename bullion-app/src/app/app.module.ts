// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { CreatePartyComponent } from './components/create-party/create-party.component';
import { RecordTransactionComponent } from './components/record-transaction/record-transaction.component';
import { DailyTransactionsComponent } from './components/daily-transactions/daily-transactions.component';
import { StockComponent } from './components/stock/stock.component';
import { PartyBalanceComponent } from './components/party-balance/party-balance.component';
import { PartyLedgerComponent } from './components/party-ledger/party-ledger.component';
import { PrintService } from './services/print.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent,
    CreatePartyComponent,
    RecordTransactionComponent,
    DailyTransactionsComponent,
    StockComponent,
    PartyBalanceComponent,
    PartyLedgerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    AppRoutingModule
  ],
  providers: [PrintService, provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
