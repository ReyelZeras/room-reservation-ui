import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
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
    private suggestionService: SuggestionService,
    private router: Router,
    private cdr: ChangeDetectorRef // CORREÇÃO: Serviço de detecção de mudanças injetado
  ) {}

  ngOnInit(): void {
    this.suggestionService.getTopSuggestions().subscribe({
      next: (data) => {
        this.suggestions = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // CORREÇÃO: Força o HTML a renderizar os cards do Quarkus
      },
      error: (err) => {
        console.error('O Gateway bloqueou a requisição (401) ou a rota não foi encontrada.', err);

        // Dados provisórios em caso de erro
        this.suggestions = [
          { roomName: 'Sala de Inovação (Mock)', description: 'Libere o Gateway para ver os dados do Quarkus.', capacity: 20 },
          { roomName: 'Auditório Principal (Mock)', description: 'A rota /api/v1/suggestions precisa ser pública.', capacity: 150 },
          { roomName: 'Sala de Foco (Mock)', description: 'Altere o SecurityConfig do seu API Gateway.', capacity: 4 }
        ];

        this.isLoading = false;
        this.cdr.detectChanges(); // CORREÇÃO: Destrava o spinner na tela mesmo que dê erro
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
