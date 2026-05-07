import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { BookingService, Booking } from '../../services/booking.service';


@Component({
  selector: 'app-admin-rooms',
  standalone: false,
  templateUrl: './admin-rooms.component.html'
})
export class AdminRoomsComponent implements OnInit {
  rooms: any[] = [];
  isLoading = false;
  message = '';


  // Variáveis do CRUD de Salas
  showRoomModal = false;
  isEditing = false;
  isSaving = false;
  currentRoom: any = { name: '', capacity: 0, location: '', status: 'AVAILABLE' };
  roomModalError = '';


  // Variáveis da Auditoria (Olhinho)
  showBookingsModal = false;
  selectedRoomForBookings: any = null;
  roomBookings: Booking[] = [];
  isLoadingBookings = false;
  errorMessage: any;


  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit() {
    this.loadRooms();
  }


  loadRooms() {
    this.isLoading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data: any) => {
        this.rooms = data.content ? data.content : data;
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


  openRoomBookingsModal(room: any) {
    this.selectedRoomForBookings = room;
    this.showBookingsModal = true;
    this.isLoadingBookings = true;
    this.roomBookings = [];
    this.cdr.detectChanges();


    this.bookingService.getRoomBookings(room.id).subscribe({
      next: (data: any) => {
        const items = data.content ? data.content : data;
        this.roomBookings = items.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar histórico da sala', err);
        this.isLoadingBookings = false;
        this.cdr.detectChanges();
      }
    });
  }


  closeRoomBookingsModal() {
    this.showBookingsModal = false;
    this.selectedRoomForBookings = null;
    this.roomBookings = [];
    this.cdr.detectChanges();
  }


  openCreateModal() {
    this.isEditing = false;
    this.currentRoom = { name: '', capacity: 0, location: '', status: 'AVAILABLE' };
    this.roomModalError = '';
    this.showRoomModal = true;
  }


  openEditModal(room: any) {
    this.isEditing = true;
    this.currentRoom = { ...room };
    this.roomModalError = '';
    this.showRoomModal = true;
  }


  closeRoomModal() {
    this.showRoomModal = false;
  }


  saveRoom() {
    this.isSaving = true;
    this.roomModalError = '';
    this.cdr.detectChanges();


    if (this.isEditing) {
      this.roomService.updateRoom(this.currentRoom.id, this.currentRoom).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeRoomModal();
          this.message = 'Sala atualizada com sucesso!';
          this.loadRooms();
          setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
        },
        error: (err: any) => {
          this.isSaving = false;
          this.roomModalError = err.error?.erro || err.error?.message || 'Erro ao atualizar sala.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.roomService.createRoom(this.currentRoom).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeRoomModal();
          this.message = 'Sala criada com sucesso!';
          this.loadRooms();
          setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
        },
        error: (err: any) => {
          this.isSaving = false;
          console.error('Erro ao criar sala', err);
          this.roomModalError = err.error?.erro || err.error?.message || 'Não foi possível salvar. Verifique se já existe uma sala com esse nome.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  showDeleteModal = false;
  roomToDelete: any = null;

  openDeleteModal(room: any): void {
    console.log('Dados da Sala selecionada:', room);
    this.roomToDelete = room;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.roomToDelete = null;
  }

  confirmDeleteRoom(): void {
    if (!this.roomToDelete) return;
    this.roomService.deleteRoom(this.roomToDelete.id).subscribe({
      next: () => {
        this.message = 'Sala removida com sucesso!';
        this.closeDeleteModal();
        this.loadRooms();
        setTimeout(() => this.message = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro: Não é possível excluir uma sala que possui reservas.';
        this.closeDeleteModal();
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }







}





