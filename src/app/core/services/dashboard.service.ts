import { Injectable, computed, inject, signal } from '@angular/core';
import { DashboardKpis, Sale } from '../models/admin.model';
import { ProductService } from './product.service';

const MOCK_SALES_TODAY: Sale[] = [
  { id: 'F001-111111', customer: 'Consumidor Final', total: 45.5, method: 'efectivo', timestamp: new Date(new Date().setHours(8, 30)) },
  { id: 'F001-222222', customer: 'Juan Perez', total: 120.0, method: 'tarjeta', timestamp: new Date(new Date().setHours(9, 15)) },
  { id: 'F001-333333', customer: 'Maria Gómez', total: 15.0, method: 'efectivo', timestamp: new Date(new Date().setHours(11, 45)) }
];

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly productService = inject(ProductService);

  readonly todaySales = signal<Sale[]>(MOCK_SALES_TODAY);

  readonly kpis = computed<DashboardKpis>(() => {
    const products = this.productService.products();
    const sales = this.todaySales();

    const totalProducts = products.length;
    const criticalStock = products.filter(p => p.stock <= 10).length;
    const salesToday = sales.length;
    const revenueToday = sales.reduce((acc, sale) => acc + sale.total, 0);

    return {
      totalProducts,
      criticalStock,
      salesToday,
      revenueToday
    };
  });
}
