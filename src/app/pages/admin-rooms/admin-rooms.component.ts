import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomService, Room } from '../../services/room.service';

@Component({
  selector: 'app-admin-rooms',
  standalone: false,
  template: `
    <!-- ADICIONADO: A Navbar Global -->
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">

        <!-- Cabeçalho -->
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Gestão de Salas</h2>
            <p class="mt-1 text-sm text-gray-500">Adicione, edite ou remova as salas do catálogo corporativo.</p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button (click)="openModal()" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Nova Sala
            </button>
          </div>
        </div>

        <!-- Tabela -->
        <div class="flex flex-col shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white">
          <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nome da Sala</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Capacidade</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Localização</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">

                  <tr *ngIf="isLoading" class="text-center"><td colspan="5" class="py-10 text-gray-500">A carregar salas...</td></tr>
                  <tr *ngIf="!isLoading && rooms.length === 0" class="text-center"><td colspan="5" class="py-10 text-gray-500">Nenhuma sala cadastrada.</td></tr>

                  <tr *ngFor="let room of rooms">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ room.name }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ room.capacity }} pessoas</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ room.location }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                            [ngClass]="{
                              'bg-green-100 text-green-800': room.status === 'AVAILABLE',
                              'bg-red-100 text-red-800': room.status === 'OCCUPIED',
                              'bg-yellow-100 text-yellow-800': room.status === 'MAINTENANCE'
                            }">
                        {{ getStatusLabel(room.status) }}
                      </span>
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button (click)="editRoom(room)" class="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                      <button (click)="deleteRoom(room.id!)" class="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Formulário -->
        <div *ngIf="showModal" class="fixed z-10 inset-0 overflow-y-auto">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:p-6">

              <div class="mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ isEditing ? 'Editar Sala' : 'Nova Sala' }}</h3>
              </div>

              <div *ngIf="errorMessage" class="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{{ errorMessage }}</div>

              <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome da Sala</label>
                    <input type="text" formControlName="name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Capacidade (Pessoas)</label>
                    <input type="number" formControlName="capacity" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Localização / Andar</label>
                    <input type="text" formControlName="location" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select formControlName="status" class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="AVAILABLE">Disponível</option>
                      <option value="OCCUPIED">Ocupada</option>
                      <option value="MAINTENANCE">Em Manutenção</option>
                    </select>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" [disabled]="roomForm.invalid || isSaving" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">
                    {{ isSaving ? 'Salvando...' : 'Salvar' }}
                  </button>
                  <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                    Cancelar
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = true;
  isSaving = false;
  showModal = false;
  isEditing = false;
  currentRoomId: string | null = null;
  errorMessage = '';

  roomForm: FormGroup;

  // ADICIONADO: ChangeDetectorRef
  constructor(private roomService: RoomService, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      capacity: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      status: ['AVAILABLE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.isLoading = true;
    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // FORÇA A TELA A ATUALIZAR
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar as salas.';
        this.isLoading = false;
        this.cdr.detectChanges(); // FORÇA A TELA A ATUALIZAR
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = { 'AVAILABLE': 'Disponível', 'OCCUPIED': 'Ocupada', 'MAINTENANCE': 'Manutenção' };
    return labels[status] || status;
  }

  openModal(): void {
    this.isEditing = false;
    this.currentRoomId = null;
    this.roomForm.reset({ status: 'AVAILABLE' });
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  editRoom(room: Room): void {
    this.isEditing = true;
    this.currentRoomId = room.id!;
    this.roomForm.patchValue(room);
    this.errorMessage = '';
    this.showModal = true;
  }

  deleteRoom(id: string): void {
    if(confirm('Tem certeza que deseja apagar esta sala permanentemente?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.loadRooms();
          this.cdr.detectChanges();
        },
        error: () => {
          alert('Erro ao excluir a sala. Pode haver reservas atreladas a ela.');
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.roomForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // FORÇA MOSTRAR O SPINNER "SALVANDO..."

    const roomData: Room = this.roomForm.value;

    if (this.isEditing && this.currentRoomId) {
      this.roomService.updateRoom(this.currentRoomId, roomData).subscribe({
        next: () => {
          this.closeModal();
          this.loadRooms();
          this.isSaving = false;
          this.cdr.detectChanges(); // FORÇA PARAR O SPINNER E FECHAR MODAL
        },
        error: (err) => {
          this.errorMessage = err.error?.erro || 'Erro ao atualizar a sala.';
          this.isSaving = false;
          this.cdr.detectChanges(); // FORÇA MOSTRAR O ERRO
        }
      });
    } else {
      this.roomService.createRoom(roomData).subscribe({
        next: () => {
          this.closeModal();
          this.loadRooms();
          this.isSaving = false;
          this.cdr.detectChanges(); // FORÇA PARAR O SPINNER E FECHAR MODAL
        },
        error: (err) => {
          this.errorMessage = err.error?.erro || 'Erro ao criar a sala.';
          this.isSaving = false;
          this.cdr.detectChanges(); // FORÇA MOSTRAR O ERRO
        }
      });
    }
  }
}
