import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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

  private notifSub!: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef // Injetor de Atualização Visual!
  ) {}

  ngOnInit(): void {
    // A Navbar fica à escuta. Assim que a notificação chega, atualiza o ecrã na hora!
    this.notifSub = this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
      this.cdr.detectChanges(); // 🚀 FORÇA A TELA A ATUALIZAR A BOLINHA VERMELHA
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications && this.unreadCount > 0) {
      this.notificationService.markAllAsRead();
      this.cdr.detectChanges();
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.notifSub) this.notifSub.unsubscribe();
  }
}
