import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  isLoading = false;
  message = '';
  error = '';

  // Variável para controlar a exibição do olhinho
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Token inválido ou não fornecido.';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    const payload = {
      token: this.token,
      newPassword: this.resetForm.value.newPassword,
      password: this.resetForm.value.newPassword
    };

    this.http.post('/api/v1/auth/reset-password', payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Senha alterada com sucesso! Você já pode fazer login.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Ocorreu um erro ao redefinir a senha.';
        this.cdr.detectChanges();
      }
    });
  }
}
