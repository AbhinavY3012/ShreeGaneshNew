import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Users, Fuel, MoreHorizontal } from 'lucide-react';
import { Expense } from '@/types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id'>) => Promise<Expense>;
}

export const AddExpenseModal = ({ isOpen, onClose, onAdd }: AddExpenseModalProps) => {
  const [formData, setFormData] = useState({
    type: 'labour' as 'labour' | 'petrol' | 'other',
    description: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'online',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        ...formData,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(formData.amount),
      });
      setFormData({
        type: 'labour',
        description: '',
        amount: '',
        paymentMethod: 'cash',
      });
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseTypes = [
    { value: 'labour', label: 'Labour', icon: Users, color: 'text-primary' },
    { value: 'petrol', label: 'Petrol', icon: Fuel, color: 'text-warning' },
    { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-muted-foreground' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-card p-4 sm:p-6 m-2 sm:m-4">
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-destructive/10 text-destructive flex-shrink-0">
                    <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-foreground truncate">Add Expense</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Expense Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expenseTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                          className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${formData.type === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <Icon className={`w-5 h-5 ${formData.type === type.value ? type.color : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${formData.type === type.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="input-premium"
                    placeholder="Enter description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="input-premium"
                    placeholder="3500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Payment Method
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${formData.paymentMethod === 'cash'
                        ? 'border-success bg-success/10 text-success'
                        : 'border-border text-muted-foreground hover:border-success/50'
                        }`}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'online' }))}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${formData.paymentMethod === 'online'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                    >
                      💳 Online
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? 'Saving...' : 'Add Expense'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
