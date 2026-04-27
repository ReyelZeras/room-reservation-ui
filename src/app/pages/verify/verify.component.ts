import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">

          <!-- SPINNER DE CARREGAMENTO -->
          <div *ngIf="isLoading" class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 class="text-xl font-bold text-gray-900">A verificar a sua conta...</h2>
            <p class="text-sm text-gray-500 mt-2">Por favor, aguarde um momento.</p>
          </div>

          <!-- SUCESSO -->
          <div *ngIf="!isLoading && isSuccess" class="flex flex-col items-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Conta Ativada!</h2>
            <p class="text-sm text-gray-500 mt-2 mb-6">O seu e-mail foi verificado com sucesso. Já pode fazer login.</p>
            <button routerLink="/login" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              Ir para o Login
            </button>
          </div>

          <!-- ERRO / TOKEN USADO -->
          <div *ngIf="!isLoading && !isSuccess" class="flex flex-col items-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Link Inválido</h2>
            <p class="text-sm text-gray-500 mt-2 mb-6">O link de verificação expirou, já foi utilizado ou é inválido.</p>
            <button routerLink="/login" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              Ir para o Login
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class VerifyComponent implements OnInit {
  isLoading = true;
  isSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.isSuccess = false;
      this.cdr.detectChanges();
      return;
    }

    this.http.get(`/api/v1/auth/verify?token=${token}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
        this.cdr.detectChanges(); // Força o ecrã a parar o loading!
      },
      error: () => {
        this.isLoading = false;
        this.isSuccess = false;
        this.cdr.detectChanges(); // Para o loading e mostra Erro
      }
    });
  }
}
