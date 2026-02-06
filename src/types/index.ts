export interface Farmer {
  id: string;
  name: string;
  mobile: string;
  address: string;
}

export interface PurchaseItem {
  id: string;
  date?: string;
  quality: string;
  unitCount: number;
  weightPerUnit: number;
  totalWeight: number;
  pricePerKg: number;
  totalAmount: number;
  advance?: number;
}

export interface PurchaseTransaction {
  id: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
}

export interface AdvancePayment {
  id: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
  note?: string;
}

export interface Purchase {
  id: string;
  date: string; // First transaction date
  farmer: Farmer;
  transactions: PurchaseTransaction[]; // All purchase transactions date-wise
  advancePayments: AdvancePayment[]; // All advance payments date-wise
  totalAmount: number; // Sum of all transactions
  advanceAmount: number; // Sum of all advance payments
  pendingAmount: number; // totalAmount - advanceAmount
  paymentMethod: 'cash' | 'online'; // Default payment method
  // Legacy support - will be migrated
  items?: PurchaseItem[];
}

export interface SaleItem {
  id: string;
  quality: string;
  unitCount: number;
  weightPerUnit: number;
  totalWeight: number;
  pricePerKg: number;
  totalAmount: number;
}

export interface SaleAddition {
  id: string;
  type: 'labour' | 'paper' | 'rassi' | 'tape' | 'crate' | 'commission' | 'other';
  label: string; // Display name
  quantity: number;
  rate: number;
  totalAmount: number;
}

export interface SaleTransaction {
  id: string;
  date: string;
  items: SaleItem[];
  additions: SaleAddition[];
  totalItemAmount: number;
  totalAdditions: number;
  totalAmount: number;
}

export interface ReceivedPayment {
  id: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
  note?: string;
}

export interface Sale {
  id: string;
  date: string; // First transaction date
  buyer: {
    name: string;
    mobile: string;
    address: string;
  };
  transactions?: SaleTransaction[]; // All sale transactions date-wise
  receivedPayments?: ReceivedPayment[]; // All received payments date-wise
  totalAmount: number; // Sum of all transactions
  receivedAmount: number; // Sum of all received payments
  pendingAmount: number; // totalAmount - receivedAmount
  paymentMethod: 'cash' | 'online'; // Default payment method
  // Legacy support - will be migrated
  items?: SaleItem[];
  additions?: SaleAddition[];
  totalItemAmount?: number;
  totalAdditions?: number;
}

export interface Expense {
  id: string;
  date: string;
  type: 'labour' | 'petrol' | 'other';
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
}

export interface DailySummary {
  date: string;
  totalPurchases: number;
  totalSales: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  purchaseCount: number;
  saleCount: number;
}

export type TransactionType = 'purchase' | 'sale' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'online';
  details?: string;
  originalData?: Purchase | Sale | Expense;
}
