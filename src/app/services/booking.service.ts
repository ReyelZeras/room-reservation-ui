import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly API_URL = '/api/v1/bookings';

  constructor(private http: HttpClient) { }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.API_URL, request);
  }

  // NOVO: Buscar reservas de um usuário específico
  getUserBookings(userId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/user/${userId}`);
  }

  // NOVO: Cancelar reserva
  cancelBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${bookingId}`);
  }
}
