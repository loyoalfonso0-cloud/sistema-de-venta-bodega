import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss' // Reutiliza algunos estilos de products
})
export class CategoriesComponent {
  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);

  readonly categories = this.productService.categories;

  readonly isModalOpen = signal(false);

  readonly categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required]
  });

  openModal() {
    this.categoryForm.reset();
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;
    
    const value = this.categoryForm.value;
    const newCat = {
      id: `c${Date.now()}`,
      name: value.name!,
      description: value.description!,
      productCount: 0
    };

    this.productService.categories.update(items => [...items, newCat]);
    this.closeModal();
  }

  deleteCategory(id: string, productCount: number) {
    if (productCount > 0) {
      alert('No se puede eliminar una categoría con productos asociados.');
      return;
    }
    
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      this.productService.categories.update(items => items.filter(c => c.id !== id));
    }
  }
}
