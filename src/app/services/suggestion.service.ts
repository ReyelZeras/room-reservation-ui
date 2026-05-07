import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Suggestion {
  name: string;
  description: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  // CORREÇÃO: URL Relativa
  private apiUrl = '/api/v1/suggestions';

  constructor(private http: HttpClient) {}

  getTopSuggestions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
