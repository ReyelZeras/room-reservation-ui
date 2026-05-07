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
  // CORREÇÃO: URL Relativa
  private apiUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateUserRole(id: string, newRole: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { role: newRole });
  }

  updateUser(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  changePassword(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/password`, payload);
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, {});
  }

  // NOVA FUNÇÃO (Falha 5: Excluir Permanente)
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
