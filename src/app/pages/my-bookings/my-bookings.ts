import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-bookings',
  standalone: false,
  templateUrl: './my-bookings.component.html' // CORREÇÃO: Apontando para o ficheiro HTML externo
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  filterStatus: string = 'ALL';
  searchTerm: string = '';
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

        this.applyFilters('ALL');
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
