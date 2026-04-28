import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface AppNotification {
  id: string;
  roomName: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime: string;
  status: string;
  read: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private eventSource: EventSource | null = null;

  constructor(private zone: NgZone, private authService: AuthService) {
    this.authService.currentUser$.subscribe((user: any) => {
      if (user && user.role === 'ADMIN') {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect() {
    if (this.eventSource) return;

    console.log('📡 [SSE] Tentando conectar ao canal de Notificações...');
    this.eventSource = new EventSource('/api/v1/notifications/stream');

    // Avisa-nos quando a conexão é aceite pelo servidor
    this.eventSource.onopen = () => {
      console.log('🟢 [SSE] Conectado com sucesso! À escuta de reservas...');
    };

    // Ouve especificamente o evento com o nome "nova-reserva"
    this.eventSource.addEventListener('nova-reserva', (event: any) => {
      console.log('🔔 [SSE] Nova reserva chegou do Servidor!', event.data);

      this.zone.run(() => {
        const data = JSON.parse(event.data);
        const newNotification: AppNotification = { ...data, read: false };

        const currentNotifs = this.notificationsSubject.value;
        this.notificationsSubject.next([newNotification, ...currentNotifs]);
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('🔴 [SSE] Erro/Queda na rede. Tentando reconectar...', error);
    };
  }

  private disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('🔌 [SSE] Desconectado do canal de Notificações.');
    }
  }

  markAllAsRead() {
    const currentNotifs = this.notificationsSubject.value;
    currentNotifs.forEach(n => n.read = true);
    this.notificationsSubject.next([...currentNotifs]);
  }
}
