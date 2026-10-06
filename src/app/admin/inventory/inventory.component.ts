import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminInventoryService } from '../../core/services/admin-inventory.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { InventoryItem } from '../../core/models/admin.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
  private readonly inventoryService = inject(AdminInventoryService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly inventory = this.inventoryService.getInventoryView;
  readonly categories = this.productService.categories;

  // Filtros
  readonly searchTerm = signal('');
  readonly filterCategory = signal('');
  readonly onlyCritical = signal(false);

  readonly filteredInventory = computed(() => {
    let list = this.inventory();
    const term = this.searchTerm().toLowerCase();
    if (term) {
      list = list.filter(i => i.name.toLowerCase().includes(term) || i.sku.toLowerCase().includes(term));
    }
    const cat = this.filterCategory();
    if (cat) {
      list = list.filter(i => i.category === cat);
    }
    if (this.onlyCritical()) {
      list = list.filter(i => i.status === 'critico' || i.status === 'agotado');
    }
    return list;
  });

  // Modal
  readonly isModalOpen = signal(false);
  readonly modalMode = signal<'entrada' | 'salida'>('entrada');
  readonly selectedItem = signal<InventoryItem | null>(null);

  readonly movementForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: ['', Validators.required]
  });

  updateSearch(event: Event) {
    const el = event.target as HTMLInputElement;
    this.searchTerm.set(el.value);
  }

  updateCategory(event: Event) {
    const el = event.target as HTMLSelectElement;
    this.filterCategory.set(el.value);
  }

  toggleCritical() {
    this.onlyCritical.update(v => !v);
  }

  openModal(item: InventoryItem, mode: 'entrada' | 'salida') {
    this.selectedItem.set(item);
    this.modalMode.set(mode);
    this.movementForm.reset({ quantity: 1, reason: '' });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  saveMovement() {
    if (this.movementForm.invalid || !this.selectedItem()) return;

    const qty = this.movementForm.value.quantity!;
    const reason = this.movementForm.value.reason!;
    const sku = this.selectedItem()!.sku;
    const user = this.authService.userDisplayName();

    if (this.modalMode() === 'entrada') {
      this.inventoryService.registerEntry(sku, qty, reason, user);
    } else {
      if (this.selectedItem()!.currentStock < qty) {
        alert('Stock insuficiente');
        return;
      }
      this.inventoryService.registerExit(sku, qty, reason, user);
    }
    this.closeModal();
  }
}
