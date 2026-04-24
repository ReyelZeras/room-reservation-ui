import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // <--- NOVO: Precisamos disso para ler a URL
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // 1. Ao carregar a página de login, verifica se existe um '?token=' na URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        this.errorMessage = 'Erro ao autenticar com o GitHub: ' + error;
      }
      else if (token) {
        // 2. Se encontrou o token, mostra carregamento na tela
        this.isLoading = true;

        // 3. Usa o AuthService para processar esse token do GitHub e baixar o Perfil
        this.authService.processSocialLogin(token).subscribe({
          next: () => {
            this.router.navigate(['/rooms']);
          },
          error: (err) => {
            console.error('Erro ao processar login social:', err);
            this.errorMessage = 'Falha ao recuperar os dados do perfil via GitHub.';
            this.isLoading = false;
          }
        });
      }
    });
  }

  // MÉTODO DO BOTÃO GITHUB
  loginWithGitHub(): void {
    // Redireciona violentamente o usuário para o Spring Cloud Gateway (nosso Backend)
    // O backend (Java) vai interceptar essa rota e jogá-lo para a tela do GitHub
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/rooms']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Credenciais inválidas ou erro no servidor.';
        console.error(err);
      }
    });
  }
}
