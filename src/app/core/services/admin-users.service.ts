import { Injectable, signal } from '@angular/core';
import { User, Role } from '../models/user.model';

const MOCK_USERS_ADMIN: User[] = [
  { id: '1', email: 'admin@bodega.com', name: 'Administrador Principal', role: 'admin', token: 'mock-token-admin', isActive: true, lastLogin: new Date() },
  { id: '2', email: 'vendedor@bodega.com', name: 'Juan Vendedor', role: 'vendedor', token: 'mock-token-vendedor', isActive: true, lastLogin: new Date() },
  { id: '3', email: 'caja2@bodega.com', name: 'Maria Cajera', role: 'vendedor', token: 'mock-token-caja2', isActive: false, lastLogin: new Date(Date.now() - 86400000 * 5) }
];

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  readonly users = signal<User[]>(MOCK_USERS_ADMIN);

  getUsers() {
    return this.users;
  }

  addUser(user: Partial<User>): void {
    const newUser: User = {
      id: Date.now().toString(),
      email: user.email || '',
      name: user.name || '',
      role: user.role || 'vendedor',
      token: `mock-token-${Date.now()}`,
      isActive: user.isActive !== undefined ? user.isActive : true,
      lastLogin: null
    };
    this.users.update(items => [...items, newUser]);
  }

  updateUser(id: string, changes: Partial<User>): void {
    this.users.update(items => items.map(u => u.id === id ? { ...u, ...changes } : u));
  }

  toggleUserStatus(id: string): void {
    this.users.update(items => items.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  }
}
