import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <div class="md:flex md:items-center md:justify-between mb-6">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Minhas Reservas</h2>
            <p class="mt-1 text-sm text-gray-500">Acompanhe o historico e o status dos seus agendamentos.</p>
          </div>
        </div>

        <div *ngIf="message" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium transition-all shadow-sm border border-green-100">
          {{ message }}
        </div>
        <div *ngIf="errorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium transition-all shadow-sm border border-red-100">
          {{ errorMessage }}
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
           <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           <p class="mt-4 text-gray-500">A carregar as suas reservas...</p>
        </div>

        <div *ngIf="!isLoading && bookings.length === 0" class="text-center bg-white rounded-lg shadow py-12 border border-gray-200">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
          <p class="mt-1 text-sm text-gray-500">Voce ainda nao agendou nenhuma sala.</p>
        </div>

        <div *ngIf="!isLoading && bookings.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let bk of bookings" class="bg-white overflow-hidden shadow rounded-lg ring-1 ring-black ring-opacity-5 flex flex-col transition-all hover:shadow-md">
            <div class="px-4 py-5 sm:p-6 flex-grow">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg leading-6 font-bold text-gray-900 truncate pr-2">{{ bk.title || 'Reserva Padrao' }}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0"
                      [ngClass]="bk.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ bk.status }}
                </span>
              </div>
              <p class="text-sm font-bold text-blue-600 mb-4">{{ getRoomName(bk.roomId) }}</p>

              <div class="space-y-3">
                <div class="text-sm text-gray-700 flex items-center">
                  <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <div>
                    <span class="font-semibold text-gray-500 text-xs uppercase tracking-wider block">Inicio</span>
                    {{ formatDate(bk.startTime) }}
                  </div>
                </div>
                <div class="text-sm text-gray-700 flex items-center">
                  <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <span class="font-semibold text-gray-500 text-xs uppercase tracking-wider block">Fim</span>
                    {{ formatDate(bk.endTime) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
              <button *ngIf="bk.status === 'CONFIRMED'" (click)="openCancelModal(bk)"
                      class="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                Cancelar Reserva
              </button>
              <div *ngIf="bk.status === 'CANCELLED'" class="w-full flex justify-center items-center py-2 text-sm text-gray-500 font-medium italic">
                Operacao Cancelada
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showCancelModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeCancelModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">Cancelar Reserva</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Tem certeza que deseja cancelar a reserva <strong class="text-gray-800">{{ bookingToCancel?.title || 'desta sala' }}</strong>?
                      <br><br>
                      Esta ação não pode ser desfeita e o horário ficará disponível para outros colaboradores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="confirmCancellation()" [disabled]="isCancelling"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50">
                {{ isCancelling ? 'A cancelar...' : 'Sim, cancelar' }}
              </button>
              <button type="button" (click)="closeCancelModal()" [disabled]="isCancelling"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50">
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  roomMap: Map<string, string> = new Map();
  isLoading = true;
  message = '';
  errorMessage = '';

  // Variaveis de controle do Modal
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  isCancelling = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    // Busca as salas e as reservas em paralelo para o mapeamento
    forkJoin({
      rooms: this.roomService.getAllRooms(),
      bookings: this.bookingService.getMyBookings(currentUser.id)
    }).subscribe({
      next: (result: any) => {
        result.rooms.forEach((r: any) => this.roomMap.set(r.id, r.name));
        this.bookings = result.bookings.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar as informacoes. Tente novamente.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoomName(roomId: string): string {
    return this.roomMap.get(roomId) || 'Sala Indisponivel / Removida';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // --- Funcoes do Modal ---
  openCancelModal(booking: Booking): void {
    this.bookingToCancel = booking;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;
    this.showCancelModal = false;
    this.bookingToCancel = null;
  }

  confirmCancellation(): void {
    // Adicionada a validação do ID para satisfazer o strict mode do TypeScript
    if (!this.bookingToCancel || !this.bookingToCancel.id) return;

    this.isCancelling = true;
    this.bookingService.cancelBooking(this.bookingToCancel.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.message = 'Reserva cancelada com sucesso!';
        this.closeCancelModal();
        this.loadData(); // Recarrega a grelha para atualizar o status

        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.isCancelling = false;
        this.errorMessage = 'Ocorreu um erro ao tentar cancelar a reserva.';
        this.closeCancelModal();
        this.cdr.detectChanges();

        setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }
}
