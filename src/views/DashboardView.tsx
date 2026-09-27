import React from 'react';
import { ATM, DashboardData } from '../types';
import { KPICards } from '../components/KPICards';
import { RiskDonutChart } from '../components/RiskDonutChart';
import { Truck, ArrowUpRight, ShieldAlert, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  data: DashboardData | null;
  onSelectATM: (atmId: string) => void;
  onOpenRefillModal: (atm: ATM) => void;
  onFilterRisk: (risk: string) => void;
  selectedRisk: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onSelectATM,
  onOpenRefillModal,
  onFilterRisk,
  selectedRisk
}) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading ATM Fleet Telemetry &amp; Risk Engine...</p>
        </div>
      </div>
    );
  }

  const priorityAtms = data.priority_atms.filter(a => {
    if (selectedRisk && selectedRisk !== 'ALL') {
      return a.risk_level === selectedRisk;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <KPICards kpis={data.kpis} onFilterRisk={onFilterRisk} />

      {/* Analytics & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Donut Chart */}
        <div className="lg:col-span-1">
          <RiskDonutChart
            data={data.risk_distribution}
            onSelectRisk={onFilterRisk}
            selectedRisk={selectedRisk}
          />
        </div>

        {/* Priority Refill Dispatch Action Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Next-Generation Predictive Replenishment</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-medium">
                Autonomous Dispatch
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-2">
              Which ATM Needs Cash Refill First?
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Our continuous Machine Learning pipeline calculates multi-factor priority scores dynamically using cash-out probability, 
              hours-to-empty, withdrawal velocity, and location demand. Below are the critical terminals scheduled for nearest armored truck replenishment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Top Refill Priority</span>
              <span className="text-base font-bold text-rose-400 font-mono">
                {data.priority_atms[0]?.atm_id || 'None'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {data.priority_atms[0]?.location}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Estimated Hours to Empty</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {data.priority_atms[0]?.estimated_hours_to_empty} hrs
              </span>
              <span className="text-[10px] text-slate-500 block">Critical lead-time window</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Recommended Refill</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ${data.priority_atms[0]?.recommended_refill_amount?.toLocaleString() || 0}
              </span>
              <span className="text-[10px] text-slate-500 block">Calculated + safety buffer</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lead time safety stock: {data.system_settings.safetyDays} days of volatility protection</span>
            </div>
            {data.priority_atms[0] && (
              <button
                onClick={() => onOpenRefillModal(data.priority_atms[0])}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Refill Priority #1 ({data.priority_atms[0].atm_id})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main ATM Risk Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Dynamic Refill Priority Queue</h3>
            <p className="text-xs text-slate-400">Ranked by risk probability, burn rate, and hours-to-empty</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Risk:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(risk => (
              <button
                key={risk}
                onClick={() => onFilterRisk(risk)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedRisk === risk
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Priority</th>
                <th className="py-3.5 px-4 font-semibold">ATM ID</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Current Balance</th>
                <th className="py-3.5 px-4 font-semibold">24h Demand</th>
                <th className="py-3.5 px-4 font-semibold">Cash-Out Prob</th>
                <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                <th className="py-3.5 px-4 font-semibold">Est. Hours to Empty</th>
                <th className="py-3.5 px-4 font-semibold">Refill Amount</th>
                <th className="py-3.5 px-4 font-semibold">Recommended Action</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {priorityAtms.map(atm => {
                const isCritical = atm.risk_level === 'CRITICAL';
                const isHigh = atm.risk_level === 'HIGH';
                const isMedium = atm.risk_level === 'MEDIUM';

                return (
                  <tr
                    key={atm.atm_id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectATM(atm.atm_id)}
                  >
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${
                        atm.priority_rank === 1
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : atm.priority_rank <= 3
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{atm.priority_rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{atm.atm_id}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium truncate max-w-[170px]">
                      {atm.location}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span className={isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-slate-200'}>
                        ${atm.current_balance.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        of ${atm.max_capacity.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ${atm.recent_24h_demand.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : isMedium ? 'bg-blue-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round(atm.cashout_probability * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold">
                          {Math.round(atm.cashout_probability * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : isMedium
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {atm.risk_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={atm.estimated_hours_to_empty < 10 ? 'text-rose-400' : 'text-slate-200'}>
                        {atm.estimated_hours_to_empty} hrs
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">
                      ${atm.recommended_refill_amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        atm.recommended_action === 'URGENT REFILL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : atm.recommended_action === 'REFILL REQUIRED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : atm.recommended_action === 'REFILL SOON'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {atm.recommended_action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenRefillModal(atm)}
                        className="px-3 py-1 text-[11px] font-medium bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 rounded-lg border border-slate-700 hover:border-emerald-500 transition-all shadow-sm"
                      >
                        Refill
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
