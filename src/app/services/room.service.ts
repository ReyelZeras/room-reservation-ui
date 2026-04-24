import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  // A URL que o nosso proxy vai redirecionar para a porta 8080
  private readonly API_URL = '/api/v1/rooms';

  constructor(private http: HttpClient) { }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.API_URL);
  }
}
