import { Injectable, computed, inject, signal } from '@angular/core';
import { InventoryItem, Movement } from '../models/admin.model';
import { ProductService } from './product.service';

const MOCK_MOVEMENTS: Movement[] = [
  { id: 'M001', type: 'entrada', sku: 'ABR-001', productName: 'Arroz Faraón 1kg', quantity: 20, reason: 'Compra a proveedor', userName: 'Administrador Principal', timestamp: new Date(Date.now() - 86400000 * 2) },
  { id: 'M002', type: 'entrada', sku: 'LAC-001', productName: 'Leche Gloria 400g', quantity: 50, reason: 'Compra a proveedor', userName: 'Administrador Principal', timestamp: new Date(Date.now() - 86400000 * 1) },
  { id: 'M003', type: 'salida', sku: 'SNA-001', productName: 'Galletas Oreo', quantity: 5, reason: 'Vencimiento', userName: 'Administrador Principal', timestamp: new Date() }
];

@Injectable({
  providedIn: 'root'
})
export class AdminInventoryService {
  private readonly productService = inject(ProductService);
  
  readonly movements = signal<Movement[]>(MOCK_MOVEMENTS);

  readonly getInventoryView = computed<InventoryItem[]>(() => {
    const products = this.productService.products();
    const movs = this.movements();

    return products.map(p => {
      let entries = 0;
      let exits = 0;

      for (const m of movs) {
        if (m.sku === p.sku) {
          if (m.type === 'entrada') entries += m.quantity;
          if (m.type === 'salida') exits += m.quantity;
        }
      }

      // El initialStock simulado (asumiendo que el stock actual es el que tiene el productService 
      // menos entradas + salidas si es que consideramos que "stock actual = initial + entries - exits").
      // Para simularlo simplemente hacemos reverse engineering o asumimos que currentStock es p.stock:
      const currentStock = p.stock;
      const initialStock = currentStock - entries + exits;

      let status: InventoryItem['status'] = 'optimo';
      if (currentStock === 0) status = 'agotado';
      else if (currentStock <= 10) status = 'critico';
      else if (currentStock <= 25) status = 'bajo';

      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        initialStock,
        entries,
        exits,
        currentStock,
        status
      };
    });
  });

  registerEntry(sku: string, quantity: number, reason: string, userName: string): void {
    const product = this.productService.getProductBySku(sku);
    if (!product) return;

    this.productService.incrementStock(sku, quantity);
    
    const newMovement: Movement = {
      id: `M${Date.now().toString().slice(-4)}`,
      type: 'entrada',
      sku,
      productName: product.name,
      quantity,
      reason,
      userName,
      timestamp: new Date()
    };
    
    this.movements.update(m => [newMovement, ...m]);
  }

  registerExit(sku: string, quantity: number, reason: string, userName: string): void {
    const product = this.productService.getProductBySku(sku);
    if (!product) return;

    this.productService.decrementStock(sku, quantity);
    
    const newMovement: Movement = {
      id: `M${Date.now().toString().slice(-4)}`,
      type: 'salida',
      sku,
      productName: product.name,
      quantity,
      reason,
      userName,
      timestamp: new Date()
    };
    
    this.movements.update(m => [newMovement, ...m]);
  }
}
