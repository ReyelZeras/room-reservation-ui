import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Criar Nova Senha</h2>
            <p class="text-sm text-gray-600 mt-2">Digite a sua nova senha segura.</p>
          </div>

          <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm">
            {{ errorMessage }}
          </div>

          <div *ngIf="isSuccess" class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Senha atualizada!</h3>
            <p class="text-sm text-gray-500 mt-2 mb-6">A sua senha foi redefinida com sucesso.</p>
            <button routerLink="/login" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Ir para o Login</button>
          </div>

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" *ngIf="!isSuccess && isValidToken">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <div class="relative flex items-center">
                <input formControlName="password" [type]="showPassword ? 'text' : 'password'" class="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10">
                <button type="button" (click)="togglePasswordVisibility()" class="absolute right-0 pr-3 flex items-center h-full text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg *ngIf="!showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  <svg *ngIf="showPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542-7z" /></svg>
                </button>
              </div>
              <p *ngIf="resetForm.get('password')?.hasError('pattern') && resetForm.get('password')?.touched" class="mt-1 text-xs text-red-600">Mínimo 8 chars, 1 maiúscula, 1 número, 1 caractere especial (!@#$%).</p>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <div class="relative flex items-center">
                <input formControlName="confirmPassword" [type]="showConfirmPassword ? 'text' : 'password'" class="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10">
                <button type="button" (click)="toggleConfirmPasswordVisibility()" class="absolute right-0 pr-3 flex items-center h-full text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg *ngIf="!showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  <svg *ngIf="showConfirmPassword" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542-7z" /></svg>
                </button>
              </div>
              <p *ngIf="resetForm.get('confirmPassword')?.hasError('mismatch') && resetForm.get('confirmPassword')?.touched" class="mt-1 text-xs text-red-600">As senhas não coincidem.</p>
            </div>

            <button type="submit" [disabled]="resetForm.invalid || isLoading" class="relative mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
              <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
              </span>
              {{ isLoading ? 'A salvar...' : 'Atualizar Senha' }}
            </button>
          </form>

        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  isLoading = false;
  errorMessage = '';
  isSuccess = false;
  isValidToken = true;

  // Variáveis do Olho
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef // INJETADO CDR
  ) {
    const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=]).{8,}$/;
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(passwordRegex)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.isValidToken = false;
      this.errorMessage = "Token de segurança ausente. Use o link enviado por e-mail.";
    }
  }

  // Lógica do Olho
  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
  toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // FORÇA ATUALIZAR PRA MOSTRAR O SPINNER

    const payload = { newPassword: this.resetForm.value.password };

    this.http.post(`/api/v1/auth/reset-password?token=${this.token}`, payload, { responseType: 'text' })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
          this.cdr.detectChanges(); // FORÇA MOSTRAR TELA DE SUCESSO VERDE
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error || 'Token inválido ou expirado.';
          this.cdr.detectChanges(); // FORÇA MOSTRAR ERRO E PARAR SPINNER
        }
      });
  }
}
