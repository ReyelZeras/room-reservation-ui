import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.forgotForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const email = this.forgotForm.value.email;

    // Passamos {} (objeto vazio) em vez de null.
    // Isso força o envio do Content-Length e impede que o navegador congele aguardando o fim da requisição.
    this.http.post(`/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`, {}, { responseType: 'text' })
      .subscribe({
        next: (msg: any) => {
          this.successMessage = msg || 'Verifique o seu e-mail para as instruções de recuperação.';
          this.loading = false;
          this.cdr.detectChanges(); // Força a atualização da tela
        },
        error: (err: any) => {
          this.errorMessage = err.error || 'Ocorreu um erro ao solicitar a recuperação.';
          this.loading = false;
          this.cdr.detectChanges(); // Força a atualização da tela
        }
      });
  }
}
