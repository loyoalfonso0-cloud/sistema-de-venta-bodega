import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'pos',
    loadComponent: () => import('./pos/pos.component').then((m) => m.Pos),
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
    canActivate: [authGuard, roleGuard('admin')]
  },
  { path: '**', redirectTo: 'login' }
];
