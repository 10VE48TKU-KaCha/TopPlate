export type UserRole = 'SUPER_ADMIN' | 'STORE_ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  storeId?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  recipeCost?: number;
  profitMargin?: number;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  unitCost?: number;
}

export interface Table {
  id: string;
  storeId: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName?: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  recipeCost?: number;
  subtotal: number;
}

export interface Order {
  id: string;
  storeId: string;
  tableId?: string;
  tableNumber?: string;
  status: 'PENDING' | 'COOKING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  totalCost?: number;
  grossProfit?: number;
  customerNotes?: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface FinancialsSummary {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossProfitMarginPercent: number;
  completedOrdersCount: number;
}

export interface MenuProfitabilityItem {
  menuItemId: string;
  menuItemName: string;
  categoryName?: string;
  price: number;
  recipeCost: number;
  profitPerUnit: number;
  profitMarginPercent: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}
