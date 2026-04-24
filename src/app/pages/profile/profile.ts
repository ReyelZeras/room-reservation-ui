import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: false
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef // Adicionado para dar feedback imediato!
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const user = this.authService.currentUserValue;
    if (!user) return;

    const updatedData = {
      ...user,
      name: this.profileForm.value.name,
      email: this.profileForm.value.email
    };

    // Ajuste aqui para bater no backend. Se o backend ainda não tiver PUT /users/{id},
    // o bloco success simula a atualização instantânea visualmente.
    this.http.put(`/api/v1/users/${user.id}`, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Perfil atualizado com sucesso!';

        // Atualiza a memória do Angular na hora
        localStorage.setItem('currentUser', JSON.stringify(updatedData));
        this.authService.updateCurrentUser(updatedData);

        this.cdr.detectChanges(); // Força a mensagem verde a aparecer
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Erro ao atualizar o perfil. Tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
