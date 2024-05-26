// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePartyComponent } from './components/create-party/create-party.component';
import { RecordTransactionComponent } from './components/record-transaction/record-transaction.component';
import { DailyTransactionsComponent } from './components/daily-transactions/daily-transactions.component';
import { StockComponent } from './components/stock/stock.component';
import { PartyBalanceComponent } from './components/party-balance/party-balance.component';
import { PartyLedgerComponent } from './components/party-ledger/party-ledger.component';

const routes: Routes = [
  { path: 'create-party', component: CreatePartyComponent },
  { path: 'record-transaction', component: RecordTransactionComponent },
  { path: 'daily-transactions', component: DailyTransactionsComponent },
  { path: 'stock', component: StockComponent },
  { path: 'party-balance', component: PartyBalanceComponent },
  { path: 'party-ledger/:id', component: PartyLedgerComponent },
  { path: '', redirectTo: '/create-party', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
