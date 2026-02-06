import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Purchase, PurchaseItem, PurchaseTransaction, AdvancePayment } from '@/types';
import { Plus, Calendar, IndianRupee, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase;
    onUpdate: (updatedPurchase: Purchase) => void;
}

export const EditPurchaseModal = ({
    isOpen,
    onClose,
    purchase,
    onUpdate
}: EditPurchaseModalProps) => {
    const [transactions, setTransactions] = useState<PurchaseTransaction[]>(
        purchase.transactions || (purchase.items ? [{
            id: purchase.id + '_trans_1',
            date: purchase.date,
            items: purchase.items,
            totalAmount: purchase.totalAmount
        }] : [])
    );

    const [advancePayments, setAdvancePayments] = useState<AdvancePayment[]>(
        purchase.advancePayments || (purchase.advanceAmount > 0 ? [{
            id: purchase.id + '_adv_1',
            date: purchase.date,
            amount: purchase.advanceAmount,
            paymentMethod: purchase.paymentMethod,
            note: 'Initial advance'
        }] : [])
    );

    // New transaction form
    const [newTransactionDate, setNewTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [newItems, setNewItems] = useState<PurchaseItem[]>([{
        id: Date.now().toString(),
        quality: '',
        unitCount: 0,
        weightPerUnit: 0,
        totalWeight: 0,
        pricePerKg: 0,
        totalAmount: 0
    }]);

    // New advance payment form
    const [newAdvanceDate, setNewAdvanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [newAdvanceAmount, setNewAdvanceAmount] = useState(0);
    const [newAdvanceMethod, setNewAdvanceMethod] = useState<'cash' | 'online'>('cash');
    const [newAdvanceNote, setNewAdvanceNote] = useState('');

    const handleAddItem = () => {
        setNewItems([...newItems, {
            id: Date.now().toString(),
            quality: '',
            unitCount: 0,
            weightPerUnit: 0,
            totalWeight: 0,
            pricePerKg: 0,
            totalAmount: 0
        }]);
    };

    const handleRemoveItem = (id: string) => {
        setNewItems(newItems.filter(item => item.id !== id));
    };

    const handleItemChange = (id: string, field: keyof PurchaseItem, value: any) => {
        setNewItems(newItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // Auto-calculate
                if (field === 'unitCount' || field === 'weightPerUnit') {
                    updated.totalWeight = updated.unitCount * updated.weightPerUnit;
                    updated.totalAmount = updated.totalWeight * updated.pricePerKg;
                }
                if (field === 'pricePerKg') {
                    updated.totalAmount = updated.totalWeight * updated.pricePerKg;
                }

                return updated;
            }
            return item;
        }));
    };

    const handleAddTransaction = () => {
        const totalAmount = newItems.reduce((sum, item) => sum + item.totalAmount, 0);

        if (totalAmount === 0) {
            alert('Please add items with valid amounts');
            return;
        }

        const newTransaction: PurchaseTransaction = {
            id: Date.now().toString(),
            date: newTransactionDate,
            items: newItems,
            totalAmount
        };

        setTransactions([...transactions, newTransaction]);

        // Reset form
        setNewItems([{
            id: Date.now().toString(),
            quality: '',
            unitCount: 0,
            weightPerUnit: 0,
            totalWeight: 0,
            pricePerKg: 0,
            totalAmount: 0
        }]);
        setNewTransactionDate(new Date().toISOString().split('T')[0]);
    };

    const handleAddAdvancePayment = () => {
        if (newAdvanceAmount <= 0) {
            alert('Please enter a valid advance amount');
            return;
        }

        const newPayment: AdvancePayment = {
            id: Date.now().toString(),
            date: newAdvanceDate,
            amount: newAdvanceAmount,
            paymentMethod: newAdvanceMethod,
            note: newAdvanceNote
        };

        setAdvancePayments([...advancePayments, newPayment]);

        // Reset form
        setNewAdvanceAmount(0);
        setNewAdvanceNote('');
        setNewAdvanceDate(new Date().toISOString().split('T')[0]);
    };

    const handleRemoveTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleRemoveAdvancePayment = (id: string) => {
        setAdvancePayments(advancePayments.filter(a => a.id !== id));
    };

    const handleSave = () => {
        const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalAdvance = advancePayments.reduce((sum, a) => sum + a.amount, 0);
        const pendingAmount = totalAmount - totalAdvance;

        const updatedPurchase: Purchase = {
            ...purchase,
            transactions,
            advancePayments,
            totalAmount,
            advanceAmount: totalAdvance,
            pendingAmount,
            // Keep legacy items for backward compatibility
            items: transactions.length > 0 ? transactions[0].items : []
        };

        onUpdate(updatedPurchase);
        onClose();
    };

    const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalAdvance = advancePayments.reduce((sum, a) => sum + a.amount, 0);
    const pendingAmount = totalAmount - totalAdvance;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Edit Purchase - {purchase.farmer.name}</span>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                            <button onClick={onClose} className="btn-secondary">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT SIDE - Add New Transaction */}
                    <div className="space-y-4">
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-warning" />
                                Add New Purchase Transaction
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Transaction Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newTransactionDate}
                                        onChange={(e) => setNewTransactionDate(e.target.value)}
                                        className="input-premium"
                                    />
                                </div>

                                {newItems.map((item, idx) => (
                                    <div key={item.id} className="bg-muted/20 p-3 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold">Item {idx + 1}</span>
                                            {newItems.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <input
                                            type="text"
                                            placeholder="Quality (e.g., A Grade)"
                                            value={item.quality}
                                            onChange={(e) => handleItemChange(item.id, 'quality', e.target.value)}
                                            className="input-premium text-sm"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Units"
                                                value={item.unitCount || ''}
                                                onChange={(e) => handleItemChange(item.id, 'unitCount', parseFloat(e.target.value) || 0)}
                                                className="input-premium text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Kg/Unit"
                                                value={item.weightPerUnit || ''}
                                                onChange={(e) => handleItemChange(item.id, 'weightPerUnit', parseFloat(e.target.value) || 0)}
                                                className="input-premium text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Rate/Kg"
                                                value={item.pricePerKg || ''}
                                                onChange={(e) => handleItemChange(item.id, 'pricePerKg', parseFloat(e.target.value) || 0)}
                                                className="input-premium text-sm"
                                            />
                                            <div className="bg-warning/10 p-2 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-bold">₹{item.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddItem}
                                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Item
                                </button>

                                <button
                                    onClick={handleAddTransaction}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Transaction
                                </button>
                            </div>
                        </div>

                        {/* Add Advance Payment */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-success" />
                                Add Advance Payment
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newAdvanceDate}
                                        onChange={(e) => setNewAdvanceDate(e.target.value)}
                                        className="input-premium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={newAdvanceAmount || ''}
                                        onChange={(e) => setNewAdvanceAmount(parseFloat(e.target.value) || 0)}
                                        className="input-premium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Payment Method
                                    </label>
                                    <select
                                        value={newAdvanceMethod}
                                        onChange={(e) => setNewAdvanceMethod(e.target.value as 'cash' | 'online')}
                                        className="input-premium"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Note (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Payment note"
                                        value={newAdvanceNote}
                                        onChange={(e) => setNewAdvanceNote(e.target.value)}
                                        className="input-premium"
                                    />
                                </div>

                                <button
                                    onClick={handleAddAdvancePayment}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Add Payment
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - History & Summary */}
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4">Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Amount:</span>
                                    <span className="font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-success">Total Advance:</span>
                                    <span className="font-bold text-success text-lg">₹{totalAdvance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-bold">Pending Amount:</span>
                                    <span className="font-black text-xl text-destructive">₹{pendingAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Purchase History */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4">Purchase History</h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                <AnimatePresence>
                                    {transactions.map((transaction) => (
                                        <motion.div
                                            key={transaction.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-muted/20 p-3 rounded-xl"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-warning" />
                                                    <span className="font-bold text-sm">
                                                        {new Date(transaction.date).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveTransaction(transaction.id)}
                                                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-1 text-xs">
                                                {transaction.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between">
                                                        <span>{item.quality}: {item.totalWeight}kg @ ₹{item.pricePerKg}/kg</span>
                                                        <span className="font-bold">₹{item.totalAmount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-border/50 flex justify-between">
                                                <span className="text-xs font-bold">Total:</span>
                                                <span className="font-bold">₹{transaction.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Advance Payment History */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4">Advance Payment History</h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                <AnimatePresence>
                                    {advancePayments.map((payment) => (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-success/10 p-3 rounded-xl border border-success/20"
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-success" />
                                                    <span className="font-bold text-sm">
                                                        {new Date(payment.date).toLocaleDateString('en-IN')}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveAdvancePayment(payment.id)}
                                                    className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-success text-lg">₹{payment.amount.toLocaleString()}</span>
                                                    <span className="text-xs ml-2 text-muted-foreground capitalize">({payment.paymentMethod})</span>
                                                </div>
                                            </div>
                                            {payment.note && (
                                                <div className="text-xs text-muted-foreground mt-1">{payment.note}</div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
