import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag,
    Search,
    Plus,
    Leaf,
    History,
    ArrowDownLeft,
    Phone,
    MapPin,
    Scale,
    CreditCard,
    Wallet,
    IndianRupee,
    Users
} from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Header } from '@/components/Header';
import { useStore } from '@/hooks/useStore';
import { AddPurchaseModal } from '@/components/AddPurchaseModal';
import { PurchaseReceiptModal } from '@/components/PurchaseReceiptModal';
import { Purchase } from '@/types';

export const Purchases = () => {
    const { purchases, addPurchase, updatePurchase, deletePurchase, loading } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<{
        name: string;
        mobile: string;
        address: string;
        purchases: Purchase[];
    } | null>(null);


    // Group purchases by farmer
    const farmers = useMemo(() => {
        const farmersMap = new Map();

        purchases.forEach(purchase => {
            const farmerMobile = purchase.farmer?.mobile || 'unknown';
            const farmerName = purchase.farmer?.name || 'Unknown Farmer';

            if (!farmersMap.has(farmerMobile)) {
                farmersMap.set(farmerMobile, {
                    name: farmerName,
                    mobile: farmerMobile,
                    address: purchase.farmer?.address || 'N/A',
                    totalPurchases: 0,
                    pendingAmount: 0,
                    lastVisit: purchase.date,
                    visitCount: 0,
                    purchases: []
                });
            }

            const farmer = farmersMap.get(farmerMobile);
            farmer.totalPurchases += purchase.totalAmount;
            farmer.pendingAmount += (purchase.pendingAmount || 0); // Assuming purchases also have pending amount logic
            farmer.visitCount += 1;
            farmer.purchases.push(purchase);

            if (new Date(purchase.date) > new Date(farmer.lastVisit)) {
                farmer.lastVisit = purchase.date;
            }
        });

        return Array.from(farmersMap.values());
    }, [purchases]);

    const filteredFarmers = useMemo(() => {
        return farmers.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.mobile.includes(searchTerm)
        ).sort((a, b) => b.totalPurchases - a.totalPurchases);
    }, [farmers, searchTerm]);

    if (loading) return null;

    return (
        <Layout>
            <Header />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="section-title">Purchases (Farmers)</h2>
                        <p className="text-muted-foreground">Manage your grape purchases and farmer records</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedPurchase(null);
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2 self-start gradient-warm-bg"
                    >
                        <Plus className="w-5 h-5" />
                        New Purchase
                    </button>
                </div>

                {/* Farmer Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Farmer by Name or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-premium pl-12 h-14 text-lg shadow-sm"
                    />
                </div>

                {/* Farmers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredFarmers.map((farmer, idx) => (
                            <motion.div
                                key={farmer.mobile}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card overflow-hidden group hover:border-warning/30 transition-all active:scale-[0.98] cursor-pointer"
                                onClick={() => {
                                    setSelectedFarmer({
                                        name: farmer.name,
                                        mobile: farmer.mobile,
                                        address: farmer.address,
                                        purchases: farmer.purchases
                                    });
                                    setIsReceiptOpen(true);
                                }}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                                                <Leaf className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground group-hover:text-warning transition-colors">{farmer.name}</h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {farmer.mobile}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                                        <div className="bg-warning/5 p-3 rounded-xl border border-warning/10">
                                            <span className="text-[10px] text-warning uppercase font-bold tracking-widest block mb-1">Stock Bought</span>
                                            <span className="text-base font-black text-foreground">₹{farmer.totalPurchases.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mb-1">Total Lots</span>
                                            <span className="text-base font-black text-foreground">{farmer.visitCount} Entries</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                                            <span className="text-[10px] text-destructive uppercase font-bold tracking-widest block mb-1">Balance Due</span>
                                            <span className="text-base font-black text-destructive">₹{farmer.pendingAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3" /> {farmer.address}</span>
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-muted/20 border-t border-border/50 flex items-center justify-between group-hover:bg-warning/5 transition-colors">
                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Last Purchase: {new Date(farmer.lastVisit).toLocaleDateString()}</span>
                                    <ArrowDownLeft className="w-4 h-4 text-warning opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredFarmers.length === 0 && !loading && (
                    <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border mt-8">
                        <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground">No Farmers Found</h3>
                        <p className="text-muted-foreground">Try searching with a different name or mobile number</p>
                    </div>
                )}
            </div>

            <AddPurchaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addPurchase}
                onUpdate={updatePurchase}
                purchaseToEdit={selectedPurchase}
            />

            {selectedFarmer && (
                <PurchaseReceiptModal
                    isOpen={isReceiptOpen}
                    onClose={() => {
                        setIsReceiptOpen(false);
                        setSelectedFarmer(null);
                    }}
                    purchases={selectedFarmer.purchases}
                    farmerName={selectedFarmer.name}
                    farmerMobile={selectedFarmer.mobile}
                    farmerAddress={selectedFarmer.address}
                    onUpdate={(updatedPurchase) => {
                        const { id, ...purchaseData } = updatedPurchase;
                        updatePurchase(id, purchaseData);
                    }}
                    onDelete={(purchaseId) => {
                        deletePurchase(purchaseId);
                        setIsReceiptOpen(false);
                        setSelectedFarmer(null);
                    }}
                />
            )}
        </Layout>
    );
};
