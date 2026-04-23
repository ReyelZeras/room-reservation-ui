import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Navbar Topo -->
      <nav class="bg-blue-700 p-4 text-white flex justify-between items-center shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="h-8 w-8 bg-white text-blue-700 rounded flex items-center justify-center font-extrabold text-xl shadow-inner">R</div>
          <h1 class="text-xl font-bold tracking-wide">RoomRes</h1>
        </div>

        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-blue-400">
              <span class="text-sm font-bold">{{ (authService.currentUserValue?.name?.charAt(0) || 'A') | uppercase }}</span>
            </div>
            <span class="text-sm font-medium">{{ authService.currentUserValue?.name || 'Administrador' }}</span>
          </div>
          <button (click)="logout()" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-semibold transition-all shadow hover:shadow-md flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </nav>

      <!-- Conteúdo Central -->
      <div class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        <div class="flex justify-between items-end mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Catálogo de Salas</h2>
            <p class="text-gray-500 mt-1">Explore e reserve os espaços corporativos disponíveis.</p>
          </div>
        </div>

        <!-- Estado de Carregamento -->
        <div *ngIf="isLoading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>

        <!-- Estado de Erro -->
        <div *ngIf="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mb-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 font-medium">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Grid de Salas -->
        <div *ngIf="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div *ngIf="rooms.length === 0" class="col-span-full bg-white p-10 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center border-dashed">
            <svg class="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900">Nenhuma sala encontrada</h3>
            <p class="text-gray-500 mt-1">O sistema ainda não possui salas cadastradas ou o serviço está indisponível.</p>
          </div>

          <!-- Card da Sala -->
          <div *ngFor="let room of rooms" class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
            <div class="h-32 bg-gradient-to-r from-blue-500 to-blue-700 relative p-4 flex flex-col justify-between">
              <div class="flex justify-between items-start">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm"
                      [ngClass]="{
                        'bg-green-100 text-green-800': room.status === 'AVAILABLE',
                        'bg-red-100 text-red-800': room.status === 'OCCUPIED',
                        'bg-yellow-100 text-yellow-800': room.status === 'MAINTENANCE'
                      }">
                  {{ formatStatus(room.status) }}
                </span>
                <span class="bg-black bg-opacity-30 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Capacidade: {{ room.capacity }}
                </span>
              </div>
            </div>

            <div class="p-5 flex-grow flex flex-col justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900 truncate" [title]="room.name">{{ room.name }}</h3>
                <div class="mt-2 flex items-center text-sm text-gray-500">
                  <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="truncate">{{ room.location }}</span>
                </div>
              </div>

              <div class="mt-6">
                <button [disabled]="room.status !== 'AVAILABLE'"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors">
                  {{ room.status === 'AVAILABLE' ? 'Reservar Sala' : 'Indisponível' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class RoomsComponent implements OnInit {

  rooms: Room[] = [];
  isLoading = true;
  error = '';

  constructor(
    public authService: AuthService,
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.isLoading = true;
    this.error = '';

    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        // CORREÇÃO: Garante que "data" é sempre um Array para não explodir o "rooms.length" no HTML
        this.rooms = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar salas', err);
        // Agora o Loading pára, e a mensagem de erro aparece!
        this.error = 'Falha ao carregar o catálogo de salas. Verifique a conexão com o Gateway (Porta 8080).';
        this.isLoading = false;
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
}
