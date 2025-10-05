import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home.page";
import { NewTransactionPageComponent } from "./pages/new-transaction.page";
import { NewPartyPageComponent } from "./pages/new-party.page";
import { PartyListPageComponent } from "./pages/party-list.page";
import { PartyDetailPageComponent } from "./pages/party-detail.page";
import { DaybookPageComponent } from "./pages/daybook.page";
import { PLBookPageComponent } from "./pages/pl-book.page";

export const routes: Routes = [
  { path: "", component: HomePageComponent },
  { path: "transaction/new", component: NewTransactionPageComponent },
  { path: "party/new", component: NewPartyPageComponent },
  { path: "parties", component: PartyListPageComponent },
  { path: "parties/:id", component: PartyDetailPageComponent },
  { path: "daybook", component: DaybookPageComponent },
  { path: "pl", component: PLBookPageComponent },
  { path: "**", redirectTo: "" },
];
