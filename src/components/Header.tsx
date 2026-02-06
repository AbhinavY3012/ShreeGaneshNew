import { Sprout, CalendarDays } from 'lucide-react';

export const Header = () => {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
              <img src="/sp-logo.jpg" alt="SP Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Shree Ganesh Fruit Suppliers
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                <CalendarDays size={12} />
                <span>{today}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800">Suhas Patil</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">System Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
