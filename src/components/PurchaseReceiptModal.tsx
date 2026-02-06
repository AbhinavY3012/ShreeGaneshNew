import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Purchase, PurchaseTransaction, AdvancePayment } from '@/types';
import { Phone, MapPin, Calendar, IndianRupee, Scale, Leaf, Printer, Download, Edit, CreditCard, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generatePurchaseReceiptPDF } from '@/utils/pdfGenerator';
import { EditPurchaseModal } from './EditPurchaseModal';


interface PurchaseReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchases: Purchase[];
    farmerName: string;
    farmerMobile: string;
    farmerAddress: string;
    onUpdate?: (updatedPurchase: Purchase) => void;
    onDelete?: (purchaseId: string) => void;
}

export const PurchaseReceiptModal = ({
    isOpen,
    onClose,
    purchases,
    farmerName,
    farmerMobile,
    farmerAddress,
    onUpdate,
    onDelete
}: PurchaseReceiptModalProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPurchaseForEdit, setSelectedPurchaseForEdit] = useState<Purchase | null>(null);

    // Aggregate all transactions and payments from all purchases
    const allTransactions: (PurchaseTransaction & { purchaseId: string })[] = [];
    const allAdvancePayments: (AdvancePayment & { purchaseId: string })[] = [];

    purchases.forEach(purchase => {
        // Handle new structure
        if (purchase.transactions) {
            purchase.transactions.forEach(trans => {
                allTransactions.push({ ...trans, purchaseId: purchase.id });
            });
        } else if (purchase.items) {
            // Legacy support
            allTransactions.push({
                id: purchase.id + '_trans',
                date: purchase.date,
                items: purchase.items,
                totalAmount: purchase.totalAmount,
                purchaseId: purchase.id
            });
        }

        // Handle advance payments
        if (purchase.advancePayments) {
            purchase.advancePayments.forEach(adv => {
                allAdvancePayments.push({ ...adv, purchaseId: purchase.id });
            });
        } else if (purchase.advanceAmount > 0) {
            // Legacy support
            allAdvancePayments.push({
                id: purchase.id + '_adv',
                date: purchase.date,
                amount: purchase.advanceAmount,
                paymentMethod: purchase.paymentMethod,
                purchaseId: purchase.id
            });
        }
    });

    // Sort by date
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    allAdvancePayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalPurchaseAmount = allTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalAdvance = allAdvancePayments.reduce((sum, a) => sum + a.amount, 0);
    const totalPending = totalPurchaseAmount - totalAdvance;
    const totalWeight = allTransactions.reduce((sum, t) =>
        sum + t.items.reduce((itemSum, item) => itemSum + item.totalWeight, 0), 0
    );

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        generatePurchaseReceiptPDF(farmerName, farmerMobile, farmerAddress, purchases);
    };

    const handleEdit = () => {
        // For simplicity, edit the first purchase (or you can make it more sophisticated)
        if (purchases.length > 0) {
            setSelectedPurchaseForEdit(purchases[0]);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdatePurchase = (updatedPurchase: Purchase) => {
        if (onUpdate) {
            onUpdate(updatedPurchase);
        }
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        if (purchases.length > 0 && onDelete) {
            const confirmDelete = window.confirm(`Are you sure you want to delete this purchase receipt for ${farmerName}? This action cannot be undone.`);
            if (confirmDelete) {
                onDelete(purchases[0].id);
                onClose();
            }
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Leaf className="w-6 h-6 text-warning" />
                            Purchase Receipt
                        </span>
                        <div className="flex items-center gap-2 print:hidden">
                            <button
                                onClick={handleEdit}
                                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm flex items-center gap-2 transition-colors h-9"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm flex items-center gap-2 transition-colors h-9"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm flex items-center gap-2 transition-colors h-9"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                            <button
                                onClick={handlePrint}
                                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm flex items-center gap-2 transition-colors h-9"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </DialogTitle>
                </DialogHeader>


                <div className="space-y-6">
                    {/* Company Branding */}
                    <div className="flex items-center justify-between pb-6 border-b-2 border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm shrink-0">
                                <img src="/sp-logo.jpg" alt="SP Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-800 leading-tight">SHREE GANESH FRUIT SUPPLIERS, TASGAON</h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tal. Tasgaon, Dist. Sangli, Maharashtra</p>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-0.5">Mo. 9730793507, 8788845042</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Type</div>
                            <div className="text-lg font-black text-slate-800">PURCHASE RECEIPT</div>
                        </div>
                    </div>

                    {/* Farmer Section */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">{farmerName}</h2>
                                <div className="space-y-1 text-xs text-slate-500 font-bold">
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        {farmerMobile}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {farmerAddress}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Transactions</div>
                                <div className="text-3xl font-black text-warning">{allTransactions.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 p-4 rounded-xl">
                            <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Total Weight</div>
                            <div className="text-xl font-black text-foreground">{totalWeight.toFixed(2)} kg</div>
                        </div>
                        <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                            <div className="text-xs text-warning uppercase font-bold mb-2">Total Amount</div>
                            <div className="text-xl font-black text-foreground">₹{totalPurchaseAmount.toLocaleString()}</div>
                        </div>
                        <div className="bg-success/10 p-4 rounded-xl border border-success/20">
                            <div className="text-xs text-success uppercase font-bold mb-2">Advance Paid</div>
                            <div className="text-xl font-black text-foreground">₹{totalAdvance.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-white hover:border-slate-300">
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Balance Due</div>
                            <div className="text-xl font-black text-slate-900">₹{totalPending.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Purchase Transaction History */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Scale className="w-5 h-5 text-warning" />
                            Purchase History (Date-wise)
                        </h3>

                        {allTransactions.map((transaction, idx) => (
                            <motion.div
                                key={transaction.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-5 space-y-4"
                            >
                                {/* Transaction Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-warning" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">
                                                {new Date(transaction.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="text-left py-2 text-xs font-bold text-muted-foreground uppercase">Quality</th>
                                                <th className="text-center py-2 text-xs font-bold text-muted-foreground uppercase">Total Kg</th>
                                                <th className="text-center py-2 text-xs font-bold text-muted-foreground uppercase">Rate</th>
                                                <th className="text-right py-2 text-xs font-bold text-muted-foreground uppercase">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transaction.items.map((item) => (
                                                <tr key={item.id} className="border-b border-border/30">
                                                    <td className="py-3 font-medium text-foreground">{item.quality}</td>
                                                    <td className="py-3 text-center font-bold">{item.totalWeight} kg</td>
                                                    <td className="py-3 text-center">₹{item.pricePerKg}/kg</td>
                                                    <td className="py-3 text-right font-bold">₹{item.totalAmount.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Transaction Total */}
                                <div className="bg-muted/20 p-4 rounded-xl">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold">Transaction Total:</span>
                                        <span className="font-black text-foreground text-lg">₹{transaction.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Advance Payment History */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-success" />
                            Advance Payment History (Date-wise)
                        </h3>

                        {allAdvancePayments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allAdvancePayments.map((payment, idx) => (
                                    <motion.div
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass-card p-4 bg-success/5 border-success/20"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-success" />
                                                <span className="font-bold text-sm">
                                                    {new Date(payment.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-bold capitalize">
                                                {payment.paymentMethod}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-black text-success">₹{payment.amount.toLocaleString()}</div>
                                        {payment.note && (
                                            <div className="text-xs text-muted-foreground mt-2">{payment.note}</div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card p-6 text-center text-muted-foreground">
                                No advance payments recorded
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-warning/5 to-transparent p-6 rounded-2xl border border-warning/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Grand Total</div>
                                <div className="text-3xl font-black text-foreground">₹{totalPurchaseAmount.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Balance Due</div>
                                <div className="text-3xl font-black text-slate-900">₹{totalPending.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>

            {/* Edit Modal */}
            {selectedPurchaseForEdit && (
                <EditPurchaseModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    purchase={selectedPurchaseForEdit}
                    onUpdate={handleUpdatePurchase}
                />
            )}
        </Dialog>
    );
};
