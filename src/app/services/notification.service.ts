import { Injectable, NgZone } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

// ERRO DE COMPILAÇÃO CORRIGIDO: As datas agora são obrigatórias na tipagem
export interface AppNotification {
  userName: string;
  roomName: string;
  title?: string;
  createdAt: string;
  startTime: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private eventSource: EventSource | null = null;
  public notificationSubject = new Subject<any>();

  private notificationsListSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsListSubject.asObservable();

  constructor(private authService: AuthService, private zone: NgZone) {}

  connect(): void {
    const user = this.authService.currentUserValue;
    if (!user || user.role !== 'ADMIN') return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    console.log('📡 [SSE] Tentando conectar ao canal de Notificações...');
    this.eventSource = new EventSource('/api/v1/notifications/stream');

    this.eventSource.onopen = () => {
      console.log('🟢 [SSE] Conectado com sucesso! À escuta de reservas...');
    };

    //  O NgZone força a tela a atualizar assim que o sinal chega
    this.eventSource.addEventListener('nova-reserva', (event: any) => {
      this.zone.run(() => {
        console.log('🔔 [SSE] EVENTO RECEBIDO NO FRONT-END:', event.data);
        if (event.data) {
          const data = JSON.parse(event.data);
          this.notificationSubject.next(data);

          const newNotification: AppNotification = {
            ...data,
            read: false
          };

          const currentNotifs = this.notificationsListSubject.value;
          this.notificationsListSubject.next([newNotification, ...currentNotifs]);
        }
      });
    });

    this.eventSource.addEventListener('ping', () => {});

    this.eventSource.onerror = (error) => {
      console.error('🔴 [SSE] Conexão perdida. Tentando reconectar...', error);
      this.eventSource?.close();
      setTimeout(() => this.connect(), 5000);
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  markAllAsRead(): void {
    const currentNotifs = this.notificationsListSubject.value;
    const updatedNotifs = currentNotifs.map(n => ({ ...n, read: true }));
    this.notificationsListSubject.next(updatedNotifs);
  }
}
