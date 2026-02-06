import { useState, useMemo } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  Receipt,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  IndianRupee,
  CreditCard,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionList } from '@/components/TransactionList';
import { ProfitChart } from '@/components/ProfitChart';
import { AddPurchaseModal } from '@/components/AddPurchaseModal';
import { AddSaleModal } from '@/components/AddSaleModal';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { PurchaseDetailModal } from '@/components/PurchaseDetailModal';
import { useStore } from '@/hooks/useStore';
import { Purchase, Sale, Transaction } from '@/types';
import { Layout } from '@/components/Layout';

const Index = () => {
  const {
    addPurchase,
    updatePurchase,
    addSale,
    updateSale,
    addExpense,
    todaySummary,
    todayTransactions,
    loading,
    sales
  } = useStore();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'sale' | 'purchase'>('all');

  const filteredTransactions = useMemo(() => {
    return todayTransactions.filter(t => transactionFilter === 'all' || t.type === transactionFilter);
  }, [todayTransactions, transactionFilter]);

  const paymentAnalysis = useMemo(() => {
    const todaySales = todayTransactions.filter(t => t.type === 'sale');
    const saleCash = todaySales.reduce((sum, s) => s.paymentMethod === 'cash' ? sum + s.amount : sum, 0);
    const saleOnline = todaySales.reduce((sum, s) => s.paymentMethod === 'online' ? sum + s.amount : sum, 0);

    const totalPending = todaySales.reduce((sum, t) => {
      const original = t.originalData as Sale;
      return sum + (original?.pendingAmount || 0);
    }, 0);

    const totalReceived = todaySales.reduce((sum, t) => {
      const original = t.originalData as Sale;
      return sum + (original?.receivedAmount || 0);
    }, 0);

    return { saleCash, saleOnline, totalPending, totalReceived };
  }, [todayTransactions]);

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.type === 'purchase' && transaction.originalData) {
      setSelectedPurchase(transaction.originalData as Purchase);
    } else if (transaction.type === 'sale' && transaction.originalData) {
      setSaleToEdit(transaction.originalData as Sale);
      setIsSaleModalOpen(true);
    }
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setPurchaseToEdit(purchase);
    setSelectedPurchase(null);
    setIsPurchaseModalOpen(true);
  };

  if (loading) return null;

  return (
    <Layout>
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800">Business Dashboard</h2>
          <p className="text-slate-400 font-semibold text-sm">Today's Trading Performance Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Sales Today" value={`₹${todaySummary.totalSales.toLocaleString()}`} subtitle={`${todaySummary.saleCount} entries`} icon={ArrowUpRight} variant="success" />
          <StatCard title="Purchases" value={`₹${todaySummary.totalPurchases.toLocaleString()}`} subtitle={`${todaySummary.purchaseCount} lots`} icon={ArrowDownLeft} variant="warning" />
          <StatCard title="Expenses" value={`₹${todaySummary.totalExpenses.toLocaleString()}`} subtitle="Operating Costs" icon={Receipt} />
          <StatCard title="Net Profit" value={`₹${todaySummary.netProfit.toLocaleString()}`} subtitle="Today's Earnings" icon={Wallet} variant={todaySummary.netProfit >= 0 ? 'success' : 'destructive'} />
        </div>

        {/* Financial breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Split
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <IndianRupee className="text-emerald-600" size={18} />
                  <span className="text-sm font-bold text-slate-600">Cash Payment</span>
                </div>
                <span className="font-black text-slate-800">₹{paymentAnalysis.saleCash.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-blue-600" size={18} />
                  <span className="text-sm font-bold text-slate-600">Online/Bank</span>
                </div>
                <span className="font-black text-slate-800">₹{paymentAnalysis.saleOnline.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Collection Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-2 uppercase">
                <span>Recovery Rate</span>
                <span className="text-emerald-600">{Math.round((paymentAnalysis.totalReceived / (todaySummary.totalSales || 1)) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${(paymentAnalysis.totalReceived / (todaySummary.totalSales || 1)) * 100}%` }} />
              </div>
              <div className="pt-4 flex justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Pending</p>
                  <p className="text-lg font-black text-rose-600">₹{paymentAnalysis.totalPending.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Received</p>
                  <p className="text-lg font-black text-emerald-600">₹{paymentAnalysis.totalReceived.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <QuickActions
            onAddPurchase={() => setIsPurchaseModalOpen(true)}
            onAddSale={() => setIsSaleModalOpen(true)}
            onAddExpense={() => setIsExpenseModalOpen(true)}
          />
        </div>

        {/* Transaction Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-emerald-600" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Today's Ledger</h3>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-lg">
                  {[
                    { id: 'all', label: 'All', icon: Receipt },
                    { id: 'sale', label: 'Sales', icon: ArrowUpRight },
                    { id: 'purchase', label: 'Purchases', icon: ArrowDownLeft },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTransactionFilter(tab.id as any)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${transactionFilter === tab.id
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <TransactionList transactions={filteredTransactions} onTransactionClick={handleTransactionClick} />
            </div>
          </div>

          <div className="lg:col-span-1 border border-slate-100 rounded-xl">
            <ProfitChart summary={todaySummary} />
          </div>
        </div>
      </main>

      <AddPurchaseModal isOpen={isPurchaseModalOpen} onClose={() => { setIsPurchaseModalOpen(false); setPurchaseToEdit(null); }} onAdd={addPurchase} onUpdate={updatePurchase} purchaseToEdit={purchaseToEdit} />
      <AddSaleModal isOpen={isSaleModalOpen} onClose={() => { setIsSaleModalOpen(false); setSaleToEdit(null); }} onAdd={addSale} onUpdate={updateSale} saleToEdit={saleToEdit} sales={sales} />
      <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} onAdd={addExpense} />
      <PurchaseDetailModal isOpen={!!selectedPurchase} onClose={() => setSelectedPurchase(null)} purchase={selectedPurchase} onEdit={handleEditPurchase} />
    </Layout>
  );
};

export default Index;
