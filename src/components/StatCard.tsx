import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: StatCardProps) => {
  const iconBaseClass = {
    default: 'bg-emerald-50 text-emerald-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-50 text-amber-600',
    destructive: 'bg-rose-50 text-rose-600',
  }[variant];

  return (
    <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-500 transition-colors">{title}</p>
          <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] font-bold text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBaseClass} shrink-0`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};
