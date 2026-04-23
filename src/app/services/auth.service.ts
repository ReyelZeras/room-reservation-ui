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

  // Mantemos o /api por causa do nosso Proxy
  private readonly API_URL = '/api/v1/auth';

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // ATENÇÃO: Mudamos de Observable<AuthResponse> para Observable<any>
  login(email: string, password?: string): Observable<any> {

    // O SEGREDO ESTÁ AQUI: { responseType: 'text' }
    return this.http.get(`${this.API_URL}/dev/token?email=${email}`, { responseType: 'text' }).pipe(
      tap((token: string) => {
        // Guarda o token real do Java no navegador
        localStorage.setItem('token', token);

        // Como o /dev/token só nos devolve a string, vamos simular o objeto do usuário na tela
        const user: User = {
          id: '1',
          name: email.split('@')[0], // Pega a primeira parte do email para ser o nome
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
