import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // CORREÇÃO: Captura os valores do form
    const formValues = this.registerForm.value;

    // CORREÇÃO: Gera o "username" a partir do email para satisfazer o Not-Null constraint do PostgreSQL
    // Exemplo: teste@teste.com -> username: teste
    const generatedUsername = formValues.email.split('@')[0];

    // Monta o payload final
    const payload = {
      ...formValues,
      username: generatedUsername
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']); // Sucesso, joga pro login
      },
      error: (err) => {
        this.isLoading = false;
        // Tratamento mais elegante de erros de backend
        if (err.status === 401 || err.status === 403) {
           this.errorMessage = 'Acesso negado. O Gateway ainda precisa liberar essa rota.';
        } else if (err.status === 400 || err.status === 500) {
           // Em caso de outro erro (como email duplicado), mostra no console
           console.error('Falha na criação do usuário:', err.error);
           this.errorMessage = 'Erro no servidor ou dados inválidos. Verifique o console.';
        } else {
           this.errorMessage = 'Erro de conexão com o servidor.';
        }
      }
    });
  }
}
