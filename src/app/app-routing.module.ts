import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RoomsComponent } from './pages/rooms/rooms';
import { AuthGuard } from './core/guards/auth-guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'rooms', component: RoomsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/rooms', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
