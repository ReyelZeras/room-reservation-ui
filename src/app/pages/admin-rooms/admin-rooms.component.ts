import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-admin-rooms',
  standalone: false,
  template: `
    <app-navbar></app-navbar>
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <div class="md:flex md:items-center md:justify-between mb-6">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Gestão de Salas</h2>
            <p class="mt-1 text-sm text-gray-500">Painel administrativo para gerir o catálogo e auditar reservas de salas.</p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button (click)="openCreateModal()" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Nova Sala
            </button>
          </div>
        </div>

        <!-- Tabela Original de Salas -->
        <div class="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-gray-200">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Sala</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacidade</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let room of rooms" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">{{ room.name }}</div>
                    <div class="text-sm text-gray-500">{{ room.location || 'Sem localização' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {{ room.capacity }} Pessoas
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full"
                          [ngClass]="room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ room.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">

                    <!-- NOVA FEATURE: OLHINHO DE RESERVAS (Auditoria) -->
                    <button (click)="openRoomBookingsModal(room)" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded" title="Ver Histórico de Reservas">
                      <svg class="h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <!-- Botão Editar Original -->
                    <button (click)="openEditModal(room)" class="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded" title="Editar Sala">
                      <svg class="h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>

                    <!-- Botão Remover Original -->
                    <button (click)="deleteRoom(room.id)" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded" title="Remover Sala">
                      <svg class="h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="rooms.length === 0 && !isLoading" class="p-8 text-center text-gray-500 font-medium">
            Nenhuma sala cadastrada no sistema.
          </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL NOVA FEATURE: HISTÓRICO DE RESERVAS  -->
        <!-- ========================================== -->
        <div *ngIf="showBookingsModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">

            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-gray-900">Histórico de Reservas</h3>
                <p class="text-sm font-medium text-indigo-600 mt-1">Auditando ocupação da sala: {{ selectedRoomForBookings?.name }}</p>
              </div>
              <button (click)="closeRoomBookingsModal()" class="text-gray-400 hover:text-gray-700 transition-colors">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 bg-white">
              <div *ngIf="isLoadingBookings" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>

              <div *ngIf="!isLoadingBookings && roomBookings.length === 0" class="text-center py-10 bg-gray-50 rounded border border-gray-200">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p class="text-gray-500 font-medium">Nenhuma reserva encontrada para esta sala no histórico.</p>
              </div>

              <div *ngIf="!isLoadingBookings && roomBookings.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Início</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fim</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let booking of roomBookings" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ booking.title || 'Reserva' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ booking.startTime | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ booking.endTime | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full"
                              [ngClass]="{'bg-green-100 text-green-800': booking.status === 'CONFIRMED', 'bg-red-100 text-red-800': booking.status === 'CANCELLED', 'bg-yellow-100 text-yellow-800': booking.status === 'PENDING'}">
                          {{ booking.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button (click)="closeRoomBookingsModal()" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition-colors">Fechar Painel</button>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SEU MODAL ORIGINAL: CRIAR / EDITAR SALA    -->
        <!-- ========================================== -->
        <div *ngIf="showRoomModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 class="text-xl font-bold text-gray-900">{{ isEditing ? 'Editar Sala' : 'Nova Sala' }}</h3>
              <button (click)="closeRoomModal()" class="text-gray-400 hover:text-gray-700"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Nome da Sala</label>
                <input type="text" [(ngModel)]="currentRoom.name" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 outline-none">
              </div>
              <div class="flex gap-4">
                <div class="w-1/2">
                  <label class="block text-sm font-bold text-gray-700 mb-1">Capacidade</label>
                  <input type="number" [(ngModel)]="currentRoom.capacity" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 outline-none">
                </div>
                <div class="w-1/2">
                  <label class="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select [(ngModel)]="currentRoom.status" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 bg-white outline-none">
                    <option value="AVAILABLE">Disponível</option>
                    <option value="UNAVAILABLE">Indisponível</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Localização</label>
                <input type="text" [(ngModel)]="currentRoom.location" class="w-full p-2.5 border border-gray-300 rounded-md focus:ring-indigo-500 outline-none">
              </div>
            </div>
            <div class="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button (click)="closeRoomModal()" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancelar</button>
              <button (click)="saveRoom()" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Salvar Sala</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminRoomsComponent implements OnInit {
  rooms: any[] = [];
  isLoading = false;

  // Variáveis do CRUD de Salas
  showRoomModal = false;
  isEditing = false;
  currentRoom: any = { name: '', capacity: 0, location: '', status: 'AVAILABLE' };

  // --- NOVA FUNCIONALIDADE: VARIÁVEIS DA AUDITORIA (OLHINHO) ---
  showBookingsModal = false;
  selectedRoomForBookings: any = null;
  roomBookings: Booking[] = [];
  isLoadingBookings = false;

  constructor(
    private roomService: RoomService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef // Injetado para forçar atualização da tela
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
        this.cdr.detectChanges(); // Força o Angular a desenhar a tabela!
      },
      error: (err: any) => {
        console.error('Erro ao carregar salas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ==============================================================
  // LÓGICA: CARREGAR HISTÓRICO DA SALA ESPECÍFICA (OLHINHO)
  // ==============================================================
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

  // ==========================================
  // SEU CRUD ORIGINAL DE SALAS MANTIDO SEGURO
  // ==========================================
  openCreateModal() {
    this.isEditing = false;
    this.currentRoom = { name: '', capacity: 0, location: '', status: 'AVAILABLE' };
    this.showRoomModal = true;
  }

  openEditModal(room: any) {
    this.isEditing = true;
    this.currentRoom = { ...room };
    this.showRoomModal = true;
  }

  closeRoomModal() {
    this.showRoomModal = false;
  }

  saveRoom() {
    if (this.isEditing) {
      this.roomService.updateRoom(this.currentRoom.id, this.currentRoom).subscribe({
        next: () => {
          this.closeRoomModal();
          this.loadRooms();
        },
        error: (err: any) => console.error('Erro ao atualizar sala', err)
      });
    } else {
      this.roomService.createRoom(this.currentRoom).subscribe({
        next: () => {
          this.closeRoomModal();
          this.loadRooms();
        },
        error: (err: any) => console.error('Erro ao criar sala', err)
      });
    }
  }

  deleteRoom(id: string) {
    if (confirm('Tem certeza que deseja remover esta sala do sistema?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => this.loadRooms(),
        error: (err: any) => console.error('Erro ao deletar sala', err)
      });
    }
  }
}
