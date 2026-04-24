import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { Room } from '../../models/room';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.html',
  standalone: false
})
export class RoomsComponent implements OnInit {

  rooms: Room[] = [];
  isLoading = true;
  error = '';

  selectedRoom: Room | null = null;
  bookingForm: FormGroup;
  isSubmittingBooking = false;

  bookingSuccessMessage = '';
  bookingErrorMessage = ''; // NOVA VARIÁVEL DE ERRO

  constructor(
    public authService: AuthService,
    private roomService: RoomService,
    private bookingService: BookingService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.bookingForm = this.fb.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.isLoading = true;
    this.error = '';

    this.roomService.getAllRooms().subscribe({
      next: (data: any) => {
        if (data && data.content && Array.isArray(data.content)) {
          this.rooms = data.content;
        } else if (Array.isArray(data)) {
           this.rooms = data;
        } else {
           this.rooms = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar salas:', err);
        this.error = 'Falha ao carregar o catálogo de salas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'AVAILABLE': 'Disponível',
      'OCCUPIED': 'Ocupada',
      'MAINTENANCE': 'Manutenção'
    };
    return statusMap[status] || status;
  }

  openBookingModal(room: Room): void {
    this.selectedRoom = room;
    this.bookingForm.reset();
    this.bookingSuccessMessage = '';
    this.bookingErrorMessage = ''; // Limpa o erro ao abrir modal
  }

  closeBookingModal(): void {
    this.selectedRoom = null;
    this.isSubmittingBooking = false;
  }

  submitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedRoom) return;

    this.isSubmittingBooking = true;
    this.bookingErrorMessage = ''; // Zera o erro antes de enviar

    let start = this.bookingForm.value.startTime;
    let end = this.bookingForm.value.endTime;
    if (start && start.length === 16) start += ':00';
    if (end && end.length === 16) end += ':00';

    // CORREÇÃO: Capturamos o ID e validamos para satisfazer o "Strict Mode" do TypeScript
    const userId = this.authService.currentUserValue?.id;

    if (!userId) {
      this.bookingErrorMessage = 'Usuário não identificado. Por favor, faça login novamente.';
      this.isSubmittingBooking = false;
      this.cdr.detectChanges();
      return;
    }

    const payload = {
      userId: userId, // Agora o compilador tem a certeza de que isto é uma string
      roomId: this.selectedRoom.id,
      startTime: start,
      endTime: end
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.isSubmittingBooking = false;
        this.bookingSuccessMessage = 'Sala reservada com sucesso! 🎉';
        this.cdr.detectChanges();

        setTimeout(() => {
          this.closeBookingModal();
          this.fetchRooms();
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao reservar sala:', err);
        // REMOVIDO: alert()
        // INSERIDO: Feedback visual integrado
        this.bookingErrorMessage = 'O horário selecionado está indisponível ou a sala já foi reservada.';
        this.isSubmittingBooking = false;
        this.cdr.detectChanges();
      }
    });
  }
}
