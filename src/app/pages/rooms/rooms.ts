import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.html',
  standalone: false
})
export class RoomsComponent implements OnInit {
  rooms: any[] = [];
  isLoading = true;

  selectedRoom: any = null;
  isModalOpen = false;
  bookingForm: FormGroup;
  isSubmittingBooking = false;

  bookingErrorMessage = '';
  bookingSuccessMessage = '';

  minDate: string = '';

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.bookingForm = this.fb.group({
      title: ['', Validators.required], // O TÍTULO FOI ADICIONADO AQUI
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRooms();

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minDate = now.toISOString().slice(0, 16);
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data: any) => {
        this.rooms = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar salas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openBookingModal(room: any): void {
    this.selectedRoom = room;
    this.isModalOpen = true;
    this.bookingErrorMessage = '';
    this.bookingSuccessMessage = '';
    this.bookingForm.reset();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedRoom = null;
    this.bookingErrorMessage = '';
  }

  submitBooking(): void {
    if (this.bookingForm.invalid || !this.selectedRoom) return;

    this.isSubmittingBooking = true;
    this.bookingErrorMessage = '';
    this.cdr.detectChanges();

    let start = this.bookingForm.value.startTime;
    let end = this.bookingForm.value.endTime;

    if (start && start.length === 16) start += ':00';
    if (end && end.length === 16) end += ':00';

    const userId = this.authService.currentUserValue?.id;

    if (!userId) {
      this.bookingErrorMessage = 'Sessão expirada. Por favor, faça login novamente.';
      this.isSubmittingBooking = false;
      this.cdr.detectChanges();
      return;
    }

    // 🚀 A CORREÇÃO ESTÁ AQUI: Enviamos o title no payload!
    const payload = {
      userId: userId,
      roomId: this.selectedRoom.id,
      title: this.bookingForm.value.title,
      startTime: start,
      endTime: end
    };

    this.bookingService.createBooking(payload).subscribe({
      next: () => {
        this.processBookingSuccess();
      },
      error: (err: any) => {
        this.isSubmittingBooking = false;

        // Falso erro do Angular (Problema de Parse do JSON em Status 201)
        if (err.status === 201 || err.status === 200) {
            this.processBookingSuccess();
            return;
        }

        // Erro 422 Genuíno (Sala ocupada)
        if (err.status === 422) {
           this.bookingErrorMessage = err.error?.erro || 'A sala já está reservada para o período selecionado.';
        } else {
           this.bookingErrorMessage = err.error?.message || 'Ocorreu um erro ao processar a sua reserva.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  private processBookingSuccess(): void {
    this.isSubmittingBooking = false;
    this.closeModal();
    this.bookingSuccessMessage = 'Reserva concluída com sucesso!';
    this.cdr.detectChanges();

    setTimeout(() => {
      this.bookingSuccessMessage = '';
      this.cdr.detectChanges();
    }, 5000);
  }
}
