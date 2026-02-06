import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp, Receipt, Plus } from 'lucide-react';

interface QuickActionsProps {
  onAddPurchase: () => void;
  onAddSale: () => void;
  onAddExpense: () => void;
}

export const QuickActions = ({ onAddPurchase, onAddSale, onAddExpense }: QuickActionsProps) => {
  const actions = [
    {
      label: 'Add Purchase',
      icon: ShoppingCart,
      onClick: onAddPurchase,
      className: 'gradient-warm-bg text-primary-foreground',
    },
    {
      label: 'Add Sale',
      icon: TrendingUp,
      onClick: onAddSale,
      className: 'gradient-bg text-primary-foreground',
    },
    {
      label: 'Add Expense',
      icon: Receipt,
      onClick: onAddExpense,
      className: 'bg-secondary text-secondary-foreground border-2 border-border',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            onClick={action.onClick}
            className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-shadow hover:shadow-lg ${action.className}`}
          >
            <Plus className="w-4 h-4" />
            <Icon className="w-4 h-4" />
            <span className="whitespace-nowrap">{action.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
