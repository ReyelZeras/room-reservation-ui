import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: false,
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto space-y-6">

        <!-- Cabeçalho -->
        <div>
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">O Meu Perfil</h2>
          <p class="mt-1 text-sm text-gray-500">Faça a gestão das suas informações pessoais e segurança da conta.</p>
        </div>

        <!-- 🚀 CARD 1: Informações Pessoais (AGORA EDITÁVEL!) -->
        <div class="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Informações da Conta</h3>
            <span class="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                  [ngClass]="user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
              {{ user?.role }}
            </span>
          </div>

          <div class="px-4 py-5 sm:p-6">
            <div *ngIf="profileMessage" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-100 transition-all">
              {{ profileMessage }}
            </div>
            <div *ngIf="profileErrorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-100 transition-all">
              {{ profileErrorMessage }}
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">

              <!-- Campos Editáveis -->
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" formControlName="name" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors">
              </div>

              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-gray-700">Endereço de E-mail</label>
                <input type="email" formControlName="email" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors">
              </div>

              <!-- Campos Bloqueados (Read-only) -->
              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-gray-700">Nome de Utilizador</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">@</span>
                  <input type="text" [value]="user?.username" disabled class="bg-gray-50 text-gray-500 block w-full pl-8 sm:text-sm border-gray-300 rounded-md py-2 border cursor-not-allowed">
                </div>
                <p class="mt-1 text-xs text-gray-400">O username é um identificador único e não pode ser alterado.</p>
              </div>

              <div class="sm:col-span-1">
                <label class="block text-sm font-medium text-gray-700">Método de Autenticação</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input type="text" [value]="user?.provider || 'Local'" disabled class="bg-gray-50 text-gray-500 capitalize block w-full px-3 sm:text-sm border-gray-300 rounded-md py-2 border cursor-not-allowed">
                </div>
              </div>

              <!-- Botão de Salvar Perfil -->
              <div class="sm:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" [disabled]="profileForm.invalid || isSubmittingProfile || profileForm.pristine"
                        class="w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                  <svg *ngIf="isSubmittingProfile" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isSubmittingProfile ? 'A Guardar...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- CARD 2: Alteração de Senha (Visível Apenas para utilizadores Locais) -->
        <div *ngIf="user?.provider === 'local'" class="bg-white shadow sm:rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Segurança</h3>
            <p class="mt-1 text-sm text-gray-500">Atualize a sua palavra-passe para manter a conta segura.</p>
          </div>

          <div class="px-4 py-5 sm:p-6">

            <div *ngIf="passwordMessage" class="mb-4 p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-100 transition-all">
              {{ passwordMessage }}
            </div>
            <div *ngIf="passwordErrorMessage" class="mb-4 p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-100 transition-all">
              {{ passwordErrorMessage }}
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4 max-w-md">

              <div>
                <label class="block text-sm font-medium text-gray-700">Senha Atual</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input [type]="showPasswords ? 'text' : 'password'" formControlName="currentPassword" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Nova Senha</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input [type]="showPasswords ? 'text' : 'password'" formControlName="newPassword" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors">
                </div>
                <p class="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres, incluindo letras e números.</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input [type]="showPasswords ? 'text' : 'password'" formControlName="confirmPassword" class="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors">
                </div>
                <div *ngIf="passwordForm.errors?.['mismatch'] && (passwordForm.controls['confirmPassword'].dirty || passwordForm.controls['confirmPassword'].touched)" class="mt-1 text-xs text-red-600 font-medium">
                  As novas senhas não coincidem.
                </div>
              </div>

              <div class="flex items-center mt-2">
                <input type="checkbox" id="showPwd" [(ngModel)]="showPasswords" [ngModelOptions]="{standalone: true}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer">
                <label for="showPwd" class="ml-2 block text-sm text-gray-900 cursor-pointer">Mostrar senhas</label>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <button type="submit" [disabled]="passwordForm.invalid || isSubmittingPassword"
                        class="w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                  <svg *ngIf="isSubmittingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isSubmittingPassword ? 'A Atualizar...' : 'Atualizar Palavra-passe' }}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any = null;

  // Variáveis do Perfil
  profileForm: FormGroup;
  isSubmittingProfile = false;
  profileMessage = '';
  profileErrorMessage = '';

  // Variáveis da Senha
  passwordForm: FormGroup;
  showPasswords = false;
  isSubmittingPassword = false;
  passwordMessage = '';
  passwordErrorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializa Formulário de Perfil
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // Inicializa Formulário de Senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;

    // Preenche o formulário de perfil com os dados atuais
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  // 🚀 LÓGICA DE ATUALIZAR O NOME E E-MAIL
  updateProfile(): void {
    if (this.profileForm.invalid || !this.user?.id) return;

    this.isSubmittingProfile = true;
    this.profileMessage = '';
    this.profileErrorMessage = '';
    this.cdr.detectChanges();

    const payload = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email
    };

    this.userService.updateUser(this.user.id, payload).subscribe({
      next: (updatedUser) => {
        this.isSubmittingProfile = false;
        this.profileMessage = 'Perfil atualizado com sucesso!';

        // Atualiza a memória local para que a Navbar reflita o novo Nome na hora
        const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const newData = { ...currentUserData, name: payload.name, email: payload.email };
        localStorage.setItem('currentUser', JSON.stringify(newData));

        // Marca o formulário como limpo (pristine) para desabilitar o botão de salvar até nova edição
        this.profileForm.markAsPristine();
        this.cdr.detectChanges();

        // Opcional: recarrega a página após 2 segundos para atualizar o AuthService global
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        this.isSubmittingProfile = false;
        this.profileErrorMessage = err.error?.erro || 'Erro ao atualizar o perfil. O e-mail já pode estar em uso.';
        this.cdr.detectChanges();
      }
    });
  }

  // 🚀 LÓGICA DE ATUALIZAR A SENHA
  changePassword(): void {
    if (this.passwordForm.invalid || !this.user?.id) return;

    this.isSubmittingPassword = true;
    this.passwordMessage = '';
    this.passwordErrorMessage = '';
    this.cdr.detectChanges();

    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(this.user.id, payload).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.passwordForm.reset();
        this.passwordMessage = 'A sua palavra-passe foi atualizada com segurança!';
        this.cdr.detectChanges();

        setTimeout(() => { this.passwordMessage = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        this.passwordErrorMessage = err.error?.erro || err.error?.message || 'Ocorreu um erro ao atualizar a palavra-passe.';
        this.cdr.detectChanges();
      }
    });
  }
}
