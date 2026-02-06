import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sale } from '@/types';
import { Phone, MapPin, Calendar, IndianRupee, Scale, Users, Printer, Plus, Download, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateSaleReceiptPDF } from '@/utils/pdfGenerator';
import { EditSaleModal } from './EditSaleModal';


interface SaleReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    sales: Sale[];
    buyerName: string;
    buyerMobile: string;
    buyerAddress: string;
    onUpdate?: (updatedSale: Sale) => void;
    onDelete?: (saleId: string) => void;
}

export const SaleReceiptModal = ({
    isOpen,
    onClose,
    sales,
    buyerName,
    buyerMobile,
    buyerAddress,
    onUpdate,
    onDelete
}: SaleReceiptModalProps) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSaleForEdit, setSelectedSaleForEdit] = useState<Sale | null>(null);

    const totalSalesAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalReceived = sales.reduce((sum, s) => sum + s.receivedAmount, 0);
    const totalPending = sales.reduce((sum, s) => sum + s.pendingAmount, 0);
    const totalWeight = sales.reduce((sum, s) =>
        sum + (s.items?.reduce((itemSum, item) => itemSum + item.totalWeight, 0) || 0), 0
    );

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        generateSaleReceiptPDF(buyerName, buyerMobile, buyerAddress, sales);
    };

    const handleEdit = () => {
        if (sales.length > 0) {
            setSelectedSaleForEdit(sales[0]);
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateSale = (updatedSale: Sale) => {
        if (onUpdate) {
            onUpdate(updatedSale);
        }
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        if (sales.length > 0 && onDelete) {
            const confirmDelete = window.confirm(`Are you sure you want to delete this sale receipt for ${buyerName}? This action cannot be undone.`);
            if (confirmDelete) {
                onDelete(sales[0].id);
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
                            <Scale className="w-6 h-6 text-primary" />
                            Sale Receipt
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
                            <div className="text-lg font-black text-slate-800">SALE INVOICE</div>
                        </div>
                    </div>

                    {/* Customer Section */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">{buyerName}</h2>
                                <div className="space-y-1 text-xs text-slate-500 font-bold">
                                    <p className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" />
                                        {buyerMobile}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {buyerAddress}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Invoices</div>
                                <div className="text-3xl font-black text-emerald-600">{sales.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 p-4 rounded-xl">
                            <div className="text-xs text-muted-foreground uppercase font-bold mb-2">Total Weight</div>
                            <div className="text-xl font-black text-foreground">{totalWeight.toFixed(2)} kg</div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                            <div className="text-xs text-primary uppercase font-bold mb-2">Total Amount</div>
                            <div className="text-xl font-black text-foreground">₹{totalSalesAmount.toLocaleString()}</div>
                        </div>
                        <div className="bg-success/10 p-4 rounded-xl border border-success/20">
                            <div className="text-xs text-success uppercase font-bold mb-2">Received</div>
                            <div className="text-xl font-black text-foreground">₹{totalReceived.toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:bg-white hover:border-slate-300">
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Balance Due</div>
                            <div className="text-xl font-black text-slate-900">₹{totalPending.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Sale Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" />
                            Invoice History
                        </h3>

                        {sales.map((sale, idx) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-5 space-y-4"
                            >
                                {/* Sale Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">
                                                {new Date(sale.date).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {sale.items.length} item{sale.items.length > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground uppercase font-bold">Payment</div>
                                        <div className="text-sm font-bold text-foreground capitalize">
                                            {sale.paymentMethod}
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
                                            {sale.items.map((item) => (
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

                                {/* Additional Charges */}
                                {sale.additions && sale.additions.length > 0 && (
                                    <div className="bg-muted/10 p-4 rounded-xl space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2">
                                            <Plus className="w-4 h-4" />
                                            Additional Charges
                                        </div>
                                        {sale.additions.map((addition) => (
                                            <div key={addition.id} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {addition.label} ({addition.quantity} × ₹{addition.rate})
                                                </span>
                                                <span className="font-bold text-foreground">₹{addition.totalAmount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Sale Summary */}
                                <div className="bg-muted/20 p-4 rounded-xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Items Total:</span>
                                        <span className="font-bold text-foreground">₹{sale.totalItemAmount.toLocaleString()}</span>
                                    </div>
                                    {sale.totalAdditions > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Additional Charges:</span>
                                            <span className="font-bold text-foreground">₹{sale.totalAdditions.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                                        <span className="font-bold text-foreground">Grand Total:</span>
                                        <span className="font-black text-foreground text-lg">₹{sale.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-success">Amount Received:</span>
                                        <span className="font-bold text-success">₹{sale.receivedAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-border/50">
                                        <span className="text-slate-900 font-bold">Balance Due:</span>
                                        <span className="font-black text-slate-900 text-lg">₹{sale.pendingAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-primary/5 to-transparent p-6 rounded-2xl border border-primary/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Grand Total</div>
                                <div className="text-3xl font-black text-foreground">₹{totalSalesAmount.toLocaleString()}</div>
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
            {selectedSaleForEdit && (
                <EditSaleModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    sale={selectedSaleForEdit}
                    onUpdate={handleUpdateSale}
                />
            )}
        </Dialog>
    );
};
