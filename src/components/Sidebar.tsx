import {
    LayoutDashboard,
    Scale,
    ShoppingCart,
    Receipt,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    History,
    Settings
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Sales (Scale)', icon: Scale, path: '/sales' },
        { name: 'Purchases', icon: ShoppingCart, path: '/purchases' },
        { name: 'Expenses', icon: Receipt, path: '/expenses' },
        { name: 'History', icon: History, path: '/history' },
    ];

    const sidebarWidth = isCollapsed ? '80px' : '260px';

    return (
        <aside
            style={{ width: sidebarWidth, transition: 'width 0.2s ease-in-out' }}
            className="relative flex flex-col h-screen bg-white z-50 border-r border-slate-200 shadow-sm"
        >
            {/* Sidebar Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 w-6 h-6 bg-white text-slate-400 border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:text-emerald-600 transition-colors z-[60]"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Brand Logo */}
            <div className={`p-6 mb-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0">
                        <img src="/sp-logo.jpg" alt="SP Logo" className="w-full h-full object-cover" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="text-slate-900 font-black text-lg leading-none tracking-tight">Shree <span className="text-emerald-600">Ganesh</span></span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Fruit Suppliers</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-emerald-50 text-emerald-700 font-bold'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'} />

                            {!isCollapsed && (
                                <span className="text-sm">
                                    {item.name}
                                </span>
                            )}

                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-[70]">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-100">
                <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shrink-0">
                        A
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-slate-900 truncate">Suhas Patil</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase">Online</span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};
