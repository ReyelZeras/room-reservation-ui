import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';
import { RoomService, Room } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
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
            <p class="mt-1 text-sm text-gray-500">Acompanhe e faça a gestão dos seus agendamentos de salas.</p>
          </div>
        </div>

        <!-- 🔍 BARRA DE FILTROS -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex flex-col md:flex-row gap-4">
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Filtrar por Status</label>
            <select [(ngModel)]="filterStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none">
              <option value="">Todos os Status</option>
              <option value="CONFIRMED">Ativas / Confirmadas</option>
              <option value="CANCELLED">Canceladas</option>
            </select>
          </div>
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Filtrar por Período</label>
            <select [(ngModel)]="filterTime" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none">
              <option value="">Todas as Datas</option>
              <option value="future">Próximas Reservas</option>
              <option value="past">Reservas Passadas</option>
            </select>
          </div>
          <div class="w-full md:w-1/3">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Filtrar por Sala</label>
            <select [(ngModel)]="filterRoomId" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 outline-none">
              <option value="">Todas as Salas</option>
              <option *ngFor="let room of availableRooms" [value]="room.id">{{ room.name }}</option>
            </select>
          </div>
        </div>

        <!-- Feedback Messages -->
        <div *ngIf="message" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-100 transition-all">
          {{ message }}
        </div>
        <div *ngIf="errorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-100 transition-all">
          {{ errorMessage }}
        </div>

        <div *ngIf="isLoading" class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div *ngIf="!isLoading && filteredBookings.length === 0" class="bg-white p-10 rounded-lg shadow-sm text-center border border-gray-100">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva encontrada</h3>
          <p class="mt-1 text-sm text-gray-500">Tente alterar os filtros ou faça uma nova reserva no catálogo.</p>
        </div>

        <!-- 🚀 LAYOUT DOS CARDS -->
        <div *ngIf="!isLoading && filteredBookings.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let booking of filteredBookings"
               class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative"
               [ngClass]="{'opacity-75': booking.status === 'CANCELLED'}">

            <div class="h-1 w-full" [ngClass]="booking.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-red-500'"></div>

            <div class="p-5">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-gray-900 truncate pr-4" title="{{ booking.title }}">{{ booking.title || 'Reserva Padrão' }}</h3>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ booking.status === 'CONFIRMED' ? 'CONFIRMADA' : 'CANCELADA' }}
                </span>
              </div>

              <div class="mb-4">
                <p class="text-md font-semibold text-blue-700">{{ getRoomName(booking.roomId) }}</p>
                <p class="text-xs text-gray-400 truncate" title="{{ booking.roomId }}">ID: {{ booking.roomId }}</p>
              </div>

              <div class="space-y-2 bg-gray-50 p-3 rounded-md text-sm border border-gray-100">
                <div class="flex justify-between">
                  <span class="text-gray-500 font-medium">Entrada:</span>
                  <span class="text-gray-900">{{ formatDate(booking.startTime) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500 font-medium">Saída:</span>
                  <span class="text-gray-900">{{ formatDate(booking.endTime) }}</span>
                </div>
              </div>

              <div class="mt-5 pt-4 border-t border-gray-100" *ngIf="booking.status === 'CONFIRMED' && isFutureBooking(booking.startTime)">
                <button (click)="cancelBooking(booking.id!)"
                        class="w-full flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none transition-colors">
                  <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Cancelar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  availableRooms: Room[] = [];
  roomMap: Map<string, string> = new Map();

  isLoading = true;
  message = '';
  errorMessage = '';

  filterStatus = '';
  filterTime = '';
  filterRoomId = '';

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private authService: AuthService, // 🚀 INJETADO PARA PEGAR O USER ID
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const userId = this.authService.currentUserValue?.id;

    if (!userId) {
      this.errorMessage = 'Sessão inválida. Faça login novamente.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // 🚀 ENVIA O USER ID PARA O SERVIÇO DE RESERVAS!
    forkJoin({
      bookings: this.bookingService.getMyBookings(userId),
      rooms: this.roomService.getAllRooms()
    }).subscribe({
      next: (result) => {
        this.bookings = result.bookings;
        this.availableRooms = result.rooms;

        result.rooms.forEach(room => {
          if (room.id) this.roomMap.set(room.id, room.name);
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar as suas reservas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoomName(roomId: string): string {
    return this.roomMap.get(roomId) || 'Sala Desconhecida';
  }

  get filteredBookings(): Booking[] {
    return this.bookings.filter(booking => {
      const matchStatus = !this.filterStatus || booking.status === this.filterStatus;
      const matchRoom = !this.filterRoomId || booking.roomId === this.filterRoomId;

      let matchTime = true;
      if (this.filterTime) {
        const isFuture = this.isFutureBooking(booking.startTime);
        matchTime = this.filterTime === 'future' ? isFuture : !isFuture;
      }

      return matchStatus && matchRoom && matchTime;
    }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  isFutureBooking(dateString: string): boolean {
    return new Date(dateString).getTime() > new Date().getTime();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  cancelBooking(id: string): void {
    if (confirm('Tem a certeza que deseja cancelar esta reserva?')) {
      this.bookingService.cancelBooking(id).subscribe({
        next: () => {
          this.message = 'Reserva cancelada com sucesso!';
          this.errorMessage = '';
          this.loadData();
          setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
        },
        error: (err) => {
          this.errorMessage = err.error?.erro || 'Erro ao cancelar a reserva.';
          this.message = '';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
