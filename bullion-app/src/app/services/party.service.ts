// src/app/services/party.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Party } from '../models/party';

@Injectable({
  providedIn: 'root'
})
export class PartyService {
  private apiUrl = 'http://localhost:8080/api/parties';

  constructor(private http: HttpClient) {}

  createParty(party: Party): Observable<Party> {
    return this.http.post<Party>(this.apiUrl, party);
  }

  getParty(id: number): Observable<Party> {
    return this.http.get<Party>(`${this.apiUrl}/${id}`);
  }

  getAllParties(): Observable<Party[]> {
    return this.http.get<Party[]>(this.apiUrl);
  }
}
