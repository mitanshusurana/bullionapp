import { Party } from "./party";

// src/app/models/transaction.model.ts
export interface Transaction {
    id: number;
    date: string;
    type: string; // purchase, sales, etc.
    metalQuantity: number;
    cashAmount: number;
    rate: number;
    party: Party;
  }
  