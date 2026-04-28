import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative">

        <button routerLink="/login" class="absolute -top-12 left-0 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Voltar ao Login
        </button>

        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Recuperar Senha</h2>
            <p class="text-sm text-gray-600 mt-2">Digite o seu e-mail corporativo. Enviaremos um link para criar uma nova senha.</p>
          </div>

          <div *ngIf="message" class="mb-4 p-4 rounded-md" [ngClass]="isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">
            {{ message }}
          </div>

          <form (ngSubmit)="onSubmit()" *ngIf="!isSuccess">
            <div>
              <label class="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" [(ngModel)]="email" name="email" required class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <button type="submit" [disabled]="isLoading || !email" class="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-gray-400">
              <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              </span>
              {{ isLoading ? 'Enviando...' : 'Enviar Link de Recuperação' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  message = '';
  isError = false;
  isSuccess = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {} // INJETADO CDR

  onSubmit() {
    this.isLoading = true;
    this.message = '';
    this.cdr.detectChanges();

    this.http.post(`/api/v1/auth/forgot-password?email=${encodeURIComponent(this.email)}`, null, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isError = false;
          this.isSuccess = true;
          this.message = res || 'E-mail de recuperação enviado com sucesso! Verifique a sua caixa de entrada.';
          this.cdr.detectChanges(); // FORÇA A TELA A ATUALIZAR
        },
        error: () => {
          this.isLoading = false;
          this.isError = true;
          this.message = 'Ocorreu um erro ao tentar enviar o e-mail. Tente novamente mais tarde.';
          this.cdr.detectChanges(); // FORÇA A TELA A ATUALIZAR
        }
      });
  }
}
