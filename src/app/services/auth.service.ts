import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap, catchError, throwError, of } from 'rxjs';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly API_URL = '/api/v1/auth';

  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(payload: any): Observable<any> {
    return this.http.post('/api/v1/users', payload);
  }

  // FIM DO MOCK! Agora fazemos um POST real enviando e-mail e senha para validação
  login(email: string, password?: string): Observable<any> {
    const payload = { email, password };

    return this.http.post(`${this.API_URL}/login`, payload, { responseType: 'text' }).pipe(
      switchMap(token => {
        localStorage.setItem('token', token);
        const cacheBuster = new Date().getTime();

        return this.http.get<User>(`${this.API_URL}/me?cb=${cacheBuster}`).pipe(
          tap(user => {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
          })
        );
      })
      // REMOVIDO O catchError que quebrava o encadeamento e gerava o loop!
    );
  }

  processSocialLogin(token: string): Observable<any> {
    localStorage.setItem('token', token);
    const cacheBuster = new Date().getTime();

    return this.http.get<User>(`${this.API_URL}/me?cb=${cacheBuster}`).pipe(
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError((err: any) => {
        localStorage.removeItem('token');
        return throwError(() => err);
      })
    );
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.executeLocalLogout();
    });
    setTimeout(() => this.executeLocalLogout(), 500);
  }

  private executeLocalLogout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserSubject.next(null);
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/';
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token.length > 0;
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}
