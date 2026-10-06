export type PosStep = 1 | 2 | 3 | 4 | 5 | 6;

export type PaymentMethod = 'efectivo' | 'tarjeta';

export type AccountType = 'ahorros' | 'corriente';

export interface Customer {
  documentId: string;
  fullName: string;
}

export interface Product {
  sku: string;
  name: string;
  unitPrice: number;
  stock: number;
  category: string;
  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaymentState {
  method: PaymentMethod | null;
  account: AccountType | null;
  pin: string;
}

export interface Invoice {
  number: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  method: PaymentMethod;
  issuedAt: Date;
}

export interface StepItem {
  id: PosStep;
  label: string;
}
