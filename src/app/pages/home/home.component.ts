import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  suggestions: Suggestion[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private suggestionService: SuggestionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🚀 Iniciando Home Component...');

    if (this.authService.isAuthenticated()) {
      console.log('✅ Utilizador logado detectado. Redirecionando para o Dashboard...');
      this.router.navigate(['/rooms']);
      return;
    }

    console.log('⏳ Utilizador visitante. Chamando o Quarkus para obter sugestões...');
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading = true;

    this.suggestionService.getTopSuggestions().subscribe({
      next: (data: any[]) => {
        console.log('🟢 Sucesso! Resposta ultrarrápida do Quarkus chegou:', data);

        // 🚀 CORREÇÃO: Usando 'roomName' para bater certinho com a Interface Suggestion!
        this.suggestions = data.map(s => ({
          roomName: s.roomName || s.name,
          description: s.description,
          capacity: s.capacity
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🔴 Erro ao buscar sugestões no Quarkus:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
