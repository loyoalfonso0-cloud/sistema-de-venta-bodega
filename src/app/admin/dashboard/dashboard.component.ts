import { Component, inject } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminInventoryService } from '../../core/services/admin-inventory.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly inventoryService = inject(AdminInventoryService);

  readonly kpis = this.dashboardService.kpis;
  readonly todaySales = this.dashboardService.todaySales;
  readonly movements = this.inventoryService.movements;
}
