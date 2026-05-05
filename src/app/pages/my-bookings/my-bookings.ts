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

        <div *ngIf="message" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium shadow-sm border border-green-100">
          {{ message }}
        </div>
        <div *ngIf="errorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium shadow-sm border border-red-100">
          {{ errorMessage }}
        </div>

        <!-- BARRA DE PESQUISA E FILTROS -->
        <div class="mb-6 space-y-4">
          <div>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Pesquisar por nome da reserva ou nome da sala..." class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm">
          </div>
          <div class="flex gap-2 overflow-x-auto pb-2">
            <button (click)="applyFilters('ALL')" [ngClass]="filterStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'" class="px-4 py-2 rounded-md text-sm font-medium transition-colors">Todas</button>
            <button (click)="applyFilters('CONFIRMED')" [ngClass]="filterStatus === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'" class="px-4 py-2 rounded-md text-sm font-medium transition-colors">Confirmadas</button>
            <button (click)="applyFilters('PENDING')" [ngClass]="filterStatus === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 border border-gray-300'" class="px-4 py-2 rounded-md text-sm font-medium transition-colors">Pendentes</button>
            <button (click)="applyFilters('CANCELLED')" [ngClass]="filterStatus === 'CANCELLED' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'" class="px-4 py-2 rounded-md text-sm font-medium transition-colors">Canceladas</button>
          </div>
        </div>

        <div *ngIf="!isLoading && filteredBookings.length === 0" class="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200">
          Nenhuma reserva encontrada.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!isLoading">
          <div *ngFor="let booking of filteredBookings" class="bg-white rounded-xl shadow-sm border-l-4 p-6"
               [ngClass]="{'border-green-500': booking.status === 'CONFIRMED', 'border-red-500': booking.status === 'CANCELLED', 'border-yellow-500': booking.status === 'PENDING'}">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-xl font-bold text-gray-900 line-clamp-1" [title]="booking.title">{{ booking.title || 'Reserva' }}</h2>
              <span class="text-xs font-bold px-2 py-1 rounded" [ngClass]="{'bg-green-100 text-green-800': booking.status === 'CONFIRMED', 'bg-red-100 text-red-800': booking.status === 'CANCELLED', 'bg-yellow-100 text-yellow-800': booking.status === 'PENDING'}">
                {{ booking.status }}
              </span>
            </div>

            <div class="space-y-2 text-sm text-gray-600 mb-6">
              <p><span class="font-semibold">Sala:</span> {{ getRoomName(booking.roomId) }}</p>
              <p><span class="font-semibold">Início:</span> {{ formatDate(booking.startTime) }}</p>
              <p><span class="font-semibold">Fim:</span> {{ formatDate(booking.endTime) }}</p>
            </div>

            <div class="flex gap-2 pt-4 border-t border-gray-100" *ngIf="booking.status !== 'CANCELLED'">
              <button (click)="openRescheduleModal(booking)" class="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 font-medium py-2 rounded text-sm transition text-center">Remarcar</button>
              <button (click)="openCancelModal(booking)" class="flex-1 bg-white text-red-600 hover:bg-red-50 border border-red-200 font-medium py-2 rounded text-sm transition text-center">Cancelar</button>
            </div>
          </div>
        </div>

        <!-- SEU MODAL ORIGINAL DE CANCELAR -->
        <div *ngIf="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4">
            <h3 class="text-xl font-bold text-gray-900 mb-2 text-center">Cancelar Reserva</h3>
            <p class="text-sm text-gray-600 mb-6 text-center">Deseja cancelar a reserva <strong>{{ bookingToCancel?.title }}</strong>?</p>
            <div class="flex justify-end gap-2">
              <button (click)="closeCancelModal()" [disabled]="isCancelling" class="flex-1 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50">Voltar</button>
              <button (click)="confirmCancellation()" [disabled]="isCancelling" class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium disabled:opacity-50">{{ isCancelling ? 'Processando...' : 'Confirmar' }}</button>
            </div>
          </div>
        </div>

        <!-- NOVO MODAL: REMARCAR -->
        <div *ngIf="showRescheduleModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4">
            <h3 class="text-xl font-bold mb-4 text-gray-900">Remarcar Horário</h3>
            <div *ngIf="rescheduleErrorMessage" class="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm border border-red-200">{{ rescheduleErrorMessage }}</div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Novo Início</label>
                <input type="datetime-local" [(ngModel)]="newStart" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Novo Fim</label>
                <input type="datetime-local" [(ngModel)]="newEnd" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
            </div>

            <div class="mt-8 flex justify-end gap-2">
              <button (click)="closeRescheduleModal()" [disabled]="isRescheduling" class="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium">Cancelar</button>
              <button (click)="confirmReschedule()" [disabled]="isRescheduling" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">{{ isRescheduling ? 'Salvando...' : 'Salvar' }}</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  filterStatus: string = 'ALL';
  searchTerm: string = ''; // Nova variável da barra de pesquisa
  roomMap: Map<string, string> = new Map();
  isLoading = true;
  message = '';
  errorMessage = '';

  // Cancelamento
  showCancelModal = false;
  bookingToCancel: Booking | null = null;
  isCancelling = false;

  // Remarcação
  showRescheduleModal = false;
  bookingToReschedule: Booking | null = null;
  newStart: string = '';
  newEnd: string = '';
  rescheduleErrorMessage = '';
  isRescheduling = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    forkJoin({
      bookings: this.bookingService.getMyBookings(userId),
      rooms: this.roomService.getAllRooms()
    }).subscribe({
      next: (result: any) => {
        const roomsData = result.rooms.content ? result.rooms.content : result.rooms;
        roomsData.forEach((r: any) => this.roomMap.set(r.id, r.name));

        const bookingsData = result.bookings.content ? result.bookings.content : result.bookings;
        this.bookings = bookingsData.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

        this.applyFilters('ALL'); // Aplica o filtro preenchendo o array
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os dados.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoomName(roomId: string): string {
    return this.roomMap.get(roomId) || 'Sala Indisponível';
  }

  // --- NOVA FUNCIONALIDADE: Filtro combinado (Status + Pesquisa por Texto) ---
  applyFilters(status?: string) {
    if (status) this.filterStatus = status;

    let temp = [...this.bookings];

    if (this.filterStatus !== 'ALL') {
      temp = temp.filter(b => b.status === this.filterStatus);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(b => {
        const roomName = this.getRoomName(b.roomId).toLowerCase();
        const title = (b.title || '').toLowerCase();
        return title.includes(term) || roomName.includes(term);
      });
    }

    this.filteredBookings = temp;
    this.cdr.detectChanges();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // --- O SEU CÓDIGO DE CANCELAMENTO INTACTO ---
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
    if (!this.bookingToCancel || !this.bookingToCancel.id) return;
    this.isCancelling = true;
    this.bookingService.cancelBooking(this.bookingToCancel.id).subscribe({
      next: () => {
        this.isCancelling = false;
        this.message = 'Reserva cancelada com sucesso!';
        this.closeCancelModal();
        this.loadData();
        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.isCancelling = false;
        this.errorMessage = 'Erro ao cancelar a reserva.';
        this.closeCancelModal();
        this.cdr.detectChanges();
        setTimeout(() => { this.errorMessage = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }

  // --- LÓGICA DE REMARCAÇÃO ---
  openRescheduleModal(booking: Booking): void {
    this.bookingToReschedule = booking;
    this.newStart = booking.startTime ? booking.startTime.substring(0, 16) : '';
    this.newEnd = booking.endTime ? booking.endTime.substring(0, 16) : '';
    this.rescheduleErrorMessage = '';
    this.showRescheduleModal = true;
  }

  closeRescheduleModal(): void {
    if (this.isRescheduling) return;
    this.showRescheduleModal = false;
    this.bookingToReschedule = null;
  }

  formatDateForBackend(dateStr: string): string {
    if (dateStr && dateStr.length === 16) return dateStr + ':00';
    return dateStr;
  }

  confirmReschedule(): void {
    if (!this.bookingToReschedule || !this.bookingToReschedule.id) return;
    if (!this.newStart || !this.newEnd) {
      this.rescheduleErrorMessage = "Preencha as novas datas.";
      return;
    }

    const startDate = new Date(this.newStart);
    const endDate = new Date(this.newEnd);
    const now = new Date();

    if (startDate < now) {
      this.rescheduleErrorMessage = "O Início não pode ser no passado.";
      return;
    }
    if (startDate >= endDate) {
      this.rescheduleErrorMessage = "O Início deve ser antes do Fim.";
      return;
    }

    this.isRescheduling = true;
    this.cdr.detectChanges();

    const startStr = this.formatDateForBackend(this.newStart);
    const endStr = this.formatDateForBackend(this.newEnd);

    this.bookingService.rescheduleBooking(this.bookingToReschedule.id, startStr, endStr).subscribe({
      next: () => {
        this.isRescheduling = false;
        this.message = 'Reserva remarcada com sucesso!';
        this.closeRescheduleModal();
        this.loadData();
        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: (err: any) => {
        this.isRescheduling = false;
        this.rescheduleErrorMessage = err.status === 409 ? 'Conflito! Sala ocupada.' : 'Erro ao remarcar.';
        this.cdr.detectChanges();
      }
    });
  }
}
