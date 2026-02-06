import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sale, SaleItem, SaleAddition, SaleTransaction, ReceivedPayment } from '@/types';
import { Plus, Calendar, IndianRupee, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale;
    onUpdate: (updatedSale: Sale) => void;
}

export const EditSaleModal = ({
    isOpen,
    onClose,
    sale,
    onUpdate
}: EditSaleModalProps) => {
    const [transactions, setTransactions] = useState<SaleTransaction[]>(
        sale.transactions || (sale.items ? [{
            id: sale.id + '_trans_1',
            date: sale.date,
            items: sale.items,
            additions: sale.additions || [],
            totalItemAmount: sale.totalItemAmount || 0,
            totalAdditions: sale.totalAdditions || 0,
            totalAmount: sale.totalAmount
        }] : [])
    );

    const [receivedPayments, setReceivedPayments] = useState<ReceivedPayment[]>(
        sale.receivedPayments || (sale.receivedAmount > 0 ? [{
            id: sale.id + '_rcv_1',
            date: sale.date,
            amount: sale.receivedAmount,
            paymentMethod: sale.paymentMethod,
            note: 'Initial payment'
        }] : [])
    );

    // New transaction form
    const [newTransactionDate, setNewTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [newItems, setNewItems] = useState<SaleItem[]>([{
        id: Date.now().toString(),
        quality: '',
        unitCount: 0,
        weightPerUnit: 0,
        totalWeight: 0,
        pricePerKg: 0,
        totalAmount: 0
    }]);
    const [newAdditions, setNewAdditions] = useState<SaleAddition[]>([]);

    // New received payment form
    const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [newPaymentAmount, setNewPaymentAmount] = useState(0);
    const [newPaymentMethod, setNewPaymentMethod] = useState<'cash' | 'online'>('cash');
    const [newPaymentNote, setNewPaymentNote] = useState('');

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

    const handleItemChange = (id: string, field: keyof SaleItem, value: any) => {
        setNewItems(newItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

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

    const handleAddAddition = () => {
        setNewAdditions([...newAdditions, {
            id: Date.now().toString(),
            type: 'labour',
            label: '',
            quantity: 0,
            rate: 0,
            totalAmount: 0
        }]);
    };

    const handleRemoveAddition = (id: string) => {
        setNewAdditions(newAdditions.filter(add => add.id !== id));
    };

    const handleAdditionChange = (id: string, field: keyof SaleAddition, value: any) => {
        setNewAdditions(newAdditions.map(add => {
            if (add.id === id) {
                const updated = { ...add, [field]: value };

                if (field === 'quantity' || field === 'rate') {
                    updated.totalAmount = updated.quantity * updated.rate;
                }

                return updated;
            }
            return add;
        }));
    };

    const handleAddTransaction = () => {
        const totalItemAmount = newItems.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalAdditions = newAdditions.reduce((sum, add) => sum + add.totalAmount, 0);
        const totalAmount = totalItemAmount + totalAdditions;

        if (totalAmount === 0) {
            alert('Please add items with valid amounts');
            return;
        }

        const newTransaction: SaleTransaction = {
            id: Date.now().toString(),
            date: newTransactionDate,
            items: newItems,
            additions: newAdditions,
            totalItemAmount,
            totalAdditions,
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
        setNewAdditions([]);
        setNewTransactionDate(new Date().toISOString().split('T')[0]);
    };

    const handleAddReceivedPayment = () => {
        if (newPaymentAmount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        const newPayment: ReceivedPayment = {
            id: Date.now().toString(),
            date: newPaymentDate,
            amount: newPaymentAmount,
            paymentMethod: newPaymentMethod,
            note: newPaymentNote
        };

        setReceivedPayments([...receivedPayments, newPayment]);

        // Reset form
        setNewPaymentAmount(0);
        setNewPaymentNote('');
        setNewPaymentDate(new Date().toISOString().split('T')[0]);
    };

    const handleRemoveTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleRemoveReceivedPayment = (id: string) => {
        setReceivedPayments(receivedPayments.filter(p => p.id !== id));
    };

    const handleSave = () => {
        const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalReceived = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = totalAmount - totalReceived;

        const updatedSale: Sale = {
            ...sale,
            transactions,
            receivedPayments,
            totalAmount,
            receivedAmount: totalReceived,
            pendingAmount,
            // Keep legacy fields for backward compatibility
            items: transactions.length > 0 ? transactions[0].items : [],
            additions: transactions.length > 0 ? transactions[0].additions : [],
            totalItemAmount: transactions.length > 0 ? transactions[0].totalItemAmount : 0,
            totalAdditions: transactions.length > 0 ? transactions[0].totalAdditions : 0
        };

        onUpdate(updatedSale);
        onClose();
    };

    const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalReceived = receivedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalAmount - totalReceived;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Edit Sale - {sale.buyer.name}</span>
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
                                <Plus className="w-5 h-5 text-success" />
                                Add New Sale Transaction
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

                                <h4 className="text-sm font-bold mt-4">Items</h4>
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
                                            placeholder="Quality (e.g., Super)"
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
                                            <div className="bg-success/10 p-2 rounded-lg flex items-center justify-center">
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

                                <h4 className="text-sm font-bold mt-4">Additional Charges (Optional)</h4>
                                {newAdditions.map((add, idx) => (
                                    <div key={add.id} className="bg-warning/10 p-3 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold">Charge {idx + 1}</span>
                                            <button
                                                onClick={() => handleRemoveAddition(add.id)}
                                                className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <select
                                            value={add.type}
                                            onChange={(e) => handleAdditionChange(add.id, 'type', e.target.value)}
                                            className="input-premium text-sm"
                                        >
                                            <option value="labour">Labour</option>
                                            <option value="paper">Paper</option>
                                            <option value="rassi">Rassi (Rope)</option>
                                            <option value="tape">Tape</option>
                                            <option value="crate">Crate</option>
                                            <option value="commission">Commission</option>
                                            <option value="other">Other</option>
                                        </select>

                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                value={add.quantity || ''}
                                                onChange={(e) => handleAdditionChange(add.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                className="input-premium text-sm"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Rate"
                                                value={add.rate || ''}
                                                onChange={(e) => handleAdditionChange(add.id, 'rate', parseFloat(e.target.value) || 0)}
                                                className="input-premium text-sm"
                                            />
                                        </div>

                                        <div className="bg-warning/20 p-2 rounded-lg">
                                            <span className="text-sm font-bold">₹{add.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddAddition}
                                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Charge
                                </button>

                                <button
                                    onClick={handleAddTransaction}
                                    className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Transaction
                                </button>
                            </div>
                        </div>

                        {/* Add Received Payment */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-success" />
                                Add Received Payment
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newPaymentDate}
                                        onChange={(e) => setNewPaymentDate(e.target.value)}
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
                                        value={newPaymentAmount || ''}
                                        onChange={(e) => setNewPaymentAmount(parseFloat(e.target.value) || 0)}
                                        className="input-premium"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                                        Payment Method
                                    </label>
                                    <select
                                        value={newPaymentMethod}
                                        onChange={(e) => setNewPaymentMethod(e.target.value as 'cash' | 'online')}
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
                                        value={newPaymentNote}
                                        onChange={(e) => setNewPaymentNote(e.target.value)}
                                        className="input-premium"
                                    />
                                </div>

                                <button
                                    onClick={handleAddReceivedPayment}
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
                                    <span className="text-success">Total Received:</span>
                                    <span className="font-bold text-success text-lg">₹{totalReceived.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="font-bold">Pending Amount:</span>
                                    <span className="font-black text-xl text-destructive">₹{pendingAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sale History */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4">Sale History</h3>
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
                                                    <Calendar className="w-4 h-4 text-success" />
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
                                                {transaction.additions.map((add) => (
                                                    <div key={add.id} className="flex justify-between text-warning">
                                                        <span>{add.label || add.type}: {add.quantity} × ₹{add.rate}</span>
                                                        <span className="font-bold">₹{add.totalAmount.toLocaleString()}</span>
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

                        {/* Received Payment History */}
                        <div className="glass-card p-4">
                            <h3 className="font-bold text-lg mb-4">Received Payment History</h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                <AnimatePresence>
                                    {receivedPayments.map((payment) => (
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
                                                    onClick={() => handleRemoveReceivedPayment(payment.id)}
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
