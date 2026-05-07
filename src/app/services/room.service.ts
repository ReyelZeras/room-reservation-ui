import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  // CORREÇÃO: URL Relativa
  private apiUrl = '/api/v1/rooms';

  constructor(private http: HttpClient) {}

  getAllRooms(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAvailableRooms(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available`);
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: string, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
