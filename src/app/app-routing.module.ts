import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RoomsComponent } from './pages/rooms/rooms';

// NOVOS COMPONENTES
import { ProfileComponent } from './pages/profile/profile';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';

import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard] },
  // NOVAS ROTAS PROTEGIDAS
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
