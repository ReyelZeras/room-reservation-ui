import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { Suggestion } from '../models/suggestion';

@Injectable({
  providedIn: 'root'
})
export class SuggestionService {
  // CORREÇÃO: Alterado de 'vl' (letra L) para 'v1' (número 1)
  private readonly API_URL = '/api/v1/suggestions';

  constructor (private http: HttpClient) { }

  getTopSuggestions(): Observable<Suggestion[]> {
    return this.http.get<Suggestion[]>(this.API_URL).pipe(
      timeout(5000),
      catchError(err => {
        console.error('Erro ao buscar sugestões no Quarkus:', err);
        return throwError(() => err);
      })
    );
  }
}
