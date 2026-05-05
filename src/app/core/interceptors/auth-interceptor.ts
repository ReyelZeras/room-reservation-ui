import { Injectable, isDevMode } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Recupera o token do seu AuthService original intacto
    const token = this.authService.getToken();

    let authReq = request;

    // 2. Injeta o Header de Autorização
    if (token) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. MÁGICA DA PRODUÇÃO (PREPARAÇÃO PARA FASE 5)
    // Se for build de produção e a URL estiver chumbada como localhost nos services,
    // nós cortamos o domínio e enviamos como rota relativa para o Nginx resolver.
    if (!isDevMode() && authReq.url.startsWith('http://localhost:8080')) {
      const prodUrl = authReq.url.replace('http://localhost:8080', '');
      authReq = authReq.clone({ url: prodUrl });
    }

    return next.handle(authReq);
  }
}
