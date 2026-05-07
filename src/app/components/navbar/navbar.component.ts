import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: false
})
export class NavbarComponent implements OnInit, OnDestroy {
  showNotifications = false;
  notifications: AppNotification[] = [];
  unreadCount = 0;
  isMobileMenuOpen = false;

  private notifSub!: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUserValue?.role === 'ADMIN') {
      this.notificationService.connect();
    }

    this.notifSub = this.notificationService.notifications$.subscribe((notifs: AppNotification[]) => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
      this.cdr.detectChanges();
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      this.notificationService.markAllAsRead();
      this.cdr.detectChanges();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  formatDate(dateStr: any): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.disconnect(); // Desconecta apenas ao fazer logout.
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
    // CRUCIAL: Removemos o this.notificationService.disconnect() daqui.
    // Isso resolve o bug em que a conexão morria ao trocar de página no Angular.
  }
}
