import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false
})
export class NavbarComponent {

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}