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
    this.router.navigate(['/login']);
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
  }

  closeBookingModal(): void {
    this.selectedRoom = null;
    this.isSubmittingBooking = false;
  }

  submitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedRoom) return;

    this.isSubmittingBooking = true;

    // CORREÇÃO DO FORMATO DE DATA (Garante que tenha os segundos :00 no final)
    let start = this.bookingForm.value.startTime;
    let end = this.bookingForm.value.endTime;
    if (start && start.length === 16) start += ':00';
    if (end && end.length === 16) end += ':00';

    const payload = {
      // Garantindo um fallback em caso de falha do localStorage
      userId: this.authService.currentUserValue?.id || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      roomId: this.selectedRoom.id,
      startTime: start,
      endTime: end
    };

    console.log('Enviando Payload para o Backend:', payload);

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.isSubmittingBooking = false;
        this.bookingSuccessMessage = 'Sala reservada com sucesso! 🎉';

        this.cdr.detectChanges(); // <--- ADICIONE ESTA LINHA AQUI!

        setTimeout(() => {
          this.closeBookingModal();
          this.fetchRooms();
        }, 2000);
      },
      error: (err) => {
        console.error('Erro ao reservar sala:', err);
        alert('Erro ao tentar reservar. Verifique o console (F12) para detalhes.');
        this.isSubmittingBooking = false;
      }
    });
  }
}
