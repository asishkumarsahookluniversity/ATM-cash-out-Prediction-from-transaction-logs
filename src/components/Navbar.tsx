import React, { useState } from 'react';
import { Alert } from '../types';
import { Bell, RefreshCw, AlertOctagon, Check, ShieldCheck, Database, Radio } from 'lucide-react';

interface NavbarProps {
  alerts: Alert[];
  onResolveAlert: (id: number) => void;
  onRefresh: () => void;
  onResetDemo: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  alerts,
  onResolveAlert,
  onRefresh,
  onResetDemo,
  isRefreshing
}) => {
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const activeAlerts = alerts.filter(a => !a.is_resolved);

  return (
    <header className="sticky top-0 z-40 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-950/50">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
              ATM CASH-OUT PREDICTION SYSTEM
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PROD-ML v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Transaction Log Based Cash-Out Prediction &amp; Fleet Logistics</p>
          </div>
        </div>

        {/* Section 33 requirement: Explicit Demo / Synthetic data banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-semibold text-[11px] tracking-wide">DEMO / SYNTHETIC DATA MODE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Demo button */}
        <button
          onClick={onResetDemo}
          title="Reset simulated ATM logs & state"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Network State</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all"
            title="System Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full border-2 border-slate-950 animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-slate-200">System Risk Alerts</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {activeAlerts.length} Active
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p>All active ATMs operating within safe cash reserves.</p>
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3.5 hover:bg-slate-800/40 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {alert.severity} RISK
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">{alert.message}</p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
