import { Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home.page";
import { NewTransactionPageComponent } from "./pages/new-transaction.page";
import { NewPartyPageComponent } from "./pages/new-party.page";

export const routes: Routes = [
  { path: "", component: HomePageComponent },
  { path: "transaction/new", component: NewTransactionPageComponent },
  { path: "party/new", component: NewPartyPageComponent },
  { path: "**", redirectTo: "" },
];
