import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.isLoading = true;
        this.cdr.detectChanges();
        this.authService.processSocialLogin(token).subscribe({
          next: () => { this.router.navigate(['/rooms']); },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Erro ao sincronizar com o GitHub.';
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login(email, password)
      .pipe(timeout(5000))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/rooms']);
        },
        error: (err: any) => {
          this.isLoading = false;

          if (err.name === 'TimeoutError') {
            this.errorMessage = 'O servidor demorou muito para responder. Tente novamente.';
          } else if (err.status === 403 || (err.error && err.error.message && err.error.message.includes('inativa'))) {
            // CORREÇÃO: Captura perfeitamente a exceção de conta inativa
            this.errorMessage = 'A sua conta está inativa. Por favor, verifique a sua caixa de e-mail e clique no link de ativação.';
          } else if (err.status === 401) {
            this.errorMessage = 'E-mail ou senha incorretos.';
          } else {
            this.errorMessage = err.error?.message || 'Ocorreu um erro ao tentar entrar. Tente mais tarde.';
          }

          this.cdr.detectChanges();
        }
      });
  }

  loginWithGithub(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  }
}
