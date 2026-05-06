import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any = null;

  // Variáveis do Perfil
  profileForm: FormGroup;
  isSubmittingProfile = false;
  profileMessage = '';
  profileErrorMessage = '';

  // Variáveis da Senha
  passwordForm: FormGroup;
  showPasswords = false;
  isSubmittingPassword = false;
  passwordMessage = '';
  passwordErrorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializa Formulário de Perfil
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // Inicializa Formulário de Senha
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;

    // Preenche o formulário de perfil com os dados atuais
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email
      });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  // LÓGICA DE ATUALIZAR O NOME E E-MAIL
  updateProfile(): void {
    if (this.profileForm.invalid || !this.user?.id) return;

    this.isSubmittingProfile = true;
    this.profileMessage = '';
    this.profileErrorMessage = '';
    this.cdr.detectChanges();

    const payload = {
      name: this.profileForm.value.name,
      email: this.profileForm.value.email
    };

    this.userService.updateUser(this.user.id, payload).subscribe({
      next: (updatedUser) => {
        this.isSubmittingProfile = false;
        this.profileMessage = 'Perfil atualizado com sucesso!';

        // Atualiza a memória local para que a Navbar reflita o novo Nome na hora
        const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const newData = { ...currentUserData, name: payload.name, email: payload.email };
        localStorage.setItem('currentUser', JSON.stringify(newData));

        // Marca o formulário como limpo (pristine) para desabilitar o botão de salvar até nova edição
        this.profileForm.markAsPristine();
        this.cdr.detectChanges();

        // Opcional: recarrega a página após 2 segundos para atualizar o AuthService global
        setTimeout(() => { window.location.reload(); }, 2000);
      },
      error: (err) => {
        this.isSubmittingProfile = false;
        this.profileErrorMessage = err.error?.erro || 'Erro ao atualizar o perfil. O e-mail já pode estar em uso.';
        this.cdr.detectChanges();
      }
    });
  }

  // LÓGICA DE ATUALIZAR A SENHA
  changePassword(): void {
    if (this.passwordForm.invalid || !this.user?.id) return;

    this.isSubmittingPassword = true;
    this.passwordMessage = '';
    this.passwordErrorMessage = '';
    this.cdr.detectChanges();

    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(this.user.id, payload).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.passwordForm.reset();
        this.passwordMessage = 'A sua palavra-passe foi atualizada com segurança!';
        this.cdr.detectChanges();

        setTimeout(() => { this.passwordMessage = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.isSubmittingPassword = false;
        this.passwordErrorMessage = err.error?.erro || err.error?.message || 'Ocorreu um erro ao atualizar a palavra-passe.';
        this.cdr.detectChanges();
      }
    });
  }
}
