import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/v1/bookings';

  constructor(private http: HttpClient) {}

  createBooking(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  // MÉTODO ADICIONADO PARA BUSCAR HISTÓRICO DO USUÁRIO
  getBookingsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // MÉTODO ADICIONADO PARA CANCELAR RESERVA
  cancelBooking(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/cancel`);
  }
}