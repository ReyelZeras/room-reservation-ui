import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  templateUrl: './admin-users.component.html' 
})
export class AdminUsersComponent implements OnInit {
  users: UserProfile[] = [];
  roomMap: Map<string, string> = new Map();
  isLoading = true;
  message = '';
  errorMessage = '';
  currentUserEmail = '';

  // Filtros
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  filterProvider = '';

  // Variáveis Partilhadas de Modal
  userToModify: UserProfile | null = null;

  // Modal 1: Auditoria de Reservas
  showBookingsModal = false;
  selectedUserForBookings: UserProfile | null = null;
  userBookings: Booking[] = [];
  isLoadingBookings = false;

  // Modal 2: Promover/Rebaixar
  showRoleConfirmModal = false;
  roleToApply = '';

  // Modal 3: Ativar/Inativar
  showStatusConfirmModal = false;
  isSubmittingStatus = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private bookingService: BookingService,
    private roomService: RoomService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = this.authService.currentUserValue?.email || '';
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      users: this.userService.getAllUsers(),
      rooms: this.roomService.getAllRooms()
    }).subscribe({
      next: (result) => {
        this.users = result.users;
        result.rooms.forEach((room: any) => {
          if (room.id) this.roomMap.set(room.id, room.name);
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar os dados do sistema.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getRoomName(roomId: string): string {
    return this.roomMap.get(roomId) || 'Sala Removida / Desconhecida';
  }

  get filteredUsers(): UserProfile[] {
    return this.users.filter(user => {
      const term = this.searchTerm.toLowerCase();
      const matchSearch = !this.searchTerm || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term) || user.username.toLowerCase().includes(term);
      const matchRole = !this.filterRole || user.role === this.filterRole;
      const matchStatus = !this.filterStatus || (this.filterStatus === 'active' ? user.active === true : user.active === false);
      const providerStr = user.provider ? user.provider.toLowerCase() : 'local';
      const matchProvider = !this.filterProvider || providerStr === this.filterProvider.toLowerCase();

      return matchSearch && matchRole && matchStatus && matchProvider;
    });
  }

  openBookingsModal(user: UserProfile): void {
    this.selectedUserForBookings = user;
    this.showBookingsModal = true;
    this.isLoadingBookings = true;
    this.userBookings = [];

    this.bookingService.getMyBookings(user.id).subscribe({
      next: (bookings: Booking[]) => {
        this.userBookings = bookings.sort((a: Booking, b: Booking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingBookings = false;
        this.errorMessage = 'Erro ao carregar o histórico de reservas do utilizador.';
        this.cdr.detectChanges();
      }
    });
  }

  closeBookingsModal(): void {
    this.showBookingsModal = false;
    this.selectedUserForBookings = null;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  openRoleConfirmModal(user: UserProfile, newRole: string): void {
    this.userToModify = user;
    this.roleToApply = newRole;
    this.showRoleConfirmModal = true;
  }

  closeRoleConfirmModal(): void {
    this.showRoleConfirmModal = false;
    this.userToModify = null;
  }

  confirmRoleChange(): void {
    if (!this.userToModify) return;

    this.userService.updateUserRole(this.userToModify.id, this.roleToApply).subscribe({
      next: () => {
        this.message = `Privilégio atualizado para ${this.roleToApply} com sucesso!`;
        this.closeRoleConfirmModal();
        this.loadData();
        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        this.errorMessage = 'Ocorreu um erro ao tentar alterar os privilégios.';
        this.closeRoleConfirmModal();
      }
    });
  }

  openStatusConfirmModal(user: UserProfile): void {
    this.userToModify = user;
    this.showStatusConfirmModal = true;
  }

  closeStatusConfirmModal(): void {
    if (this.isSubmittingStatus) return;
    this.showStatusConfirmModal = false;
    this.userToModify = null;
  }

  confirmStatusChange(): void {
    if (!this.userToModify) return;

    this.isSubmittingStatus = true;
    const isActivating = !this.userToModify.active;

    this.userService.toggleUserStatus(this.userToModify.id).subscribe({
      next: (updatedUser) => {
        this.isSubmittingStatus = false;

        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index].active = updatedUser.active;
        }

        this.message = `A conta foi ${updatedUser.active ? 'ativada' : 'inativada'} com sucesso!`;
        this.closeStatusConfirmModal();
        this.cdr.detectChanges();

        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: () => {
        this.isSubmittingStatus = false;
        this.errorMessage = `Ocorreu um erro ao tentar ${isActivating ? 'ativar' : 'inativar'} a conta.`;
        this.closeStatusConfirmModal();
        this.cdr.detectChanges();
      }
    });
  }
}
