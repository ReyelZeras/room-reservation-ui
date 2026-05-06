import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html'
})
export class AboutComponent {

  // Injetamos o AuthService para saber se o visitante está logado
  // Injetamos o Router para o botão de Login funcionar
  constructor(public authService: AuthService, private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
