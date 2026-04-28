import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SuggestionService } from '../../services/suggestion.service';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent implements OnInit {
  // Variáveis exigidas pelo HTML
  suggestions: Suggestion[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private suggestionService: SuggestionService
  ) {}

  ngOnInit(): void {
    // 🛡️ INTERCEPTOR DA HOME: Verifica a sessão usando a função correta do AuthService
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/rooms']);
      return; // Interrompe a execução para não carregar a Home
    }

    // Se não estiver logado, carrega as sugestões do Quarkus
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading = true;
    this.suggestionService.getTopSuggestions().subscribe({
      next: (data) => {
        this.suggestions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar sugestões do Quarkus', err);
        this.isLoading = false;
      }
    });
  }

  // Função chamada pelos botões da Home
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
