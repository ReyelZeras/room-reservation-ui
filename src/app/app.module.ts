import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RoomsComponent } from './pages/rooms/rooms';
import { VerifyComponent } from './pages/verify/verify.component';
import { ProfileComponent } from './pages/profile/profile';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { AdminRoomsComponent } from './pages/admin-rooms/admin-rooms.component';

// IMPORTADO: O novo componente
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthInterceptor } from './core/interceptors/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RoomsComponent,
    RegisterComponent,
    ProfileComponent,
    MyBookingsComponent,
    NavbarComponent,
    VerifyComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AdminRoomsComponent,
    AdminUsersComponent // DECLARADO: Para o Angular saber que ele existe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
