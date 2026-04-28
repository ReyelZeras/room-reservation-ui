import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

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
            <p class="mt-1 text-sm text-gray-500">Promova utilizadores, rebaixe privilégios e faça a gestão de acessos.</p>
          </div>
        </div>

        <div *ngIf="message" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium transition-all shadow-sm border border-green-100">
          {{ message }}
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
            <select [(ngModel)]="filterRole" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white outline-none">
              <option value="">Todos</option>
              <option value="ADMIN">Administradores</option>
              <option value="USER">Comuns (USER)</option>
            </select>
          </div>

          <div class="w-full md:w-40">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Status da Conta</label>
            <select [(ngModel)]="filterStatus" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white outline-none">
              <option value="">Todos</option>
              <option value="active">Apenas Ativas</option>
              <option value="inactive">Inativas/Pendentes</option>
            </select>
          </div>

          <div class="w-full md:w-40">
            <label class="block text-xs font-semibold text-gray-700 mb-1">Origem do Registo</label>
            <select [(ngModel)]="filterProvider" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white outline-none">
              <option value="">Todas</option>
              <option value="local">Local (E-mail)</option>
              <option value="github">GitHub</option>
            </select>
          </div>
        </div>

        <!-- TABELA -->
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
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">

                  <tr *ngIf="isLoading" class="text-center"><td colspan="5" class="py-10 text-gray-500">A carregar utilizadores...</td></tr>

                  <!-- Fallback caso os filtros não encontrem ninguém -->
                  <tr *ngIf="!isLoading && filteredUsers.length === 0" class="text-center bg-gray-50">
                    <td colspan="5" class="py-10 text-gray-500 font-medium">Nenhum utilizador encontrado com os filtros atuais.</td>
                  </tr>

                  <!-- Iteramos sobre a matriz FILTRADA -->
                  <tr *ngFor="let user of filteredUsers" class="hover:bg-gray-50 transition-colors">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="font-medium text-gray-900">{{ user.name }} <span class="text-gray-400 text-xs">({{ user.username }})</span></div>
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
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">

                      <button *ngIf="user.role !== 'ADMIN'" (click)="openConfirmModal(user, 'ADMIN')" class="text-purple-600 hover:text-purple-900 font-bold bg-purple-50 px-3 py-1.5 rounded-md border border-purple-200 transition-colors shadow-sm">
                        Promover a Admin
                      </button>

                      <button *ngIf="user.role === 'ADMIN' && user.email !== currentUserEmail" (click)="openConfirmModal(user, 'USER')" class="text-gray-600 hover:text-gray-900 font-bold bg-gray-100 px-3 py-1.5 rounded-md border border-gray-300 transition-colors shadow-sm">
                        Remover Admin
                      </button>

                      <span *ngIf="user.role === 'ADMIN' && user.email === currentUserEmail" class="inline-flex items-center text-gray-400 italic px-3 py-1.5 text-xs">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        A sua Conta (Protegido)
                      </span>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Customizado de Confirmação em Tailwind -->
      <div *ngIf="showConfirmModal" class="fixed z-50 inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeConfirmModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"
                     [ngClass]="roleToApply === 'ADMIN' ? 'bg-purple-100' : 'bg-orange-100'">
                  <svg *ngIf="roleToApply === 'ADMIN'" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <svg *ngIf="roleToApply === 'USER'" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ roleToApply === 'ADMIN' ? 'Promover a Administrador' : 'Remover Privilégios' }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Tem a certeza que deseja alterar os privilégios de <strong class="text-gray-800">{{ userToModify?.name }}</strong> para <strong class="text-gray-800">{{ roleToApply }}</strong>?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="confirmRoleChange()"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                      [ngClass]="roleToApply === 'ADMIN' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'">
                Confirmar Ação
              </button>
              <button type="button" (click)="closeConfirmModal()"
                      class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
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
  isLoading = true;
  message = '';
  currentUserEmail = '';

  // 🔍 Variáveis de Filtro
  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  filterProvider = '';

  // Variáveis do Modal
  showConfirmModal = false;
  userToModify: UserProfile | null = null;
  roleToApply = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = this.authService.currentUserValue?.email || '';
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Erro ao carregar a lista de utilizadores.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 🧠 A MÁGICA DOS FILTROS ACONTECE AQUI!
  // O Angular chama isto automaticamente sempre que você escreve ou muda um select
  get filteredUsers(): UserProfile[] {
    return this.users.filter(user => {
      // 1. Filtro de Texto (Nome, E-mail ou Username)
      const term = this.searchTerm.toLowerCase();
      const matchSearch = !this.searchTerm ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term);

      // 2. Filtro de Role (ADMIN ou USER)
      const matchRole = !this.filterRole || user.role === this.filterRole;

      // 3. Filtro de Status (active ou inactive)
      const matchStatus = !this.filterStatus ||
        (this.filterStatus === 'active' ? user.active === true : user.active === false);

      // 4. Filtro de Origem (Local ou GitHub)
      const providerStr = user.provider ? user.provider.toLowerCase() : 'local';
      const matchProvider = !this.filterProvider || providerStr === this.filterProvider.toLowerCase();

      return matchSearch && matchRole && matchStatus && matchProvider;
    });
  }

  openConfirmModal(user: UserProfile, newRole: string): void {
    this.userToModify = user;
    this.roleToApply = newRole;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.userToModify = null;
  }

  confirmRoleChange(): void {
    if (!this.userToModify) return;

    this.userService.updateUserRole(this.userToModify.id, this.roleToApply).subscribe({
      next: () => {
        this.message = `Privilégio atualizado para ${this.roleToApply} com sucesso!`;
        this.closeConfirmModal();
        this.loadUsers();

        setTimeout(() => { this.message = ''; this.cdr.detectChanges(); }, 4000);
      },
      error: () => {
        alert('Ocorreu um erro ao tentar alterar os privilégios.');
        this.closeConfirmModal();
      }
    });
  }
}
