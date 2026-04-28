import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  provider: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  // Busca todos os usuários do banco de dados
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.apiUrl);
  }

  // Altera o privilégio do usuário (Ex: de USER para ADMIN)
  updateUserRole(id: string, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { role: newRole });
  }
}
