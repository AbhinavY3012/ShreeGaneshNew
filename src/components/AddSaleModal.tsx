import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Plus, Trash2, User, Phone, MapPin, Calculator, IndianRupee, Calendar, History, Eye, EyeOff, PlusCircle, ArrowRight, Pencil, Save, RefreshCw, Wallet, ArrowDown } from 'lucide-react';
import { Sale, SaleItem, SaleAddition } from '@/types';

interface AddSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (sale: any) => Promise<any>;
    onUpdate?: (id: string, sale: any) => Promise<any>;
    saleToEdit?: Sale | null;
    sales?: Sale[];
}

const emptyItem: Omit<SaleItem, 'id' | 'totalWeight' | 'totalAmount'> & { itemCharge?: number } = {
    quality: '',
    unitCount: 0,
    weightPerUnit: 0,
    pricePerKg: 0,
    itemCharge: 0
};

const defaultAdditionsList = [
    { type: 'labour', label: 'Labour', defaultRate: 50 },
    { type: 'paper', label: 'Paper', defaultRate: 250 },
    { type: 'rassi', label: 'Rassi (Rope)', defaultRate: 50 },
    { type: 'tape', label: 'Tape', defaultRate: 30 },
    { type: 'crate', label: 'Crate', defaultRate: 50 },
    { type: 'commission', label: 'Commission', defaultRate: 20 },
];

export const AddSaleModal = ({ isOpen, onClose, onAdd, onUpdate, saleToEdit, sales = [] }: AddSaleModalProps) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [buyer, setBuyer] = useState({ name: '', mobile: '', address: '' });
    const [items, setItems] = useState<(Omit<SaleItem, 'id'> & { itemCharge?: number })[]>([]);
    const [newItem, setNewItem] = useState(emptyItem);
    const [additions, setAdditions] = useState<Omit<SaleAddition, 'id'>[]>(
        defaultAdditionsList.map(item => ({
            type: item.type as any,
            label: item.label,
            quantity: 0,
            rate: item.defaultRate,
            totalAmount: 0
        }))
    );
    const [receivedAmount, setReceivedAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isNewSaleFormVisible, setIsNewSaleFormVisible] = useState(true);

    // Hydrate form when saleToEdit changes
    useEffect(() => {
        if (isOpen && saleToEdit) {
            setIsNewSaleFormVisible(false); // Collapsed by default for clean view
            setDate(saleToEdit.date);
            setBuyer(saleToEdit.buyer || { name: (saleToEdit as any).customerName || '', mobile: '', address: '' });

            if (saleToEdit.items && saleToEdit.items.length > 0) {
                setItems(saleToEdit.items.map(i => ({ ...i, itemCharge: (i as any).itemCharge || 0 })));
            } else {
                setItems([]);
            }

            if (saleToEdit.additions && saleToEdit.additions.length > 0) {
                setAdditions(saleToEdit.additions);
            } else {
                setAdditions(defaultAdditionsList.map(item => ({
                    type: item.type as any,
                    label: item.label,
                    quantity: 0,
                    rate: item.defaultRate,
                    totalAmount: 0
                })));
            }

            setReceivedAmount(saleToEdit.receivedAmount || 0);
            setPaymentMethod(saleToEdit.paymentMethod);
        } else if (isOpen && !saleToEdit) {
            // Reset logic handled partly here but mainly in handleCreateNew
            setIsNewSaleFormVisible(true);
            setDate(new Date().toISOString().split('T')[0]);
            setBuyer({ name: '', mobile: '', address: '' });
            setItems([]);
            setNewItem(emptyItem);
            setReceivedAmount(0);
            setAdditions(defaultAdditionsList.map(item => ({
                type: item.type as any,
                label: item.label,
                quantity: 0,
                rate: item.defaultRate,
                totalAmount: 0
            })));
        }
    }, [isOpen, saleToEdit]);

    // Buyer History Calculation
    const buyerHistory = useMemo(() => {
        if (!buyer.mobile || buyer.mobile.length < 10) return [];
        return sales.filter(s =>
            s.buyer?.mobile === buyer.mobile &&
            s.id !== saleToEdit?.id // Exclude current transaction if editing
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [buyer.mobile, sales, saleToEdit]);

    const previewData = useMemo(() => {
        if (saleToEdit) {
            const totalAdditionsVal = additions.reduce((sum, item) => sum + item.totalAmount, 0);
            const totalItemVal = items.reduce((sum, item) => sum + item.totalAmount, 0);
            const gTotal = totalItemVal + totalAdditionsVal;
            return {
                date,
                items,
                additions,
                totalAdditions: totalAdditionsVal,
                totalAmount: gTotal,
                receivedAmount: receivedAmount,
                pendingAmount: gTotal - receivedAmount,
                role: 'current'
            };
        } else if (buyerHistory.length > 0) {
            const last = buyerHistory[0];
            return {
                date: last.date,
                items: last.items,
                additions: last.additions,
                totalAdditions: last.totalAdditions,
                totalAmount: last.totalAmount,
                receivedAmount: last.receivedAmount || 0,
                pendingAmount: last.pendingAmount || 0,
                role: 'history'
            };
        }
        return null;
    }, [saleToEdit, buyerHistory, items, additions, date, receivedAmount]);


    const previousPending = useMemo(() =>
        buyerHistory.reduce((sum, s) => sum + (s.pendingAmount || 0), 0)
        , [buyerHistory]);

    // Auto-fill buyer name/address & Collapse form if mobile matches existing (New Sale Only)
    useEffect(() => {
        if (!saleToEdit && buyer.mobile.length >= 10 && buyerHistory.length > 0) {
            const latest = buyerHistory[0];
            if (latest.buyer) {
                setBuyer(prev => ({
                    ...prev,
                    name: latest.buyer.name || prev.name,
                    address: latest.buyer.address || prev.address
                }));
                // Hide form initially
                setIsNewSaleFormVisible(false);
                // Show history
                setShowHistory(true);
            }
        }
    }, [buyer.mobile, buyerHistory, saleToEdit]);

    // Item Calcs
    const currentItemTotalWeight = newItem.unitCount * newItem.weightPerUnit;
    const currentItemCharge = (newItem as any).itemCharge || 0;
    const currentItemTotalAmount = (currentItemTotalWeight * newItem.pricePerKg) + currentItemCharge;

    const addItem = () => {
        if (!newItem.quality || newItem.unitCount <= 0 || newItem.weightPerUnit <= 0 || newItem.pricePerKg <= 0) return;

        setItems(prev => [
            ...prev,
            {
                ...newItem,
                itemCharge: currentItemCharge,
                totalWeight: currentItemTotalWeight,
                totalAmount: currentItemTotalAmount,
            }
        ]);
        setNewItem(emptyItem);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateAddition = (index: number, field: 'quantity' | 'rate', value: number) => {
        setAdditions(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const updates = { ...item, [field]: value };
            return {
                ...updates,
                totalAmount: updates.quantity * updates.rate
            };
        }));
    };

    const handleToggleForm = () => {
        // If opening form for a NEW sale (and not editing existing), RESET EVERYTHING
        if (!isNewSaleFormVisible && !saleToEdit) {
            setItems([]);
            setAdditions(defaultAdditionsList.map(item => ({
                type: item.type as any,
                label: item.label,
                quantity: 0,
                rate: item.defaultRate,
                totalAmount: 0
            })));
            setReceivedAmount(0);
        }
        setIsNewSaleFormVisible(true);
    };

    // Totals
    const totalItemAmount = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);
    const totalAdditions = useMemo(() => additions.reduce((sum, item) => sum + item.totalAmount, 0), [additions]);
    const grandTotal = totalItemAmount + totalAdditions;
    const currentPending = grandTotal - receivedAmount;

    const totalNetOutstanding = previousPending + currentPending;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((items.length === 0 && isNewSaleFormVisible) || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const saleData = {
                date,
                buyer,
                items: items.map(item => ({
                    ...item,
                    id: (item as any).id || Math.random().toString(36).substr(2, 9),
                })),
                additions: additions.map((item) => ({
                    ...item,
                    id: (item as any).id || Math.random().toString(36).substr(2, 9),
                })),
                totalItemAmount,
                totalAdditions,
                totalAmount: grandTotal,
                receivedAmount,
                pendingAmount: currentPending,
                paymentMethod,
            };

            if (saleToEdit && onUpdate) {
                await onUpdate(saleToEdit.id, saleData);
            } else {
                await onAdd(saleData);
            }

            onClose();
        } catch (error) {
            console.error('Error saving sale:', error);
            alert('Failed to save sale. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="glass-card p-4 sm:p-6 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-success/10 text-success">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-display font-bold text-foreground">
                                        {saleToEdit ? 'Edit Sale' : 'New Sale'}
                                    </h2>
                                </div>

                                {/* Top Right: Toggle Form Button (Always visible if hidden) */}
                                {!isNewSaleFormVisible && (
                                    <motion.button
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        type="button"
                                        onClick={handleToggleForm}
                                        className="ml-auto mr-4 flex items-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                                    >
                                        {saleToEdit ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-5 h-5" />}
                                        {saleToEdit ? 'Edit Items & Charges' : 'Create New Invoice'}
                                    </motion.button>
                                )}

                                <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Buyer Details */}
                                <div className="bg-muted/30 p-4 rounded-xl space-y-4">
                                    <h3 className="font-semibold flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-2"><User className="w-4 h-4" /> Buyer / Businessman Profile</span>
                                        {buyerHistory.length > 0 && (
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                                {buyerHistory.length} Past Visits
                                            </span>
                                        )}
                                    </h3>

                                    {/* Header Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Mobile (Search Key) */}
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mobile Number (Check History)</label>
                                            <div className="relative">
                                                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                                                <input
                                                    required
                                                    type="tel"
                                                    value={buyer.mobile}
                                                    onChange={e => setBuyer(prev => ({ ...prev, mobile: e.target.value }))}
                                                    className="input-premium py-2 pl-9"
                                                    placeholder="Enter to Search..."
                                                />
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Sale Date
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                className="input-premium py-2 w-full"
                                                disabled={!isNewSaleFormVisible}
                                            />
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={buyer.name}
                                                onChange={e => setBuyer(prev => ({ ...prev, name: e.target.value }))}
                                                className="input-premium py-2"
                                                placeholder="Buyer Name"
                                                readOnly={!isNewSaleFormVisible}
                                            />
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
                                            <div className="relative">
                                                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={buyer.address}
                                                    onChange={e => setBuyer(prev => ({ ...prev, address: e.target.value }))}
                                                    className="input-premium py-2 pl-9"
                                                    placeholder="Location"
                                                    readOnly={!isNewSaleFormVisible}
                                                />
                                            </div>
                                        </div>
                                    </div>


                                    {/* PREVIEW SECTION */}
                                    {!isNewSaleFormVisible && previewData && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-border rounded-xl p-4 bg-muted/10"
                                        >
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                <History className="w-4 h-4" />
                                                {previewData.role === 'current' ? 'Current Invoice Preview' : `Last Sale (${new Date(previewData.date).toLocaleDateString()}) Reference`}
                                            </h4>

                                            {/* ITEMS PREVIEW LIST */}
                                            <div className="bg-card rounded-lg border border-border overflow-hidden mb-3">
                                                <table className="w-full text-xs text-left">
                                                    <thead className="bg-muted text-muted-foreground font-semibold">
                                                        <tr>
                                                            <th className="p-2">Quality</th>
                                                            <th className="p-2 text-right">Total Kg</th>
                                                            <th className="p-2 text-right">Rate</th>
                                                            <th className="p-2 text-right text-warning">Add. Charge</th>
                                                            <th className="p-2 text-right">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        {previewData.items && previewData.items.map((item, i) => {
                                                            const isSingleItem = previewData.items.length === 1;
                                                            const globalChargeShare = isSingleItem ? previewData.totalAdditions : 0;
                                                            const actualItemCharge = (item as any).itemCharge || 0;
                                                            const displayCharge = actualItemCharge + globalChargeShare;
                                                            const displayAmount = item.totalAmount + globalChargeShare;

                                                            return (
                                                                <tr key={i}>
                                                                    <td className="p-2">{item.quality}</td>
                                                                    <td className="p-2 text-right">{item.totalWeight} kg</td>
                                                                    <td className="p-2 text-right">₹{item.pricePerKg}</td>
                                                                    <td className="p-2 text-right text-warning font-medium">
                                                                        {displayCharge > 0 ? `₹${displayCharge.toLocaleString()}` : '-'}
                                                                    </td>
                                                                    <td className="p-2 text-right font-medium">₹{displayAmount.toLocaleString()}</td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {/* Total Row */}
                                                        <tr className="bg-muted/10 font-bold border-t border-border">
                                                            <td className="p-2">Total</td>
                                                            <td className="p-2 text-right">
                                                                {previewData.items?.reduce((sum, i) => sum + (i.totalWeight || 0), 0)} kg
                                                            </td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right text-warning">
                                                                ₹{(previewData.totalAdditions + (previewData.items?.reduce((sum, i) => sum + ((i as any).itemCharge || 0), 0) || 0)).toLocaleString()}
                                                            </td>
                                                            <td className="p-2 text-right text-lg">
                                                                ₹{(previewData.totalAmount).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PAYMENT PREVIEW (New: Advance & Pending) */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-card rounded-lg border border-border mt-2">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <Wallet className="w-3 h-3 text-success" /> Advance/Paid
                                                    </span>
                                                    <div className="text-sm font-bold text-success">₹{(previewData.receivedAmount || 0).toLocaleString()}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                                        <IndianRupee className="w-3 h-3 text-destructive" /> Current Pending
                                                    </span>
                                                    <div className="text-sm font-bold text-destructive">₹{(previewData.pendingAmount || 0).toLocaleString()}</div>
                                                </div>

                                                {/* Only show "Total Outstanding" if there's history */}
                                                {previewData.role === 'current' && previousPending > 0 && (
                                                    <div className="col-span-2 space-y-1 bg-destructive/5 p-1 px-2 rounded border border-destructive/10">
                                                        <span className="text-[10px] text-destructive uppercase font-black tracking-wider flex items-center gap-1">
                                                            <ArrowDown className="w-3 h-3" /> Total Outstanding Balance
                                                        </span>
                                                        <div className="text-base font-black text-destructive">₹{(previewData.pendingAmount + previousPending).toLocaleString()}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}


                                    {/* History Ledger Section */}
                                    {!isNewSaleFormVisible && buyerHistory.length > 0 && (
                                        <div className="border-t border-border pt-4 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowHistory(!showHistory)}
                                                className="flex items-center gap-2 text-sm font-medium text-primary w-full justify-between mb-2 group"
                                            >
                                                <span className="flex items-center gap-2 group-hover:underline">
                                                    {showHistory ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    {showHistory ? 'Hide' : 'Show'} Full History Ledger
                                                </span>
                                                <span className="text-destructive font-bold">Outstanding: ₹{previousPending.toLocaleString()}</span>
                                            </button>

                                            {showHistory && (
                                                <div className="mt-2 bg-card rounded-lg border border-border overflow-hidden shadow-sm">
                                                    <table className="w-full text-xs text-left text-muted-foreground">
                                                        <thead className="bg-muted text-foreground font-semibold">
                                                            <tr>
                                                                <th className="p-3">Date</th>
                                                                <th className="p-3 text-right">Items (Kg)</th>
                                                                <th className="p-3 text-right">Add. Charges</th>
                                                                <th className="p-3 text-right">Bill Total</th>
                                                                <th className="p-3 text-right">Pending</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/50">
                                                            {buyerHistory.map(sale => {
                                                                const itemAmt = sale.totalItemAmount || sale.totalAmount;
                                                                const chargeAmt = sale.totalAdditions || 0;
                                                                const totalKg = sale.items?.reduce((acc, item) => acc + (item.totalWeight || 0), 0) || 0;

                                                                return (
                                                                    <tr key={sale.id} className="hover:bg-muted/10 transition-colors">
                                                                        <td className="p-3 font-medium text-foreground">{new Date(sale.date).toLocaleDateString()}</td>
                                                                        <td className="p-3 text-right">{totalKg > 0 ? `${totalKg} kg` : '-'} (₹{itemAmt.toLocaleString()})</td>
                                                                        <td className="p-3 text-right text-warning font-semibold">₹{chargeAmt.toLocaleString()}</td>
                                                                        <td className="p-3 text-right font-bold text-foreground">₹{sale.totalAmount.toLocaleString()}</td>
                                                                        <td className="p-3 text-right text-destructive font-bold">₹{sale.pendingAmount.toLocaleString()}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* --- NEW SALE FORM (Collapsed by default) --- */}
                                <AnimatePresence>
                                    {isNewSaleFormVisible && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-6 overflow-hidden"
                                        >
                                            {/* Items Table */}
                                            <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
                                                <div className="p-4 border-b border-border font-semibold flex items-center justify-between">
                                                    <span>Items (Grapes)</span>
                                                    <span className="text-sm font-normal text-muted-foreground">Total: ₹{totalItemAmount.toLocaleString()}</span>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                                                            <tr>
                                                                <th className="p-3">Quality</th>
                                                                <th className="p-3">Unit</th>
                                                                <th className="p-3">Wt/Unit</th>
                                                                <th className="p-3">Total Kg</th>
                                                                <th className="p-3">Rate/Kg</th>
                                                                <th className="p-3 text-right text-warning">Add. Charge</th>
                                                                <th className="p-3 text-right">Amount</th>
                                                                <th className="p-3 w-10"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {items.map((item, index) => (
                                                                <tr key={index} className="bg-card/50">
                                                                    <td className="p-3 font-medium">{item.quality}</td>
                                                                    <td className="p-3">{item.unitCount}</td>
                                                                    <td className="p-3">{item.weightPerUnit} kg</td>
                                                                    <td className="p-3">{item.totalWeight} kg</td>
                                                                    <td className="p-3">₹{item.pricePerKg}</td>
                                                                    <td className="p-3 text-right text-warning">
                                                                        {(item as any).itemCharge ? `₹${(item as any).itemCharge}` : '-'}
                                                                    </td>
                                                                    <td className="p-3 text-right font-bold">₹{item.totalAmount.toLocaleString()}</td>
                                                                    <td className="p-3 text-center">
                                                                        <button type="button" onClick={() => removeItem(index)} className="text-destructive hover:opacity-80">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {/* New Item Row */}
                                                            <tr className="bg-primary/5">
                                                                <td className="p-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Quality"
                                                                        className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none p-1"
                                                                        value={newItem.quality}
                                                                        onChange={e => setNewItem(prev => ({ ...prev, quality: e.target.value }))}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none p-1"
                                                                        value={newItem.unitCount || ''}
                                                                        onChange={e => setNewItem(prev => ({ ...prev, unitCount: parseFloat(e.target.value) || 0 }))}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none p-1"
                                                                        value={newItem.weightPerUnit || ''}
                                                                        onChange={e => setNewItem(prev => ({ ...prev, weightPerUnit: parseFloat(e.target.value) || 0 }))}
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-muted-foreground">{currentItemTotalWeight > 0 ? `${currentItemTotalWeight} kg` : '-'}</td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none p-1"
                                                                        value={newItem.pricePerKg || ''}
                                                                        onChange={e => setNewItem(prev => ({ ...prev, pricePerKg: parseFloat(e.target.value) || 0 }))}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        className="w-full bg-transparent border-b border-border focus:border-primary focus:outline-none p-1 text-right text-warning font-medium placeholder:text-warning/30"
                                                                        value={(newItem as any).itemCharge || ''}
                                                                        onChange={e => setNewItem(prev => ({ ...prev, itemCharge: parseFloat(e.target.value) || 0 }))}
                                                                    />
                                                                </td>
                                                                <td className="p-3 text-right font-medium text-primary">
                                                                    {currentItemTotalAmount > 0 ? `₹${currentItemTotalAmount.toLocaleString()}` : '-'}
                                                                </td>
                                                                <td className="p-2 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={addItem}
                                                                        disabled={!newItem.quality || newItem.unitCount <= 0}
                                                                        className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Additional Charges Section */}
                                            <div className="bg-warning/5 rounded-xl border border-warning/10 overflow-hidden">
                                                <div className="p-4 border-b border-warning/10 font-semibold flex items-center justify-between text-warning-foreground">
                                                    <span className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Additional Charges (Global)</span>
                                                    <span>Total: ₹{totalAdditions.toLocaleString()}</span>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase mb-2 px-2">
                                                        <div className="col-span-4">Type</div>
                                                        <div className="col-span-3 text-center">Qty</div>
                                                        <div className="col-span-3 text-center">Rate</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                    </div>
                                                    {additions.map((item, index) => (
                                                        <div key={item.type} className="grid grid-cols-12 gap-2 items-center px-2 py-1 rounded hover:bg-white/50">
                                                            <div className="col-span-4 font-medium">{item.label}</div>
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    className="w-full bg-white border border-border rounded px-2 py-1 text-center"
                                                                    value={item.quantity || ''}
                                                                    onChange={e => updateAddition(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    className="w-full bg-white border border-border rounded px-2 py-1 text-center"
                                                                    value={item.rate || ''}
                                                                    onChange={e => updateAddition(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </div>
                                                            <div className="col-span-2 text-right font-medium">
                                                                {item.totalAmount > 0 ? `₹${item.totalAmount}` : '-'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer Totals */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                <div className="space-y-4">
                                                    <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('cash')}
                                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentMethod === 'cash' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                                                                }`}
                                                        >
                                                            Cash
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setPaymentMethod('online')}
                                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentMethod === 'online' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
                                                                }`}
                                                        >
                                                            Online
                                                        </button>
                                                    </div>
                                                </div>


                                                {/* Calculations */}
                                                <div className="space-y-4">
                                                    <div className="bg-card p-4 rounded-xl border border-border space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Items Total (Incl. Item Charges)</span>
                                                            <span className="font-medium">₹{totalItemAmount.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Additional Charges (Global)</span>
                                                            <span className="font-medium text-warning-foreground">+ ₹{totalAdditions.toLocaleString()}</span>
                                                        </div>
                                                        <div className="h-px bg-border my-2" />
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-bold">Current Bill Total</span>
                                                            <span className="text-xl font-bold font-display">₹{grandTotal.toLocaleString()}</span>
                                                        </div>

                                                        {previousPending > 0 && (
                                                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed border-border text-destructive">
                                                                <span className="text-sm font-medium">Previous Balance (Old)</span>
                                                                <span className="font-semibold">+ ₹{previousPending.toLocaleString()}</span>
                                                            </div>
                                                        )}

                                                        {previousPending > 0 && (
                                                            <div className="flex justify-between items-center bg-destructive/5 p-2 rounded">
                                                                <span className="font-bold text-destructive">Total Outstanding</span>
                                                                <span className="text-xl font-bold text-destructive">₹{(grandTotal + previousPending).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Payment Input */}
                                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                                                        <div>
                                                            <label className="text-sm font-medium block mb-1">Received Amount (For current bill)</label>
                                                            <div className="relative">
                                                                <IndianRupee className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                                                                <input
                                                                    type="number"
                                                                    value={receivedAmount || ''}
                                                                    onChange={e => setReceivedAmount(parseFloat(e.target.value) || 0)}
                                                                    className="input-premium pl-9 w-full"
                                                                    placeholder="Amount Received"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                                                            <span className="text-sm font-semibold">Net Balance Carry Forward</span>
                                                            <span className="text-lg font-bold text-destructive">₹{totalNetOutstanding.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={items.length === 0 || isSubmitting}
                                                    className="w-full btn-primary py-3 text-lg flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? <span className="animate-spin">...</span> : <Save className="w-5 h-5" />}
                                                    {isSubmitting ? (saleToEdit ? 'Updating...' : 'Saving...') : (saleToEdit ? 'Update Sale Invoice' : 'Create Sale Invoice')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
