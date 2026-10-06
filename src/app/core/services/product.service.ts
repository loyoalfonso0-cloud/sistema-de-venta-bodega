import { Injectable, signal } from '@angular/core';
import { Product } from '../../pos/pos.models';
import { Category } from '../models/admin.model';

const MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Abarrotes', description: 'Productos no perecederos', productCount: 5 },
  { id: 'c2', name: 'Lácteos', description: 'Leche, quesos y derivados', productCount: 3 },
  { id: 'c3', name: 'Bebidas', description: 'Gaseosas y jugos', productCount: 4 },
  { id: 'c4', name: 'Limpieza', description: 'Artículos de aseo', productCount: 3 },
  { id: 'c5', name: 'Snacks', description: 'Galletas y papas', productCount: 3 }
];

const MOCK_PRODUCTS: Product[] = [
  { sku: 'ABR-001', name: 'Arroz Faraón 1kg', unitPrice: 4.5, stock: 50, category: 'Abarrotes', isActive: true },
  { sku: 'ABR-002', name: 'Azúcar Blanca 1kg', unitPrice: 3.8, stock: 40, category: 'Abarrotes', isActive: true },
  { sku: 'ABR-003', name: 'Fideos Don Vittorio 500g', unitPrice: 2.5, stock: 60, category: 'Abarrotes', isActive: true },
  { sku: 'ABR-004', name: 'Aceite Primor 1L', unitPrice: 8.5, stock: 20, category: 'Abarrotes', isActive: true },
  { sku: 'ABR-005', name: 'Atún Florida', unitPrice: 5.5, stock: 30, category: 'Abarrotes', isActive: true },
  { sku: 'LAC-001', name: 'Leche Gloria 400g', unitPrice: 3.5, stock: 100, category: 'Lácteos', isActive: true },
  { sku: 'LAC-002', name: 'Queso Edam 200g', unitPrice: 7.5, stock: 15, category: 'Lácteos', isActive: true },
  { sku: 'LAC-003', name: 'Yogurt Laive 1L', unitPrice: 6.0, stock: 25, category: 'Lácteos', isActive: true },
  { sku: 'BEB-001', name: 'Inca Kola 1.5L', unitPrice: 7.0, stock: 45, category: 'Bebidas', isActive: true },
  { sku: 'BEB-002', name: 'Coca Cola 2.25L', unitPrice: 9.5, stock: 35, category: 'Bebidas', isActive: true },
  { sku: 'BEB-003', name: 'Agua San Luis 625ml', unitPrice: 1.5, stock: 80, category: 'Bebidas', isActive: true },
  { sku: 'BEB-004', name: 'Jugo Frugos 1L', unitPrice: 4.5, stock: 20, category: 'Bebidas', isActive: true },
  { sku: 'LIM-001', name: 'Detergente Ariel 1kg', unitPrice: 12.0, stock: 10, category: 'Limpieza', isActive: true },
  { sku: 'LIM-002', name: 'Lejía Clorox 1L', unitPrice: 3.5, stock: 40, category: 'Limpieza', isActive: true },
  { sku: 'LIM-003', name: 'Papel Higiénico Suave (4)', unitPrice: 5.5, stock: 55, category: 'Limpieza', isActive: true },
  { sku: 'SNA-001', name: 'Galletas Oreo', unitPrice: 1.2, stock: 120, category: 'Snacks', isActive: true },
  { sku: 'SNA-002', name: 'Papas Lays 160g', unitPrice: 4.5, stock: 30, category: 'Snacks', isActive: true },
  { sku: 'SNA-003', name: 'Doritos 150g', unitPrice: 4.5, stock: 25, category: 'Snacks', isActive: false }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly products = signal<Product[]>(MOCK_PRODUCTS);
  readonly categories = signal<Category[]>(MOCK_CATEGORIES);

  generateSku(categoryName: string): string {
    const prefix = categoryName.substring(0, 3).toUpperCase();
    const catProducts = this.products().filter(p => p.sku.startsWith(prefix + '-'));
    let maxNum = 0;
    
    for (const p of catProducts) {
      const parts = p.sku.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    
    const nextNum = maxNum + 1;
    const padding = nextNum.toString().padStart(3, '0');
    return `${prefix}-${padding}`;
  }

  addProduct(product: Omit<Product, 'sku'>): Product {
    const sku = this.generateSku(product.category);
    const newProduct: Product = { ...product, sku };
    this.products.update(items => [...items, newProduct]);
    return newProduct;
  }

  updateProduct(sku: string, changes: Partial<Product>): void {
    this.products.update(items => items.map(p => p.sku === sku ? { ...p, ...changes } : p));
  }

  deleteProduct(sku: string): void {
    this.products.update(items => items.filter(p => p.sku !== sku));
  }

  decrementStock(sku: string, quantity: number): void {
    this.products.update(items => items.map(p => {
      if (p.sku === sku) {
        return { ...p, stock: Math.max(0, p.stock - quantity) };
      }
      return p;
    }));
  }

  incrementStock(sku: string, quantity: number): void {
    this.products.update(items => items.map(p => {
      if (p.sku === sku) {
        return { ...p, stock: p.stock + quantity };
      }
      return p;
    }));
  }

  getProductBySku(sku: string): Product | undefined {
    return this.products().find(p => p.sku === sku);
  }
}
