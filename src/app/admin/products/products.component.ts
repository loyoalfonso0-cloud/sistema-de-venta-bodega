import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../pos/pos.models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss' // Compartiremos estilos de inventory
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);

  readonly products = this.productService.products;
  readonly categories = this.productService.categories;

  readonly searchTerm = signal('');
  readonly filterCategory = signal('');

  readonly filteredProducts = computed(() => {
    let list = this.products();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }
    const cat = this.filterCategory();
    if (cat) {
      list = list.filter(p => p.category === cat);
    }
    return list;
  });

  readonly isModalOpen = signal(false);
  readonly selectedProduct = signal<Product | null>(null);

  readonly productForm = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  updateSearch(event: Event) {
    const el = event.target as HTMLInputElement;
    this.searchTerm.set(el.value);
  }

  updateCategory(event: Event) {
    const el = event.target as HTMLSelectElement;
    this.filterCategory.set(el.value);
  }

  openModal(product?: Product) {
    if (product) {
      this.selectedProduct.set(product);
      this.productForm.patchValue(product);
    } else {
      this.selectedProduct.set(null);
      this.productForm.reset({ unitPrice: 0, stock: 0, isActive: true });
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    const formValue = this.productForm.value as Omit<Product, 'sku'>;

    if (this.selectedProduct()) {
      this.productService.updateProduct(this.selectedProduct()!.sku, formValue);
    } else {
      this.productService.addProduct(formValue);
    }
    
    this.closeModal();
  }

  deleteProduct(sku: string) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      this.productService.deleteProduct(sku);
    }
  }
}
