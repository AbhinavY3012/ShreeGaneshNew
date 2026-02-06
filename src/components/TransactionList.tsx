import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Wallet,
  CreditCard
} from 'lucide-react';
import { Transaction } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, onTransactionClick }: TransactionListProps) => {
  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase': return <ArrowDownLeft size={18} />;
      case 'sale': return <ArrowUpRight size={18} />;
      case 'expense': return <Receipt size={18} />;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Receipt className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          onClick={() => onTransactionClick?.(transaction)}
          className="p-4 rounded-xl bg-white border border-slate-100 hover:border-emerald-200 hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`p-2.5 rounded-lg ${transaction.type === 'purchase' ? 'bg-amber-50 text-amber-600' :
                  transaction.type === 'sale' ? 'bg-emerald-50 text-emerald-600' :
                    'bg-rose-50 text-rose-600'
                }`}>
                {getTypeIcon(transaction.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate text-sm">{transaction.description}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">{transaction.details}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className={`text-lg font-black tracking-tight ${transaction.type === 'sale' ? 'text-emerald-600' :
                  transaction.type === 'purchase' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                {transaction.type === 'sale' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{transaction.type}</span>
                <span className="text-[10px] font-bold text-slate-300">•</span>
                <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                  {transaction.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
