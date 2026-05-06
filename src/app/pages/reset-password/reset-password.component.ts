import { Component, OnInit } from '@angular/core';
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
  loading = false;
  submitted = false;
  token = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.errorMessage = 'Token inválido ou ausente. Por favor, solicite a recuperação novamente.';
    }
  }

  get f() { return this.resetForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.resetForm.invalid || !this.token) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { newPassword: this.resetForm.value.newPassword };

    this.http.post(`/api/v1/auth/reset-password?token=${encodeURIComponent(this.token)}`, payload, { responseType: 'text' })
      .subscribe({
        next: (msg: any) => {
          this.successMessage = msg || 'Senha redefinida com sucesso.';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err: any) => {
          this.errorMessage = err.error || 'Erro ao redefinir a senha. O link pode ter expirado.';
          this.loading = false;
        }
      });
  }
}
