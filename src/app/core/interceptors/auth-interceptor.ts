import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor { // Mantenha o nome da classe que já estava no seu arquivo
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Injeta o token em todas as requisições
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        // A MÁGICA: Se for Erro 401, faz logout SOMENTE SE a requisição NÃO FOR a de login!
        if (err.status === 401 && !request.url.includes('/auth/login')) {
          this.authService.logout();
        }
        return throwError(() => err);
      })
    );
  }
}
