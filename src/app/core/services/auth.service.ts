import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../models/user.model';

const MOCK_USERS: User[] = [
  { id: '1', email: 'admin@bodega.com', name: 'Administrador Principal', role: 'admin', token: 'mock-token-admin', isActive: true, lastLogin: new Date() },
  { id: '2', email: 'vendedor@bodega.com', name: 'Juan Vendedor', role: 'vendedor', token: 'mock-token-vendedor', isActive: true, lastLogin: new Date() }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  
  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = computed<boolean>(() => this.currentUser() !== null);
  readonly userRole = computed<Role | null>(() => this.currentUser()?.role ?? null);
  readonly userDisplayName = computed<string>(() => this.currentUser()?.name ?? 'Invitado');

  constructor() {
    try {
      const raw = sessionStorage.getItem('pos_user');
      if (raw) {
        this.currentUser.set(JSON.parse(raw) as User);
      }
    } catch {
      sessionStorage.removeItem('pos_user');
      this.currentUser.set(null);
    }
  }

  login(email: string, password: string): boolean {
    const valid = 
      (email === 'admin@bodega.com' && password === 'admin123') || 
      (email === 'vendedor@bodega.com' && password === 'vendedor123');

    if (valid) {
      const foundUser = MOCK_USERS.find(u => u.email === email)!;
      this.currentUser.set(foundUser);
      sessionStorage.setItem('pos_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }

  logout(): void {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      sessionStorage.removeItem('pos_user');
      this.currentUser.set(null);
      this.router.navigate(['/login']);
    }
  }
}
