import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  title?: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/v1/bookings';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(this.apiUrl, bookingData);
  }

  getMyBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/user/${userId}`);
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${bookingId}/cancel`);
  }

  checkAvailability(start: string, end: string): Observable<any[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<any[]>(`${this.apiUrl}/availability`, { params });
  }

  rescheduleBooking(id: string, newStart: string, newEnd: string): Observable<any> {
    const params = new HttpParams().set('newStart', newStart).set('newEnd', newEnd);
    return this.http.patch<any>(`${this.apiUrl}/${id}/reschedule`, null, { params });
  }

  // --- NOVA FUNCIONALIDADE: Buscar Reservas Específicas de Uma Sala ---
  getRoomBookings(roomId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/room/${roomId}`);
  }
}
