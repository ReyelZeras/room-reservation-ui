import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly API_URL = '/api/v1/auth';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password?: string): Observable<any> {
    return this.http.get(`${this.API_URL}/dev/token?email=${email}`, { responseType: 'text' }).pipe(
      tap((token: string) => {
        localStorage.setItem('token', token);

        // CORREÇÃO AQUI: Usando um UUID real do seu banco para o mock não explodir o Booking Service
        // Usei o ID do "admin@atualizado.com" que você me enviou no chat anterior.
        const user: User = {
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          name: email.split('@')[0],
          email: email,
          role: 'ADMIN'
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
