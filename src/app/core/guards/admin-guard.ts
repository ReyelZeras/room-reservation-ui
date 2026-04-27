import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authService.currentUserValue;

    // Verifica se o usuário está logado E se o cargo dele é Administrador
    if (currentUser && currentUser.role === 'ADMIN') {
      return true; // Acesso Permitido
    }

    // Se não for Admin (ou não estiver logado), chuta para o catálogo de salas
    this.router.navigate(['/rooms']);
    return false; // Acesso Negado
  }
}
