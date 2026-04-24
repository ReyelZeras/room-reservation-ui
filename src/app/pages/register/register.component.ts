import { Component } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;

    // Geração do username a partir do email para não quebrar a not-null constraint do banco
    const generatedUsername = formValue.email.split('@')[0] + Math.floor(Math.random() * 1000);

    const payload = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      username: generatedUsername,
      provider: 'local'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      // CORREÇÃO: Adicionada tipagem ": any" exigida pelo modo Strict do TypeScript
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Erro ao realizar cadastro. Verifique se o e-mail já existe.';
        console.error(err);
      }
    });
  }
}
