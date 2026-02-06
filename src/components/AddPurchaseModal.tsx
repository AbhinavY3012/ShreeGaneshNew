import { useState, useMemo, useEffect } from 'react';
import { X, ShoppingCart, Plus, Trash2, User, Phone, MapPin, Calendar } from 'lucide-react';
import { Purchase, PurchaseItem, Farmer } from '@/types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (purchase: Omit<Purchase, 'id'>) => Promise<Purchase>;
  onUpdate?: (id: string, purchase: Omit<Purchase, 'id'>) => Promise<Purchase>;
  purchaseToEdit?: Purchase | null;
}

const emptyItem: Omit<PurchaseItem, 'id' | 'totalWeight' | 'totalAmount'> = {
  date: '',
  quality: '',
  unitCount: 0,
  weightPerUnit: 0,
  pricePerKg: 0,
  advance: 0,
};

export const AddPurchaseModal = ({ isOpen, onClose, onAdd, onUpdate, purchaseToEdit }: AddPurchaseModalProps) => {
  const [farmer, setFarmer] = useState<Omit<Farmer, 'id'>>({
    name: '',
    mobile: '',
    address: '',
  });

  const [items, setItems] = useState<Array<Omit<PurchaseItem, 'id'>>>([]);
  const [newItem, setNewItem] = useState(emptyItem);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (purchaseToEdit) {
      setFarmer({
        name: purchaseToEdit.farmer.name,
        mobile: purchaseToEdit.farmer.mobile,
        address: purchaseToEdit.farmer.address,
      });
      setItems(purchaseToEdit.items.map(item => ({
        date: item.date || purchaseToEdit.date,
        quality: item.quality,
        unitCount: item.unitCount,
        weightPerUnit: item.weightPerUnit,
        totalWeight: item.totalWeight,
        pricePerKg: item.pricePerKg,
        totalAmount: item.totalAmount,
        advance: item.advance || 0,
      })));
      setPaymentMethod(purchaseToEdit.paymentMethod);
      setAdvanceAmount(purchaseToEdit.advanceAmount || 0);
      setDate(purchaseToEdit.date);
    } else {
      setFarmer({ name: '', mobile: '', address: '' });
      setItems([]);
      setAdvanceAmount(0);
      setPaymentMethod('cash');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [purchaseToEdit, isOpen]);

  const currentItemTotalWeight = newItem.unitCount * newItem.weightPerUnit;
  const currentItemTotalAmount = currentItemTotalWeight * newItem.pricePerKg;

  const addItem = () => {
    if (!newItem.quality || newItem.unitCount <= 0 || newItem.weightPerUnit <= 0 || newItem.pricePerKg <= 0) return;
    setItems(prev => [
      ...prev,
      {
        ...newItem,
        date: newItem.date || date,
        totalWeight: currentItemTotalWeight,
        totalAmount: currentItemTotalAmount,
        advance: newItem.advance || 0,
      }
    ]);
    setNewItem(emptyItem);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);
  const totalItemAdvance = useMemo(() => items.reduce((sum, item) => sum + (item.advance || 0), 0), [items]);
  const totalAdvance = useMemo(() => advanceAmount + totalItemAdvance, [advanceAmount, totalItemAdvance]);
  const pendingAmount = useMemo(() => grandTotal - totalAdvance, [grandTotal, totalAdvance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const purchaseData = {
        date: date,
        farmer: {
          id: purchaseToEdit?.farmer.id || Math.random().toString(36).substr(2, 9),
          ...farmer
        },
        items: items.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
        })),
        totalAmount: grandTotal,
        advanceAmount: totalAdvance,
        pendingAmount: pendingAmount,
        paymentMethod,
      };

      if (purchaseToEdit && onUpdate) {
        await onUpdate(purchaseToEdit.id, purchaseData);
      } else {
        await onAdd(purchaseData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Failed to save purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {purchaseToEdit ? 'Edit Purchase Lot' : 'New Farmer Purchase'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Farmer Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Purchase Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="input-premium" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Farmer Name</label>
              <input required type="text" value={farmer.name} onChange={e => setFarmer(prev => ({ ...prev, name: e.target.value }))} className="input-premium" placeholder="e.g. Rajesh Kumar" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Mobile</label>
              <input required type="tel" value={farmer.mobile} onChange={e => setFarmer(prev => ({ ...prev, mobile: e.target.value }))} className="input-premium" placeholder="9876543210" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Address</label>
              <input required type="text" value={farmer.address} onChange={e => setFarmer(prev => ({ ...prev, address: e.target.value }))} className="input-premium" placeholder="Village/City" />
            </div>
          </div>

          {/* Quick Item Entry */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Add Items to Lot</h3>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-2">
              <input type="text" placeholder="Quality" value={newItem.quality} onChange={e => setNewItem(prev => ({ ...prev, quality: e.target.value }))} className="input-premium text-sm" />
              <input type="number" placeholder="Unit Count" value={newItem.unitCount || ''} onChange={e => setNewItem(prev => ({ ...prev, unitCount: parseFloat(e.target.value) || 0 }))} className="input-premium text-sm" />
              <input type="number" placeholder="Crate Wt" value={newItem.weightPerUnit || ''} onChange={e => setNewItem(prev => ({ ...prev, weightPerUnit: parseFloat(e.target.value) || 0 }))} className="input-premium text-sm" />
              <input type="number" placeholder="Price/Kg" value={newItem.pricePerKg || ''} onChange={e => setNewItem(prev => ({ ...prev, pricePerKg: parseFloat(e.target.value) || 0 }))} className="input-premium text-sm" />
              <input type="number" placeholder="Advance" value={newItem.advance || ''} onChange={e => setNewItem(prev => ({ ...prev, advance: parseFloat(e.target.value) || 0 }))} className="input-premium text-sm" />
              <button type="button" onClick={addItem} className="bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-all font-bold">
                <Plus size={20} /> Add
              </button>
            </div>
          </div>

          {/* Table display */}
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Wt</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-right">Adv</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 font-bold text-slate-800">{item.quality}</td>
                    <td className="p-3 text-slate-600">{item.unitCount}</td>
                    <td className="p-3 text-slate-600">{item.weightPerUnit} kg</td>
                    <td className="p-3 text-slate-600">₹{item.pricePerKg}</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{item.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-right text-amber-600">₹{item.advance.toLocaleString()}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => removeItem(index)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment and Submission */}
          <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-6">
            <div className="flex gap-2">
              <label className={`cursor-pointer px-6 py-2 rounded-xl text-sm font-bold border-2 transition-all ${paymentMethod === 'cash' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                <input type="radio" className="hidden" name="pay" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash
              </label>
              <label className={`cursor-pointer px-6 py-2 rounded-xl text-sm font-bold border-2 transition-all ${paymentMethod === 'online' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                <input type="radio" className="hidden" name="pay" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} /> Online
              </label>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Grand Total</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight">₹{grandTotal.toLocaleString()}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={items.length === 0 || isSubmitting}
            className="w-full btn-primary py-4 text-xl shadow-xl hover:shadow-emerald-500/20"
          >
            {isSubmitting ? 'Processing...' : (purchaseToEdit ? 'Update Lot' : 'Confirm Purchase')}
          </button>
        </form>
      </div>
    </div>
  );
};
