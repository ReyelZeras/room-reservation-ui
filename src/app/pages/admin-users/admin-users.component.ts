import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, Booking } from '../../services/booking.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-users',
  standalone: false,
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div class="max-w-7xl mx-auto">

        <div class="md:flex md:items-center md:justify-between mb-6">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Gestão de Utilizadores</h2>
            <p class="mt-1 text-sm text-gray-500">Promova administradores, inative contas e faça auditoria de reservas.</p>
          </div>
        </div>

        <div *ngIf="message" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium transition-all shadow-sm border border-green-100">
          {{ message }}
        </div>
        <div *ngIf="errorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium transition-all shadow-sm border border-red-100">
          {{ errorMessage }}
        </div>

        <!-- 🔍 BARRA DE FILTROS -->
        <div class="mb-6 bg-white p-4 rounded-lg shadow-sm ring-1 ring-black ring-opacity-5 flex flex-col md:flex-row gap-4 items-end">
          <div class="flex-1 w-full">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Pesquisar Utilizador</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="text" [(ngModel)]="searchTerm" placeholder="Nome, E-mail ou Username..." class="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
            </div>
          </div>

          <div class="w-full md:w-48">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Privilégio</label>
            <select [(ngModel)]="filterRole" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none">
              <option value="">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="USER">Comuns (USER)</option>
            </select>
          </div>

          <div class="w-full md:w-40">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Status da Conta</label>
            <select [(ngModel)]="filterStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none">
              <option value="">Todos</option>
              <option value="active">Apenas Ativas</option>
              <option value="inactive">Inativas/Pendentes</option>
            </select>
          </div>

          <div class="w-full md:w-40">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Origem do Registo</label>
            <select [(ngModel)]="filterProvider" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 bg-white outline-none">
              <option value="">Todas</option>
              <option value="local">Local</option>
              <option value="github">GitHub</option>
            </select>
          </div>
        </div>

        <!-- TABELA MESTRE -->
        <div class="flex flex-col shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nome / E-mail</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Origem</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Privilégio</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right"><span class="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">

                  <tr *ngIf="isLoading" class="text-center"><td colspan="5" class="py-10 text-gray-500">A carregar utilizadores...</td></tr>
                  <tr *ngIf="!isLoading && filteredUsers.length === 0" class="text-center bg-gray-50">
                    <td colspan="5" class="py-10 text-gray-500 font-medium">Nenhum utilizador encontrado com os filtros atuais.</td>
                  </tr>

                  <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50 transition-colors" [ngClass]="{'opacity-60': !user.active}">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="font-medium text-gray-900" [ngClass]="{'line-through': !user.active}">{{ user.name }}</div>
                      <div class="text-gray-500">{{ user.email }}</div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{{ user.provider || 'Local' }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5" [ngClass]="user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ user.active ? 'Ativa' : 'Inativa' }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm font-bold" [ngClass]="user.role === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'">
                      {{ user.role }}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">

                      <!-- GRUPO DE BOTÕES -->
                      <div class="flex justify-end items-center space-x-2">

                        <!-- Botão de Auditoria -->
                        <button (click)="openBookingsModal(user)" class="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-md border border-blue-200 transition-colors shadow-sm" title="Ver Reservas">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>

                        <!-- Botão Inativar/Ativar -->
                        <button *ngIf="user.email !== currentUserEmail" (click)="openStatusConfirmModal(user)"
                                [ngClass]="user.active ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'"
                                class="font-bold px-3 py-1.5 rounded-md border transition-colors shadow-sm" title="Alternar Status">
                          {{ user.active ? 'Inativar' : 'Ativar' }}
                        </button>

                        <!-- Botão Promover/Rebaixar -->
                        <button *ngIf="user.role !== 'ADMIN'" (click)="openRoleConfirmModal(user, 'ADMIN')" class="text-purple-600 hover:bg-purple-100 font-bold bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200 transition-colors shadow-sm">
                          Promover
                        </button>

                        <button *ngIf="user.role === 'ADMIN' && user.email !== currentUserEmail" (click)="openRoleConfirmModal(user, 'USER')" class="text-gray-600 hover:bg-gray-200 font-bold bg-gray-100 px-3 py-1.5 rounded-md border border-gray-300 transition-colors shadow-sm">
                          Rebaixar
                        </button>

                        <span *ngIf="user.email === currentUserEmail" class="inline-flex items-center text-gray-400 italic px-2 text-xs">
                           Sua Conta
                        </span>

                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 1: AUDITORIA DE RESERVAS             -->
      <!-- ========================================== -->
      <div *ngIf="showBookingsModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeBookingsModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">

              <div class="flex justify-between items-center mb-4 border-b pb-4">
                <h3 class="text-lg leading-6 font-bold text-gray-900">
                  Histórico de Reservas: <span class="text-blue-600">{{ selectedUserForBookings?.name }}</span>
                </h3>
                <button (click)="closeBookingsModal()" class="text-gray-400 hover:text-gray-500 outline-none">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div *ngIf="isLoadingBookings" class="py-12 flex justify-center">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>

              <div *ngIf="!isLoadingBookings && userBookings.length === 0" class="py-10 text-center text-gray-500 font-medium">
                Este utilizador não possui nenhuma reserva registada no sistema.
              </div>

              <div *ngIf="!isLoadingBookings && userBookings.length > 0" class="overflow-x-auto max-h-96 overflow-y-auto ring-1 ring-black ring-opacity-5 rounded-md">
                 <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 sticky top-0 shadow-sm">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motivo / Sala</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data e Hora (Início - Fim)</th>
                            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr *ngFor="let bk of userBookings" class="hover:bg-gray-50">
                            <td class="px-4 py-3 whitespace-nowrap">
                                <div class="text-sm font-bold text-gray-900">{{ bk.title || 'Reserva Padrão' }}</div>
                                <div class="text-xs font-medium text-blue-600">{{ getRoomName(bk.roomId) }}</div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                <div class="text-sm text-gray-800">{{ formatDate(bk.startTime) }}</div>
                                <div class="text-xs text-gray-500">até {{ formatDate(bk.endTime) }}</div>
                            </td>
                            <td class="px-4 py-3 whitespace-nowrap">
                                <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full" [ngClass]="bk.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                    {{ bk.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                 </table>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-end">
              <button type="button" (click)="closeBookingsModal()" class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 outline-none sm:text-sm transition-colors">
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 2: CONFIRMAÇÃO DE CARGOS             -->
      <!-- ========================================== -->
      <div *ngIf="showRoleConfirmModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeRoleConfirmModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10" [ngClass]="roleToApply === 'ADMIN' ? 'bg-purple-100' : 'bg-orange-100'">
                  <svg *ngIf="roleToApply === 'ADMIN'" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <svg *ngIf="roleToApply === 'USER'" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">{{ roleToApply === 'ADMIN' ? 'Promover a Administrador' : 'Remover Privilégios' }}</h3>
                  <div class="mt-2"><p class="text-sm text-gray-500">Tem a certeza que deseja alterar os privilégios de <strong class="text-gray-800">{{ userToModify?.name }}</strong>?</p></div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="confirmRoleChange()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors" [ngClass]="roleToApply === 'ADMIN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'">
                Confirmar Ação
              </button>
              <button type="button" (click)="closeRoleConfirmModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 3: CONFIRMAÇÃO DE INATIVAÇÃO         -->
      <!-- ========================================== -->
      <div *ngIf="showStatusConfirmModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeStatusConfirmModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10" [ngClass]="userToModify?.active ? 'bg-red-100' : 'bg-green-100'">
                  <svg *ngIf="userToModify?.active" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <svg *ngIf="!userToModify?.active" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">{{ userToModify?.active ? 'Inativar Conta' : 'Ativar Conta' }}</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Tem a certeza que deseja <strong>{{ userToModify?.active ? 'inativar' : 'ativar' }}</strong> a conta de <strong class="text-gray-800">{{ userToModify?.name }}</strong>?
                      <br><br>
                      <span *ngIf="userToModify?.active" class="text-red-500">O utilizador perderá o acesso imediato ao sistema (Soft-Delete). As reservas não serão apagadas.</span>
                      <span *ngIf="!userToModify?.active" class="text-green-600">O utilizador recuperará o acesso imediato ao sistema.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="confirmStatusChange()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors" [ngClass]="userToModify?.active ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'">
                {{ isSubmittingStatus ? 'A processar...' : 'Confirmar Ação' }}
              </button>
              <button type="button" (click)="closeStatusConfirmModal()" [disabled]="isSubmittingStatus" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
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

  // ==========================================
  // MODAL 1: AUDITORIA DE RESERVAS
  // ==========================================
  openBookingsModal(user: UserProfile): void {
    this.selectedUserForBookings = user;
    this.showBookingsModal = true;
    this.isLoadingBookings = true;
    this.userBookings = [];

    this.bookingService.getMyBookings(user.id).subscribe({
      next: (bookings) => {
        this.userBookings = bookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
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

  // ==========================================
  // MODAL 2: MUDANÇA DE CARGO
  // ==========================================
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

  // ==========================================
  // MODAL 3: ALTERAR STATUS (INATIVAR) - NOVO E BONITO
  // ==========================================
  openStatusConfirmModal(user: UserProfile): void {
    this.userToModify = user;
    this.showStatusConfirmModal = true;
  }

  closeStatusConfirmModal(): void {
    if (this.isSubmittingStatus) return; // Impede fechar enquanto carrega
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

        // Atualiza o utilizador na lista local para refletir na tabela instantaneamente
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
