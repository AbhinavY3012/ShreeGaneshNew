import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    Plus,
    ChevronRight,
    History,
    ArrowUpRight,
    Phone,
    MapPin,
    Scale,
    CreditCard,
    Wallet,
    IndianRupee,
    Filter
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { useStore } from '@/hooks/useStore';
import { AddSaleModal } from '@/components/AddSaleModal';
import { SaleReceiptModal } from '@/components/SaleReceiptModal';
import { Sale } from '@/types';

export const Sales = () => {
    const { sales, addSale, updateSale, deleteSale, loading } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [selectedBuyer, setSelectedBuyer] = useState<{
        name: string;
        mobile: string;
        address: string;
        sales: Sale[];
    } | null>(null);


    // Group sales by businessman (Buyer)
    const businessmen = useMemo(() => {
        const buyersMap = new Map();

        sales.forEach(sale => {
            const buyerMobile = sale.buyer?.mobile || (sale as any).customerPhone || 'unknown';
            const buyerName = sale.buyer?.name || (sale as any).customerName || 'Walking Customer';

            if (!buyersMap.has(buyerMobile)) {
                buyersMap.set(buyerMobile, {
                    name: buyerName,
                    mobile: buyerMobile,
                    address: sale.buyer?.address || 'N/A',
                    totalSales: 0,
                    pendingAmount: 0,
                    lastVisit: sale.date,
                    visitCount: 0,
                    sales: []
                });
            }

            const buyer = buyersMap.get(buyerMobile);
            buyer.totalSales += sale.totalAmount;
            buyer.pendingAmount += (sale.pendingAmount || 0);
            buyer.visitCount += 1;
            buyer.sales.push(sale);

            if (new Date(sale.date) > new Date(buyer.lastVisit)) {
                buyer.lastVisit = sale.date;
            }
        });

        return Array.from(buyersMap.values());
    }, [sales]);

    const filteredBusinessmen = useMemo(() => {
        return businessmen.filter(b =>
            b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.mobile.includes(searchTerm)
        ).sort((a, b) => b.totalSales - a.totalSales);
    }, [businessmen, searchTerm]);

    if (loading) return null;

    return (
        <Layout>
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="section-title">Sales (Scale)</h2>
                        <p className="text-muted-foreground">Manage your buyer invoices and scale entries</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedSale(null);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 self-start"
                    >
                        <Plus className="w-5 h-5" />
                        New Scale Entry
                    </button>
                </div>

                {/* Businessmen Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Businessman by Name or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-premium pl-12 h-14 text-lg shadow-sm"
                    />
                </div>

                {/* Desktop View: Grid of Businessmen Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredBusinessmen.map((buyer, idx) => (
                            <motion.div
                                key={buyer.mobile}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card overflow-hidden group hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer"
                                onClick={() => {
                                    setSelectedBuyer({
                                        name: buyer.name,
                                        mobile: buyer.mobile,
                                        address: buyer.address,
                                        sales: buyer.sales
                                    });
                                    setIsReceiptOpen(true);
                                }}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{buyer.name}</h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {buyer.mobile}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Status</div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${buyer.pendingAmount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                                                }`}>
                                                {buyer.pendingAmount > 0 ? 'Pending' : 'Clear'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-muted/30 p-3 rounded-xl">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">Total Sales</span>
                                            <span className="text-base font-black text-foreground">₹{buyer.totalSales.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-destructive/5 p-3 rounded-xl">
                                            <span className="text-[10px] text-destructive uppercase font-bold tracking-widest block mb-1">Total Pending</span>
                                            <span className="text-base font-black text-destructive">₹{buyer.pendingAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><History className="w-3 h-3" /> {buyer.visitCount} visits</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {buyer.address}</span>
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-muted/20 border-t border-border/50 flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Last Visit: {new Date(buyer.lastVisit).toLocaleDateString()}</span>
                                    <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredBusinessmen.length === 0 && !loading && (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border mt-8">
                        <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground">No Businessmen Found</h3>
                        <p className="text-muted-foreground">Try searching with a different name or mobile number</p>
                    </div>
                )}
            </div>

            <AddSaleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addSale}
                onUpdate={updateSale}
                saleToEdit={selectedSale}
                sales={sales}
            />

            {selectedBuyer && (
                <SaleReceiptModal
                    isOpen={isReceiptOpen}
                    onClose={() => {
                        setIsReceiptOpen(false);
                        setSelectedBuyer(null);
                    }}
                    sales={selectedBuyer.sales}
                    buyerName={selectedBuyer.name}
                    buyerMobile={selectedBuyer.mobile}
                    buyerAddress={selectedBuyer.address}
                    onUpdate={(updatedSale) => {
                        const { id, ...saleData } = updatedSale;
                        updateSale(id, saleData);
                    }}
                    onDelete={(saleId) => {
                        deleteSale(saleId);
                        setIsReceiptOpen(false);
                        setSelectedBuyer(null);
                    }}
                />
            )}
        </Layout>
    );
};
