import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Purchase, Sale, Expense, DailySummary, Transaction } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);
const getTodayDate = () => new Date().toISOString().split('T')[0];

interface StoreContextType {
    purchases: Purchase[];
    sales: Sale[];
    expenses: Expense[];
    addPurchase: (purchase: Omit<Purchase, 'id'>) => Promise<Purchase>;
    updatePurchase: (id: string, purchase: Omit<Purchase, 'id'>) => Promise<Purchase>;
    deletePurchase: (id: string) => Promise<void>;
    addSale: (sale: Omit<Sale, 'id'>) => Promise<Sale>;
    updateSale: (id: string, sale: Omit<Sale, 'id'>) => Promise<void>;
    deleteSale: (id: string) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
    deleteExpense: (id: string) => Promise<void>;
    getDailySummary: (date: string) => DailySummary;
    todaySummary: DailySummary;
    getTransactions: (date?: string) => Transaction[];
    todayTransactions: Transaction[];
    loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('🔄 Loading data from Firestore...');
                const startTime = performance.now();

                const [purchasesSnapshot, salesSnapshot, expensesSnapshot] = await Promise.all([
                    getDocs(query(collection(db, 'purchases'), orderBy('date', 'desc'))),
                    getDocs(query(collection(db, 'sales'), orderBy('date', 'desc'))),
                    getDocs(query(collection(db, 'expenses'), orderBy('date', 'desc')))
                ]);

                const purchasesData = purchasesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Purchase));

                const salesData = salesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Sale));

                const expensesData = expensesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Expense));

                setPurchases(purchasesData);
                setSales(salesData);
                setExpenses(expensesData);

                const endTime = performance.now();
                console.log(`✅ Data loaded in ${(endTime - startTime).toFixed(2)}ms`);
                console.log(`📊 Loaded: ${purchasesData.length} purchases, ${salesData.length} sales, ${expensesData.length} expenses`);

                setLoading(false);
            } catch (error) {
                console.error('❌ Error loading data from Firestore:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const addPurchase = useCallback(async (purchase: Omit<Purchase, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, 'purchases'), purchase);
            const newPurchase: Purchase = {
                ...purchase,
                id: docRef.id,
            };
            setPurchases(prev => [newPurchase, ...prev]);
            return newPurchase;
        } catch (error) {
            console.error('Error adding purchase to Firestore:', error);
            throw error;
        }
    }, []);

    const updatePurchase = useCallback(async (id: string, purchase: Omit<Purchase, 'id'>) => {
        const updatedPurchase: Purchase = {
            ...purchase,
            id,
        };

        try {
            const purchaseRef = doc(db, 'purchases', id);
            await setDoc(purchaseRef, { ...purchase }, { merge: true });
            setPurchases(prev => prev.map(p => p.id === id ? updatedPurchase : p));
            return updatedPurchase;
        } catch (error) {
            console.error('Error updating purchase in Firestore:', error);
            throw error;
        }
    }, []);

    const addSale = useCallback(async (sale: Omit<Sale, 'id'>) => {
        try {
            const saleData = { ...sale };
            const docRef = await addDoc(collection(db, 'sales'), saleData);
            const newSale: Sale = {
                ...saleData,
                id: docRef.id,
            };
            setSales(prev => [newSale, ...prev]);
            return newSale;
        } catch (error) {
            console.error('Error adding sale to Firestore:', error);
            throw error;
        }
    }, []);

    const updateSale = useCallback(async (id: string, sale: Omit<Sale, 'id'>) => {
        try {
            const saleRef = doc(db, 'sales', id);
            await setDoc(saleRef, { ...sale }, { merge: true });
            setSales(prev => prev.map(s => (s.id === id ? { ...sale, id } : s)));
        } catch (error) {
            console.error('Error updating sale in Firestore:', error);
            throw error;
        }
    }, []);

    const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, 'expenses'), expense);
            const newExpense: Expense = {
                ...expense,
                id: docRef.id,
            };
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        } catch (error) {
            console.error('Error adding expense to Firestore:', error);
            throw error;
        }
    }, []);

    const deletePurchase = useCallback(async (id: string) => {
        try {
            const purchaseRef = doc(db, 'purchases', id);
            await setDoc(purchaseRef, { deleted: true }, { merge: true });
            setPurchases(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting purchase from Firestore:', error);
            throw error;
        }
    }, []);

    const deleteSale = useCallback(async (id: string) => {
        try {
            const saleRef = doc(db, 'sales', id);
            await setDoc(saleRef, { deleted: true }, { merge: true });
            setSales(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting sale from Firestore:', error);
            throw error;
        }
    }, []);

    const deleteExpense = useCallback(async (id: string) => {
        try {
            const expenseRef = doc(db, 'expenses', id);
            await setDoc(expenseRef, { deleted: true }, { merge: true });
            setExpenses(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting expense from Firestore:', error);
            throw error;
        }
    }, []);

    const getDailySummary = useCallback((date: string): DailySummary => {
        const dayPurchases = purchases.filter(p => p.date === date);
        const daySales = sales.filter(s => s.date === date);
        const dayExpenses = expenses.filter(e => e.date === date);

        const totalPurchases = dayPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalSales = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        const grossProfit = totalSales - totalPurchases;
        const netProfit = grossProfit - totalExpenses;

        return {
            date,
            totalPurchases,
            totalSales,
            totalExpenses,
            grossProfit,
            netProfit,
            purchaseCount: dayPurchases.length,
            saleCount: daySales.length,
        };
    }, [purchases, sales, expenses]);

    const todaySummary = useMemo(() => getDailySummary(getTodayDate()), [getDailySummary]);

    const getTransactions = useCallback((date?: string): Transaction[] => {
        const filterDate = date || getTodayDate();

        const purchaseTransactions: Transaction[] = purchases
            .filter(p => p.date === filterDate)
            .map(p => ({
                id: `purchase-${p.id}`,
                type: 'purchase' as const,
                date: p.date,
                description: `Grapes from ${p.farmer.name}`,
                amount: p.totalAmount,
                paymentMethod: p.paymentMethod,
                details: `${p.items.length} lots | ${p.items.reduce((sum, item) => sum + item.totalWeight, 0).toFixed(1)} kg total`,
                originalData: p,
            }));

        const saleTransactions: Transaction[] = sales
            .filter(s => s.date === filterDate)
            .map(s => {
                const safeSale = s as any;
                const description = s.buyer
                    ? `Invoice to ${s.buyer.name}`
                    : `${safeSale.itemName || 'Item'} to ${safeSale.customerName || 'Customer'}`;

                const details = s.items
                    ? `${s.items.length} items | ₹${s.totalAmount.toLocaleString()}`
                    : `${safeSale.quantity || 0} tons @ ₹${(safeSale.pricePerTon || 0).toLocaleString()}/ton`;

                return {
                    id: `sale-${s.id}`,
                    type: 'sale' as const,
                    date: s.date,
                    description,
                    amount: s.totalAmount,
                    paymentMethod: s.paymentMethod,
                    details,
                    originalData: s,
                };
            });

        const expenseTransactions: Transaction[] = expenses
            .filter(e => e.date === filterDate)
            .map(e => ({
                id: `expense-${e.id}`,
                type: 'expense' as const,
                date: e.date,
                description: e.description,
                amount: e.amount,
                paymentMethod: e.paymentMethod,
                details: e.type.charAt(0).toUpperCase() + e.type.slice(1),
                originalData: e,
            }));

        const allTransactions = [...purchaseTransactions, ...saleTransactions, ...expenseTransactions];
        const uniqueTransactions = Array.from(new Map(allTransactions.map(item => [item.id, item])).values());

        return uniqueTransactions;
    }, [purchases, sales, expenses]);

    const todayTransactions = useMemo(() => getTransactions(), [getTransactions]);

    const value = {
        purchases,
        sales,
        expenses,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addSale,
        updateSale,
        deleteSale,
        addExpense,
        deleteExpense,
        getDailySummary,
        todaySummary,
        getTransactions,
        todayTransactions,
        loading,
    };

    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
