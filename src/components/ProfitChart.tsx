import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DailySummary } from '@/types';

interface ProfitChartProps {
  summary: DailySummary;
}

export const ProfitChart = ({ summary }: ProfitChartProps) => {
  const isProfit = summary.netProfit >= 0;
  const profitPercentage = summary.totalSales > 0
    ? ((summary.netProfit / summary.totalSales) * 100).toFixed(1)
    : '0';

  const calculateBarWidth = (value: number, max: number) => {
    return max > 0 ? Math.min((value / max) * 100, 100) : 0;
  };

  const maxValue = Math.max(summary.totalPurchases, summary.totalSales, summary.totalExpenses);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-base sm:text-lg font-display font-bold text-foreground">Today's Breakdown</h3>
        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${isProfit ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
          {isProfit ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
          <span className="whitespace-nowrap">{profitPercentage}%</span>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Purchases Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground">Purchases</span>
            <span className="font-semibold text-warning">₹{summary.totalPurchases.toLocaleString()}</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateBarWidth(summary.totalPurchases, maxValue)}%` }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-warm)' }}
            />
          </div>
        </div>

        {/* Sales Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground">Sales</span>
            <span className="font-semibold text-success">₹{summary.totalSales.toLocaleString()}</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateBarWidth(summary.totalSales, maxValue)}%` }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="h-full rounded-full"
              style={{ background: 'var(--gradient-accent)' }}
            />
          </div>
        </div>

        {/* Expenses Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm gap-2">
            <span className="text-muted-foreground">Expenses</span>
            <span className="font-semibold text-destructive">₹{summary.totalExpenses.toLocaleString()}</span>
          </div>
          <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateBarWidth(summary.totalExpenses, maxValue)}%` }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="h-full bg-destructive rounded-full"
            />
          </div>
        </div>

        {/* Net Profit Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border-2 ${isProfit
              ? 'bg-success/5 border-success/20'
              : 'bg-destructive/5 border-destructive/20'
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isProfit ? 'text-success' : 'text-destructive'} truncate`}>
                {isProfit ? '+' : ''}₹{summary.netProfit.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isProfit ? 'bg-success/10' : 'bg-destructive/10'} flex-shrink-0`}>
              {isProfit ? (
                <TrendingUp className={`w-6 h-6 sm:w-8 sm:h-8 ${isProfit ? 'text-success' : 'text-destructive'}`} />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
              )}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 line-clamp-1">
            Gross: ₹{summary.grossProfit.toLocaleString()} − Expenses: ₹{summary.totalExpenses.toLocaleString()}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
