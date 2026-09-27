import React, { useState, useEffect } from 'react';
import { ATM } from '../types';
import { Truck, AlertOctagon, CheckCircle2, DollarSign, Clock, ShieldCheck, MapPin, Navigation } from 'lucide-react';

interface RefillPlanningViewProps {
  atms: ATM[];
  onOpenRefillModal: (atm: ATM) => void;
}

export const RefillPlanningView: React.FC<RefillPlanningViewProps> = ({
  atms,
  onOpenRefillModal
}) => {
  const [truckRoutes, setTruckRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/refill-recommendations')
      .then(res => res.json())
      .then(data => {
        setTruckRoutes(data.truck_routes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const queue = [...atms]
    .filter(a => a.recommended_refill_amount > 0 || a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH')
    .sort((a, b) => a.priority_rank - b.priority_rank);

  const totalCashRequired = queue.reduce((sum, a) => sum + a.recommended_refill_amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Truck className="w-4 h-4" />
            <span>Armored Carrier Dispatch &amp; Cash replenishment planning</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Dynamic Fleet Replenishment Queue</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Prioritized logistics schedule designed to prevent cash-outs while minimizing emergency courier runs and excess vault idle cash.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Cash Required</span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              ${totalCashRequired.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">ATMs in Queue</span>
            <span className="text-xl font-bold font-mono text-slate-100">
              {queue.length}
            </span>
          </div>
        </div>
      </div>

      {/* Armored Truck Clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {truckRoutes.map((truck) => (
          <div key={truck.truck_id} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{truck.truck_id}</h3>
                  <p className="text-xs text-slate-400">Assigned: {truck.driver} • Est. Route: {truck.estimated_duration_hours} hrs</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                ${truck.total_refill_amount.toLocaleString()} Allocated
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Assigned Stops (By Priority Order)
              </span>
              <div className="space-y-2">
                {truck.assigned_atms.map((stop: any, idx: number) => (
                  <div
                    key={stop.atm_id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-slate-200">{stop.atm_id}</span>
                        <span className="text-slate-400 block text-[11px] truncate max-w-[180px]">{stop.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 block">${stop.refill_amount.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-400">{stop.hours_to_empty}h left</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        stop.urgency === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {stop.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranked Queue Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
          <h3 className="font-bold text-slate-100 text-sm">Full Fleet Priority Replenishment Queue</h3>
          <p className="text-xs text-slate-400">Formula: (Predicted Daily Demand × Safety Days) + Safety Buffer - Current Balance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-3 px-4 font-semibold">Priority Rank</th>
                <th className="py-3 px-4 font-semibold">ATM ID</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Current Balance</th>
                <th className="py-3 px-4 font-semibold">Hours to Empty</th>
                <th className="py-3 px-4 font-semibold">Risk Level</th>
                <th className="py-3 px-4 font-semibold">Priority Score</th>
                <th className="py-3 px-4 font-semibold">Recommended Refill</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 text-right font-semibold">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {queue.map(atm => (
                <tr key={atm.atm_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      atm.priority_rank <= 3
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{atm.priority_rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{atm.atm_id}</td>
                  <td className="py-3.5 px-4 text-slate-300 truncate max-w-[180px]">{atm.location}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    <span className={atm.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-slate-200'}>
                      ${atm.current_balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {atm.estimated_hours_to_empty} hrs
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      atm.risk_level === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {atm.risk_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-indigo-300 font-bold">
                    {atm.priority_score} / 100
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ${atm.recommended_refill_amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">
                    {atm.recommended_action}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onOpenRefillModal(atm)}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-all"
                    >
                      Dispatch Refill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
