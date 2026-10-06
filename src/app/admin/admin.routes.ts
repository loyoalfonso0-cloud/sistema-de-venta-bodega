import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'inventario', loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
      { path: 'productos', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
      { path: 'categorias', loadComponent: () => import('./categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'usuarios', loadComponent: () => import('./users/users.component').then(m => m.UsersComponent) }
    ]
  }
];
