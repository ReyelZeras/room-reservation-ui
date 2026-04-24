import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_URL = '/api/v1/auth';
  private readonly USERS_URL = '/api/v1/users';

  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Utilizando a rota de dev/token documentada no Swagger do User Service
  login(email: string, password?: string): Observable<any> {
    return this.http.get(`${this.AUTH_URL}/dev/token`, {
      params: { email: email },
      responseType: 'text'
    }).pipe(
      map(tokenString => {
         return { token: tokenString };
      }),
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          const userData = { email: email, name: email.split('@')[0], token: response.token };
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.currentUserSubject.next(userData);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(this.USERS_URL, userData);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
