import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.html', // Apontando para o arquivo HTML externo!
  standalone: false
})
export class RoomsComponent implements OnInit {

  rooms: Room[] = [];
  isLoading = true;
  error = '';

  constructor(
    public authService: AuthService,
    private roomService: RoomService,
    private router: Router,
    private cdr: ChangeDetectorRef // Ferramenta que força a tela a atualizar
  ) {}

  ngOnInit(): void {
    this.fetchRooms();
  }

  fetchRooms(): void {
    this.isLoading = true;
    this.error = '';

    this.roomService.getAllRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        this.isLoading = false;

        // MÁGICA: Força o HTML a desenhar os cards imediatamente!
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar salas:', err);
        this.error = 'Falha ao carregar o catálogo de salas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'AVAILABLE': 'Disponível',
      'OCCUPIED': 'Ocupada',
      'MAINTENANCE': 'Manutenção'
    };
    return statusMap[status] || status;
  }
}
