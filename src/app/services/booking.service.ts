import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse } from '../models/booking';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Aponta para o API Gateway, que roteia para o booking-service
  private readonly API_URL = '/api/v1/bookings';

  constructor(private http: HttpClient) { }

  createBooking(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.API_URL, request);
  }
}
