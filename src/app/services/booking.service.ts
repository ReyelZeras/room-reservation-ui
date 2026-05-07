import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: string;
  userId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  status: string;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // CORREÇÃO: URL Relativa
  private apiUrl = '/api/v1/bookings';

  constructor(private http: HttpClient) {}

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(this.apiUrl, bookingData);
  }

  getMyBookings(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  getUserBookings(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }

  cancelBooking(bookingId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${bookingId}/cancel`);
  }

  checkAvailability(start: string, end: string): Observable<any[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<any[]>(`${this.apiUrl}/availability`, { params });
  }

  rescheduleBooking(id: string, newStart: string, newEnd: string): Observable<any> {
    let params = new HttpParams().set('newStart', newStart).set('newEnd', newEnd);
    return this.http.patch<any>(`${this.apiUrl}/${id}/reschedule`, null, { params });
  }

  getRoomBookings(roomId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/room/${roomId}`);
  }
}
