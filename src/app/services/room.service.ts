import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = '/api/v1/rooms';

  constructor(private http: HttpClient) {}

  // MÉTODO ADICIONADO PARA RESOLVER O ERRO
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRoomById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}