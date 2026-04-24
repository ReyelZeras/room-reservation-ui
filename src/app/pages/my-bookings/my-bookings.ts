import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../models/booking';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  standalone: false
})
export class MyBookingsComponent implements OnInit {
  bookings: BookingResponse[] = [];
  isLoading = true;

  // CORREÇÃO: A variável agora se chama 'errorMessage' exatamente como está no seu HTML!
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchMyBookings();
  }

  fetchMyBookings(): void {
    const userId = this.authService.currentUserValue?.id;

    if (!userId) {
      this.errorMessage = 'Usuário não identificado. Faça login novamente.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = ''; // Limpa a mensagem de erro ao carregar

    this.bookingService.getUserBookings(userId).subscribe({
      next: (data: any) => {
        if (data && data.content && Array.isArray(data.content)) {
          this.bookings = data.content;
        } else if (Array.isArray(data)) {
          this.bookings = data;
        } else {
          this.bookings = [];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar reservas:', err);
        this.errorMessage = 'Falha ao carregar suas reservas.'; // Atualiza a variável correta
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelBooking(bookingId: string): void {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: () => {
          this.fetchMyBookings();
        },
        error: (err: any) => {
          console.error('Erro ao cancelar:', err);
          alert('Não foi possível cancelar a reserva.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
