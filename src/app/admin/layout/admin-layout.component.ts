import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly sidebarCollapsed = signal(false);
  readonly currentModuleTitle = signal('Dashboard');
  readonly currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor() {
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') {
      this.sidebarCollapsed.set(true);
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTitle(event.urlAfterRedirects);
    });
    this.updateTitle(this.router.url);
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
    localStorage.setItem('sidebar_collapsed', String(this.sidebarCollapsed()));
  }

  private updateTitle(url: string) {
    if (url.includes('/admin/inventario')) this.currentModuleTitle.set('Inventario');
    else if (url.includes('/admin/productos')) this.currentModuleTitle.set('Productos');
    else if (url.includes('/admin/categorias')) this.currentModuleTitle.set('Categorías');
    else if (url.includes('/admin/usuarios')) this.currentModuleTitle.set('Usuarios');
    else this.currentModuleTitle.set('Dashboard');
  }
}
