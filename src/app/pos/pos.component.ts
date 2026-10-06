import { Component, computed, inject, signal } from '@angular/core';

import { STORE_INFO } from '../core/constants';
import { ProductService } from '../core/services/product.service';
import { AuthService } from '../core/services/auth.service';
import {
  AccountType,
  CartItem,
  Customer,
  Invoice,
  PaymentMethod,
  PosStep,
  Product,
  StepItem
} from './pos.models';

const TAX_RATE = 0.18;

const round2 = (value: number): number => Math.round(value * 100) / 100;
const PIN_LENGTH = 4;
const MIN_DOCUMENT_LENGTH = 6;

const CONSUMIDOR_FINAL: Customer = { documentId: '00000000', fullName: 'Consumidor Final' };

const STEP_LABELS: Record<PosStep, string> = {
  1: 'Identificación',
  2: 'Escaneo de Productos',
  3: 'Método de Pago',
  4: 'Selección de Cuenta',
  5: 'Pasarela y PIN',
  6: 'Facturación y Ticket'
};

const STEP_ERRORS: Record<PosStep, string> = {
  1: `El documento debe tener al menos ${MIN_DOCUMENT_LENGTH} caracteres.`,
  2: 'Agrega al menos un producto al carrito.',
  3: 'Selecciona un método de pago.',
  4: 'Selecciona un tipo de cuenta.',
  5: `El PIN debe tener ${PIN_LENGTH} dígitos.`,
  6: ''
};

@Component({
  selector: 'app-pos',
  imports: [],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss',
})
export class Pos {
  readonly authService = inject(AuthService);
  readonly user = this.authService.currentUser;
  private readonly productService = inject(ProductService);

  readonly products = computed<Product[]>(() => this.productService.products().filter(p => p.isActive));

  readonly store = STORE_INFO;

  // ---- Estado (signals escribibles) ----
  readonly currentStep = signal<PosStep>(1);
  readonly customer = signal<Customer | null>(null);
  readonly documentInput = signal<string>('');
  readonly cart = signal<CartItem[]>([]);
  readonly barcodeInput = signal<string>('');
  readonly paymentMethod = signal<PaymentMethod | null>(null);
  readonly accountType = signal<AccountType | null>(null);
  readonly pin = signal<string>('');
  readonly cashReceived = signal<number>(0);
  readonly invoice = signal<Invoice | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // ---- Estado derivado (computed) ----
  readonly subtotal = computed<number>(() =>
    round2(this.cart().reduce((acc, item) => acc + item.product.unitPrice * item.quantity, 0))
  );

  readonly tax = computed<number>(() => round2(this.subtotal() * TAX_RATE));

  readonly total = computed<number>(() => round2(this.subtotal() + this.tax()));

  readonly change = computed<number>(() => round2(this.cashReceived() - this.total()));

  readonly itemCount = computed<number>(() =>
    this.cart().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly canAdvance = computed<boolean>(() => {
    switch (this.currentStep()) {
      case 1:
        return this.documentInput().length >= MIN_DOCUMENT_LENGTH;
      case 2:
        return this.cart().length > 0;
      case 3: {
        const method = this.paymentMethod();
        if (method === 'efectivo') {
          return this.cashReceived() >= this.total();
        }
        return method !== null;
      }
      case 4:
        return this.accountType() !== null;
      case 5:
        return this.pin().length === PIN_LENGTH;
      case 6:
        return true;
    }
  });

  readonly stepLabel = computed<string>(() => STEP_LABELS[this.currentStep()]);

  readonly steps = computed<StepItem[]>(() => [
    { id: 1, label: 'Identificación' },
    { id: 2, label: 'Escaneo' },
    { id: 3, label: 'Método' },
    { id: 4, label: 'Cuenta' },
    { id: 5, label: 'PIN' },
    { id: 6, label: 'Comprobante' }
  ]);

  // ---- Navegación entre pasos ----
  next(): void {
    const step = this.currentStep();

    if (!this.canAdvance()) {
      this.errorMessage.set(this.stepError(step));
      return;
    }

    this.errorMessage.set(null);

    let target: PosStep = step;
    switch (step) {
      case 1:
        target = 2;
        break;
      case 2:
        target = 3;
        break;
      case 3:
        target = this.paymentMethod() === 'efectivo' ? 6 : 4;
        break;
      case 4:
        target = 5;
        break;
      case 5:
        target = 6;
        break;
      case 6:
        break;
    }

    if (target === step) {
      return;
    }

    this.currentStep.set(target);

    if (target === 6) {
      this.generateInvoice();
      if (this.paymentMethod() === 'tarjeta') {
        // El PIN ya se usó: no debe persistir.
        this.pin.set('');
      }
    }
  }

  back(): void {
    this.errorMessage.set(null);

    switch (this.currentStep()) {
      case 1:
        break;
      case 2:
        this.currentStep.set(1);
        break;
      case 3:
        this.currentStep.set(2);
        break;
      case 4:
        this.currentStep.set(3);
        break;
      case 5:
        this.currentStep.set(4);
        break;
      case 6:
        this.currentStep.set(this.paymentMethod() === 'efectivo' ? 3 : 5);
        break;
    }
  }

  reset(): void {
    this.currentStep.set(1);
    this.customer.set(null);
    this.documentInput.set('');
    this.cart.set([]);
    this.barcodeInput.set('');
    this.paymentMethod.set(null);
    this.accountType.set(null);
    this.pin.set('');
    this.cashReceived.set(0);
    this.invoice.set(null);
    this.errorMessage.set(null);
  }

  omitDocument(): void {
    this.customer.set(CONSUMIDOR_FINAL);
    this.documentInput.set(CONSUMIDOR_FINAL.documentId);
    this.errorMessage.set(null);
    this.currentStep.set(2);
  }

  // ---- Carrito ----
  addProduct(product: Product): void {
    this.cart.update((items) => {
      const exists = items.some((item) => item.product.sku === product.sku);
      if (exists) {
        return items.map((item) =>
          item.product.sku === product.sku ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeProduct(sku: string): void {
    this.cart.update((items) => items.filter((item) => item.product.sku !== sku));
  }

  updateQuantity(sku: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeProduct(sku);
      return;
    }
    this.cart.update((items) =>
      items.map((item) => (item.product.sku === sku ? { ...item, quantity } : item))
    );
  }

  // ---- Efectivo ----
  setCashReceived(amount: number): void {
    this.cashReceived.set(Number.isFinite(amount) ? Math.max(0, amount) : 0);
  }

  onCashInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.setCashReceived(target.valueAsNumber);
    }
  }

  // ---- Código de barras ----
  onBarcodeInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.barcodeInput.set(target.value);
    }
  }

  onBarcodeSubmit(): void {
    const code = this.barcodeInput().trim();
    if (code === '') {
      return;
    }

    const product = this.products().find((p) => p.sku === code);
    if (product) {
      this.addProduct(product);
      this.errorMessage.set(null);
    } else {
      this.errorMessage.set('Producto no encontrado: ' + code);
    }
    this.barcodeInput.set('');
  }

  // ---- Entrada numérica (paso 1: documento, paso 5: PIN) ----
  appendDigit(digit: string): void {
    if (!/^\d$/.test(digit)) {
      return;
    }

    switch (this.currentStep()) {
      case 1:
        this.documentInput.update((value) => value + digit);
        break;
      case 5:
        this.pin.update((value) => (value.length < PIN_LENGTH ? value + digit : value));
        break;
      default:
        break;
    }
  }

  deleteLastDigit(): void {
    switch (this.currentStep()) {
      case 1:
        this.documentInput.update((value) => value.slice(0, -1));
        break;
      case 5:
        this.pin.update((value) => value.slice(0, -1));
        break;
      default:
        break;
    }
  }

  clearInput(): void {
    switch (this.currentStep()) {
      case 1:
        this.documentInput.set('');
        break;
      case 2:
        this.barcodeInput.set('');
        break;
      case 5:
        this.pin.set('');
        break;
      default:
        break;
    }
  }

  // ---- Facturación ----
  generateInvoice(): void {
    const method = this.paymentMethod();
    if (method === null) {
      this.errorMessage.set(STEP_ERRORS[3]);
      return;
    }

    const customer: Customer = this.customer() ?? {
      documentId: this.documentInput(),
      fullName: 'Cliente Genérico'
    };

    this.invoice.set({
      number: `F001-${Date.now().toString().slice(-8)}`,
      customer,
      items: this.cart(),
      subtotal: this.subtotal(),
      tax: this.tax(),
      total: this.total(),
      method,
      issuedAt: new Date()
    });
    
    // Descontar inventario
    for (const item of this.cart()) {
      this.productService.decrementStock(item.product.sku, item.quantity);
    }
    
    this.errorMessage.set(null);
  }

  printInvoice(): void {
    window.print();
  }

  sendWhatsApp(): void {
    const inv = this.invoice();
    if (!inv) {
      return;
    }
    const mensaje = encodeURIComponent(
      `${this.store.name} - Boleta ${inv.number} - Total: S/ ${inv.total.toFixed(2)}. ¡Gracias por su compra!`
    );
    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  }

  private stepError(step: PosStep): string {
    if (step === 3 && this.paymentMethod() === 'efectivo') {
      return 'El efectivo recibido no cubre el total.';
    }
    return STEP_ERRORS[step];
  }
}
