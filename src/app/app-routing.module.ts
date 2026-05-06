import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyComponent } from './pages/verify/verify.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminRoomsComponent } from './pages/admin-rooms/admin-rooms.component';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';

import { AuthGuard } from './core/guards/auth-guard';
import { AdminGuard } from './core/guards/admin-guard';

// Caminhos corrigidos de acordo com a convenção de nomes
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'RoomRes - Início' } },
  { path: 'login', component: LoginComponent, data: { title: 'Login - RoomRes' } },
  { path: 'register', component: RegisterComponent, data: { title: 'Criar Conta - RoomRes' } },
  { path: 'verify', component: VerifyComponent, data: { title: 'Verificação - RoomRes' } },
  { path: 'forgot-password', component: ForgotPasswordComponent, data: { title: 'Recuperar Senha - RoomRes' } },
  { path: 'reset-password', component: ResetPasswordComponent, data: { title: 'Nova Senha - RoomRes' } },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard], data: { title: 'Catálogo de Salas - RoomRes' } },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], data: { title: 'Meu Perfil - RoomRes' } },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard], data: { title: 'Minhas Reservas - RoomRes' } },
  { path: 'admin/rooms', component: AdminRoomsComponent, canActivate: [AuthGuard, AdminGuard], data: { title: 'Gestão de Salas - Admin' } },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, AdminGuard], data: { title: 'Gestão de Usuários - Admin' } },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
