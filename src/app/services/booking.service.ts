import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: string;
  userId?: string;
  roomId: string;
  title: string;
  startTime: string;
  endTime: string;
  status?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/v1/bookings';

  constructor(private http: HttpClient) {}

  // CORREÇÃO 1: Exige o userId e bate na rota correta do Backend
  getMyBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  createBooking(booking: any): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  // CORREÇÃO 2: O seu Backend espera um DELETE e não um PUT
  cancelBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/cancel`);
  }
}
