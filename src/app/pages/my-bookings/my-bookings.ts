import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  standalone: false
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;
  errorMessage = '';
  
  showConfirmModal = false;
  bookingToCancel: string | null = null;
  isCancelling = false;

  constructor(
    private bookingService: BookingService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.errorMessage = 'Utilizador não autenticado.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.bookingService.getBookingsByUser(userId).subscribe({
      next: (data: any) => { 
        this.bookings = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => { 
        this.isLoading = false;
        
        // Se a API retornou Status 200/204 mas sem dados (Empty Body), não é erro real
        if (err.status === 200 || err.status === 204) {
           this.bookings = [];
        } else {
           console.error('Erro ao carregar histórico', err);
           this.errorMessage = 'Não foi possível carregar o seu histórico de reservas.';
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  openCancelModal(id: string): void {
    this.bookingToCancel = id;
    this.showConfirmModal = true;
  }

  closeCancelModal(): void {
    this.showConfirmModal = false;
    this.bookingToCancel = null;
    this.isCancelling = false;
  }

  confirmCancel(): void {
    if (!this.bookingToCancel) return;
    
    this.isCancelling = true;
    this.cdr.detectChanges();
    
    this.bookingService.cancelBooking(this.bookingToCancel).subscribe({
      next: () => {
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (err: any) => { 
        console.error(err);
        
        if (err.status === 200 || err.status === 204) {
            this.closeCancelModal();
            this.loadBookings();
            return;
        }
        
        alert('Não foi possível cancelar a reserva.');
        this.closeCancelModal();
      }
    });
  }
}