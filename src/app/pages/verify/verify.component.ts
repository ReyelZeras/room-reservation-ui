import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify',
  standalone: false,
  templateUrl: './verify.component.html'
})
export class VerifyComponent implements OnInit {
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.errorMessage = 'Token não encontrado na URL.';
      this.loading = false;
      return;
    }

    this.http.get(`/api/v1/auth/verify?token=${encodeURIComponent(token)}`, { responseType: 'text' })
      .subscribe({
        next: (msg: any) => {
          this.successMessage = msg || 'Conta ativada com sucesso!';
          this.loading = false;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err: any) => {
          this.errorMessage = err.error || 'Erro ao ativar a conta. O token pode ser inválido ou já ter expirado.';
          this.loading = false;
        }
      });
  }
}
