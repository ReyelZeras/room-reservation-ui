import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rooms',
  standalone: false,
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css']
})
export class RoomsComponent implements OnInit {
  rooms: any[] = [];
  filteredRooms: any[] = [];

  // Filtros
  searchTerm: string = '';
  searchStart: string = '';
  searchEnd: string = '';
  isSearchingAvailability: boolean = false;
  availabilityError: string = '';

  // Modal
  showBookingModal = false;
  selectedRoom: any = null;
  bookingTitle: string = '';
  bookingStart: string = '';
  bookingEnd: string = '';
  errorMessage: string = '';
  showSuccessModal = false;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef // 🚀 INJETADO PARA FORÇAR ATUALIZAÇÃO DA TELA
  ) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isSearchingAvailability = false;
    this.roomService.getAllRooms().subscribe({
      next: (data: any) => {
        this.rooms = data.content ? data.content : data;
        this.filteredRooms = [...this.rooms]; // 🚀 PREENCHE AS SALAS LOGO NO INÍCIO
        this.cdr.detectChanges(); // 🚀 FORÇA O ANGULAR A DESENHAR A TELA
      },
      error: (err: any) => console.error('Erro ao carregar salas', err)
    });
  }

  applyFilters() {
    let tempRooms = [...this.rooms];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      tempRooms = tempRooms.filter(r =>
        (r.name && r.name.toLowerCase().includes(term)) ||
        (r.status && r.status.toLowerCase().includes(term)) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }
    this.filteredRooms = tempRooms;
    this.cdr.detectChanges(); // Força atualização ao digitar
  }

  checkAvailability() {
    this.availabilityError = '';

    if (!this.searchStart || !this.searchEnd) {
      this.availabilityError = 'Preencha início e fim para verificar.';
      return;
    }

    const startStr = this.formatDateForBackend(this.searchStart);
    const endStr = this.formatDateForBackend(this.searchEnd);

    this.bookingService.checkAvailability(startStr, endStr).subscribe({
      next: (data: any) => {
        this.rooms = data.content ? data.content : data;
        this.isSearchingAvailability = true;
        this.applyFilters();
      },
      error: (err: any) => {
        this.availabilityError = 'Erro ao verificar disponibilidade.';
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchStart = '';
    this.searchEnd = '';
    this.availabilityError = '';
    this.loadRooms();
  }

  openBookingModal(room: any) {
    this.selectedRoom = room;
    this.bookingTitle = '';
    this.bookingStart = this.searchStart;
    this.bookingEnd = this.searchEnd;
    this.errorMessage = '';
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedRoom = null;
    this.errorMessage = '';
  }

  formatDateForBackend(dateStr: string): string {
    if (dateStr && dateStr.length === 16) {
      return dateStr + ':00';
    }
    return dateStr;
  }

  confirmBooking() {
    if (!this.bookingTitle) {
      this.errorMessage = "Por favor, insira o título da reserva.";
      return;
    }

    if (!this.bookingStart || !this.bookingEnd) {
       this.errorMessage = "Por favor, preencha as datas de início e fim.";
       return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const payload = {
      userId: userId,
      roomId: this.selectedRoom.id,
      title: this.bookingTitle,
      startTime: this.formatDateForBackend(this.bookingStart),
      endTime: this.formatDateForBackend(this.bookingEnd)
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.closeBookingModal();
        this.showSuccessModal = true;
        if (this.isSearchingAvailability) {
           this.checkAvailability();
        } else {
           this.loadRooms();
        }
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Erro ao criar reserva. Horário indisponível.';
        this.cdr.detectChanges();
      }
    });
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}
