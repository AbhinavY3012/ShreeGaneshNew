import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    History,
    Search,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Receipt,
    Download
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { useStore } from '@/hooks/useStore';
import { TransactionList } from '@/components/TransactionList';
import { Transaction } from '@/types';

export const TradingHistory = () => {
    const { purchases, sales, expenses, getTransactions, loading } = useStore();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const transactions = useMemo(() => {
        return getTransactions(date);
    }, [getTransactions, date]);

    if (loading) return null;

    return (
        <Layout>
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="section-title">Trading History</h2>
                        <p className="text-muted-foreground">Audit your complete business history by date</p>
                    </div>

                    <div className="flex items-center gap-3 bg-card p-2 rounded-2xl border border-border shadow-sm">
                        <Calendar className="w-5 h-5 text-primary ml-2" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Transactions for {new Date(date).toLocaleDateString()}</h3>
                        <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            <Download className="w-3 h-3" /> Export PDF
                        </button>
                    </div>

                    <TransactionList transactions={transactions} />

                    {transactions.length === 0 && (
                        <div className="text-center py-20">
                            <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                            <p className="text-muted-foreground">No transactions found for this date.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};
