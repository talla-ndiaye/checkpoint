import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-primary text-primary-foreground shadow-md',
  accent: 'bg-accent text-accent-foreground shadow-md',
  success: 'bg-success text-success-foreground shadow-md',
  warning: 'bg-warning text-warning-foreground shadow-md',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200',
  primary: 'bg-black/10 text-white',
  accent: 'bg-black/10 text-white',
  success: 'bg-black/10 text-white',
  warning: 'bg-black/10 text-white',
};

export function StatCard({ title, value, description, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const isColoredVariant = variant !== 'default';

  return (
    <div className={`stat-card ${variantStyles[variant]} relative overflow-hidden group border border-border`}>


      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className={`text-xs font-bold tracking-wider uppercase ${isColoredVariant ? 'text-white/80' : 'text-muted-foreground/70'}`}>
            {title}
          </p>
          <p className="text-4xl font-black tracking-tight leading-none">{value}</p>
          {description && (
            <p className={`text-sm font-medium ${isColoredVariant ? 'text-white/70' : 'text-muted-foreground'}`}>
              {description}
            </p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${trend.isPositive
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
              } ${isColoredVariant ? '!bg-black/10 !text-white !border-black/10' : ''}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${iconStyles[variant]} shadow-sm transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
