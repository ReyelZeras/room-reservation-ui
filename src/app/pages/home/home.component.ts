import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SuggestionService } from '../../services/suggestion.service';
import { Suggestion } from '../../models/suggestion';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  suggestions: Suggestion[] = [];
  isLoading = true;
  isLoggedIn = false; //Nova flag de estado de login

  constructor(
    private authService: AuthService,
    private router: Router,
    private suggestionService: SuggestionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //  Apenas verifica se está logado para trocar as Navbars, SEM REDIRECIONAR!
    this.isLoggedIn = this.authService.isAuthenticated();

    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading = true;

    this.suggestionService.getTopSuggestions().subscribe({
      next: (data: any[]) => {
        this.suggestions = data.map(s => ({
          roomName: s.roomName || s.name,
          description: s.description,
          capacity: s.capacity
        }));

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
