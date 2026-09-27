import React from 'react';
import {
  LayoutDashboard,
  Landmark,
  Receipt,
  Cpu,
  Truck,
  BarChart3,
  UploadCloud,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export type ViewType = 
  | 'dashboard'
  | 'atms'
  | 'transactions'
  | 'predictions'
  | 'refill-planning'
  | 'model-performance'
  | 'data-upload'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  urgentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, urgentCount }) => {
  const navItems: Array<{ id: ViewType; label: string; icon: React.ElementType; badge?: string | number }> = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'atms', label: 'ATM Network Fleet', icon: Landmark, badge: 50 },
    { id: 'refill-planning', label: 'Refill Planning', icon: Truck, badge: urgentCount > 0 ? urgentCount : undefined },
    { id: 'predictions', label: 'Live Prediction Tool', icon: Cpu },
    { id: 'transactions', label: 'Transaction Logs', icon: Receipt },
    { id: 'model-performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'data-upload', label: 'Data Upload & Train', icon: UploadCloud },
    { id: 'settings', label: 'System Settings', icon: Sliders }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Cash Logistics AI</span>
        </div>
        <div className="text-slate-100 font-bold text-sm mt-1">Autonomous Cash Guard</div>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : typeof item.badge === 'number' && item.id === 'refill-planning'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System status pill in sidebar footer */}
      <div className="p-4 border-t border-slate-800/80 m-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Engine Status</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Online
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">
          Model: Gradient Boosting (Recall 94.3%)
        </div>
      </div>
    </aside>
  );
};
