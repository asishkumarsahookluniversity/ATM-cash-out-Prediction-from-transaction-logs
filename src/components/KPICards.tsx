import React from 'react';
import { Landmark, AlertOctagon, AlertTriangle, DollarSign, ArrowDownRight, Zap } from 'lucide-react';

interface KPICardsProps {
  kpis: {
    total_atms: number;
    atms_at_risk: number;
    critical_atms: number;
    average_cash_balance: number;
    todays_withdrawals: number;
    predicted_cashouts: number;
  };
  onFilterRisk?: (risk: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, onFilterRisk }) => {
  const cards = [
    {
      title: 'Total Monitored ATMs',
      value: kpis.total_atms.toString(),
      subtext: 'Fleet Operational (50/50)',
      icon: Landmark,
      color: 'indigo',
      badge: 'Active Network',
      onClick: () => onFilterRisk?.('ALL')
    },
    {
      title: 'ATMs at Risk',
      value: kpis.atms_at_risk.toString(),
      subtext: `${Math.round((kpis.atms_at_risk / kpis.total_atms) * 100)}% of fleet depleted`,
      icon: AlertTriangle,
      color: 'amber',
      badge: 'Action Needed',
      onClick: () => onFilterRisk?.('HIGH')
    },
    {
      title: 'Critical Outage Risk',
      value: kpis.critical_atms.toString(),
      subtext: '< 8h runway remaining',
      icon: AlertOctagon,
      color: 'rose',
      badge: 'Urgent Refill',
      onClick: () => onFilterRisk?.('CRITICAL')
    },
    {
      title: 'Average Vault Balance',
      value: `$${kpis.average_cash_balance.toLocaleString()}`,
      subtext: 'Across all active terminals',
      icon: DollarSign,
      color: 'emerald',
      badge: 'Liquid Assets'
    },
    {
      title: "Today's Withdrawals",
      value: `$${kpis.todays_withdrawals.toLocaleString()}`,
      subtext: '24-hour aggregate volume',
      icon: ArrowDownRight,
      color: 'blue',
      badge: 'Cash Velocity'
    },
    {
      title: 'ML Predicted Cash-Outs',
      value: kpis.predicted_cashouts.toString(),
      subtext: 'Next 24h horizon model',
      icon: Zap,
      color: 'purple',
      badge: 'AI Forecast'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        };
      case 'amber':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
      case 'indigo':
      default:
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const colorStyle = getColorClasses(c.color);
        return (
          <div
            key={i}
            onClick={c.onClick}
            className={`p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all shadow-sm group ${
              c.onClick ? 'cursor-pointer hover:bg-slate-900' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl border ${colorStyle.bg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colorStyle.badge}`}>
                {c.badge}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 block font-medium">{c.title}</span>
              <div className="text-2xl font-bold tracking-tight text-slate-100">{c.value}</div>
              <p className="text-[11px] text-slate-500 truncate">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
