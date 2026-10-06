export interface InventoryItem { 
  sku: string; 
  name: string; 
  category: string; 
  initialStock: number; 
  entries: number; 
  exits: number; 
  currentStock: number; 
  status: 'optimo' | 'bajo' | 'critico' | 'agotado'; 
}

export interface Movement { 
  id: string; 
  type: 'entrada' | 'salida'; 
  sku: string; 
  productName: string; 
  quantity: number; 
  reason: string; 
  userName: string; 
  timestamp: Date; 
}

export interface Category { 
  id: string; 
  name: string; 
  description: string; 
  productCount: number; 
}

export interface Sale { 
  id: string; 
  customer: string; 
  total: number; 
  method: string; 
  timestamp: Date; 
}

export interface DashboardKpis { 
  totalProducts: number; 
  criticalStock: number; 
  salesToday: number; 
  revenueToday: number; 
}
