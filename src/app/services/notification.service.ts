import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppNotification {
  id?: string;
  message: string;
  read: boolean;
  roomName?: string;
  userName?: string;
  createdAt?: string;
  startTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  private notificationsSubject = new Subject<AppNotification[]>();
  public notifications$ = this.notificationsSubject.asObservable();
  private notifications: AppNotification[] = [];

  constructor(private zone: NgZone) {}

  connect() {
    if (this.eventSource && this.eventSource.readyState !== 2) {
      return;
    }

    console.log('Tentando conectar ao SSE (Modo Ciclo Curto)...');
    this.eventSource = new EventSource('/api/v1/notifications/stream');

    this.eventSource.onopen = () => { console.log('✅ SSE Conectado. Aguardando evento...'); };

    this.eventSource.addEventListener('notification', (event: any) => {
      this.zone.run(() => {
        console.log('🔔 MENSAGEM SSE REAL CHEGOU:', event.data);
        const data = JSON.parse(event.data);
        const notif: AppNotification = {
          message: data.message || 'Nova notificação',
          read: false,
          roomName: data.roomName,
          userName: data.userName,
          createdAt: data.createdAt,
          startTime: data.startTime
        };
        this.notifications.unshift(notif);
        this.notificationsSubject.next([...this.notifications]);
      });
    });

    this.eventSource.onerror = (error) => {
      // Como o backend vai fechar a conexão de propósito após 1 evento,
      // este erro vai disparar. Nós apenas mandamos reconectar na hora!
      this.disconnect();
      setTimeout(() => this.connect(), 1000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.notifications]);
  }
}
