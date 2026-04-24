import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ADICIONADO: Necessário para os formulários
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RoomsComponent } from './pages/rooms/rooms';

import { ProfileComponent } from './pages/profile/profile';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';


// Se o nome do arquivo do interceptor for diferente, ajuste aqui. Assumindo auth-interceptor baseado no PDF.
import { AuthInterceptor } from './core/interceptors/auth-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RoomsComponent,
    RegisterComponent,
    ProfileComponent,   // ADICIONADO
    MyBookingsComponent // ADICIONADO // CORREÇÃO: Declarado corretamente

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule, // OBRIGATÓRIO PARA O [formGroup] FUNCIONAR
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
