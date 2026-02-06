import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Calendar, Receipt, Download, Edit } from 'lucide-react';
import { Purchase } from '@/types';

interface PurchaseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Purchase | null;
    onEdit?: (purchase: Purchase) => void;
}

export const PurchaseDetailModal = ({ isOpen, onClose, purchase, onEdit }: PurchaseDetailModalProps) => {
    if (!purchase) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    >
                        <div className="glass-card p-4 sm:p-8 flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                                        <Receipt className="w-6 h-6 text-primary" />
                                        Purchase Invoice
                                    </h2>
                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-primary">
                                            {new Date(purchase.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(purchase)}
                                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary"
                                            title="Edit Purchase"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Download PDF">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Farmer Profile */}
                            <div className="bg-muted/30 p-5 rounded-2xl mb-8 border border-border/50">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Farmer Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Name</span>
                                        <span className="font-semibold text-lg text-foreground">{purchase.farmer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Contact</span>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <Phone className="w-3.5 h-3.5 opacity-50" />
                                            {purchase.farmer.mobile}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Address</span>
                                        <div className="flex items-center gap-2 text-foreground font-medium">
                                            <MapPin className="w-3.5 h-3.5 opacity-50" />
                                            {purchase.farmer.address}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-border rounded-xl overflow-hidden mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                            <tr>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Quality</th>
                                                <th className="p-4 text-center">Units</th>
                                                <th className="p-4 text-center">Wt/Unit</th>
                                                <th className="p-4 text-center">Total Kg</th>
                                                <th className="p-4 text-right">Rate/Kg</th>
                                                <th className="p-4 text-right">Amount</th>
                                                <th className="p-4 text-right">Advance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {purchase.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-muted/10 transition-colors">
                                                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                                                        {new Date(item.date || purchase.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className="p-4 font-semibold text-foreground">{item.quality}</td>
                                                    <td className="p-4 text-center">{item.unitCount}</td>
                                                    <td className="p-4 text-center text-muted-foreground">{item.weightPerUnit} kg</td>
                                                    <td className="p-4 text-center font-medium">{item.totalWeight.toLocaleString()} kg</td>
                                                    <td className="p-4 text-right tabular-nums">₹{item.pricePerKg}</td>
                                                    <td className="p-4 text-right font-bold tabular-nums text-foreground">₹{item.totalAmount.toLocaleString()}</td>
                                                    <td className="p-4 text-right tabular-nums text-success">₹{(item.advance || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-primary/5 font-semibold text-foreground">
                                            <tr>
                                                <td colSpan={4} className="p-4 text-right text-muted-foreground">Totals</td>
                                                <td className="p-4 text-center">
                                                    {purchase.items.reduce((sum, item) => sum + item.totalWeight, 0).toLocaleString()} kg
                                                </td>
                                                <td className="p-4"></td>
                                                <td className="p-4 text-right text-primary text-lg">₹{purchase.totalAmount.toLocaleString()}</td>
                                                <td className="p-4 text-right text-success text-lg">
                                                    ₹{purchase.items.reduce((sum, item) => sum + (item.advance || 0), 0).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Footer Information */}
                            <div className="space-y-4 pt-4 border-t border-border">
                                {/* Payment Summary */}
                                {(purchase.advanceAmount > 0 || purchase.pendingAmount > 0) && (
                                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-warning/5 border border-warning/20">
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Advance Paid</span>
                                            <span className="text-lg font-bold text-success">₹{(purchase.advanceAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-muted-foreground block mb-1">Pending Amount</span>
                                            <span className="text-lg font-bold text-warning">₹{(purchase.pendingAmount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Payment Status</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${purchase.paymentMethod === 'cash' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                            {purchase.paymentMethod}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-muted-foreground block text-xs mb-1">Transaction ID</span>
                                        <span className="font-mono text-xs opacity-70">#{purchase.id}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
