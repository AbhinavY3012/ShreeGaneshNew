import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Receipt,
    Plus,
    Trash2,
    IndianRupee,
    Calendar,
    Filter,
    Tag
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { useStore } from '@/hooks/useStore';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { Expense } from '@/types';

export const Expenses = () => {
    const { expenses, addExpense, loading } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) return null;

    return (
        <Layout>
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="section-title text-destructive">Expenses</h2>
                        <p className="text-muted-foreground">Monitor your operating costs (Labour, Petrol, Rassi, etc.)</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 self-start bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20"
                    >
                        <Plus className="w-5 h-5" />
                        Log New Expense
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {expenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tight">
                                                {expense.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-foreground">{expense.description}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${expense.paymentMethod === 'cash' ? 'bg-success/10 text-success' : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {expense.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-base font-black text-destructive">₹{expense.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <Receipt className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
                                            <p className="text-muted-foreground italic">No expenses logged yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addExpense}
            />
        </Layout>
    );
};
