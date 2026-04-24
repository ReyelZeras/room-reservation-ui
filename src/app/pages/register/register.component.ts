import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showSuccessModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Adicionado para forçar a atualização da tela
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const payload = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      username: this.registerForm.value.email // Previne o erro NOT NULL do Postgres
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        
        // Se o backend retornou 201, mas o Angular achou que era erro de JSON:
        if (err.status === 201 || err.status === 200) {
          this.showSuccessModal = true;
        } else {
          this.errorMessage = err.error?.message || err.error?.erro || 'Erro ao realizar o registo. Verifique os dados.';
        }
        
        this.cdr.detectChanges(); // Força a tela a parar de carregar
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}