import React, { useState, useEffect } from 'react';
import { ATM } from '../types';
import {
  ArrowLeft,
  Truck,
  TrendingDown,
  Clock,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  History,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ATMDetailViewProps {
  atmId: string;
  onBack: () => void;
  onOpenRefillModal: (atm: ATM) => void;
}

export const ATMDetailView: React.FC<ATMDetailViewProps> = ({
  atmId,
  onBack,
  onOpenRefillModal
}) => {
  const [detailData, setDetailData] = useState<{
    atm: ATM;
    hourlyTrend: Array<{ hour: string; demand: number; balance: number }>;
    dailyDemandTrend: Array<{ day: string; demand: number; refill: number }>;
    refillHistory: Array<{ date: string; amount: number; status: string; technician: string }>;
    riskTrajectory: Array<{ horizonHours: string; balance: number; probability: number; threshold: number }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/atms/${atmId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ATM telemetry data');
        return res.json();
      })
      .then(data => {
        setDetailData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [atmId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading comprehensive telemetry for {atmId}...</p>
        </div>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h4 className="text-base font-semibold text-slate-200">Failed to load ATM Details</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error || 'Terminal record not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl"
        >
          Return to Fleet Overview
        </button>
      </div>
    );
  }

  const { atm, hourlyTrend, dailyDemandTrend, refillHistory, riskTrajectory } = detailData;
  const isCritical = atm.risk_level === 'CRITICAL';
  const isHigh = atm.risk_level === 'HIGH';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-colors"
            title="Back to fleet"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-mono text-slate-100">{atm.atm_id}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : isHigh
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {atm.risk_level} RISK
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Priority Rank #{atm.priority_rank}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>{atm.location}</span>
              <span>•</span>
              <span>Last Refill: {atm.last_refill_date} ({atm.hours_since_refill}h ago)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onOpenRefillModal(atm)}
            className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Refill (${atm.recommended_refill_amount.toLocaleString()})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Current Vault Balance</span>
          <span className={`text-lg font-bold font-mono ${isCritical ? 'text-rose-400' : 'text-slate-100'}`}>
            ${atm.current_balance.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">Cap: ${atm.max_capacity.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Est. Hours to Empty</span>
          <span className={`text-lg font-bold font-mono ${atm.estimated_hours_to_empty < 10 ? 'text-rose-400' : 'text-amber-400'}`}>
            {atm.estimated_hours_to_empty} hrs
          </span>
          <span className="text-[10px] text-slate-500 block">Critical lead-time</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Cash-Out Probability</span>
          <span className="text-lg font-bold font-mono text-slate-100">
            {Math.round(atm.cashout_probability * 100)}%
          </span>
          <span className="text-[10px] text-slate-500 block">Horizon: next 24h</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">24h Demand Volume</span>
          <span className="text-lg font-bold font-mono text-slate-100">
            ${atm.recent_24h_demand.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">1h: ${atm.recent_1h_demand.toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Recommended Refill</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            ${atm.recommended_refill_amount.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block">Safety stock optimized</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <span className="text-[11px] text-slate-400 block mb-0.5">Operational Action</span>
          <span className="text-xs font-bold text-indigo-300 block truncate mt-1">
            {atm.recommended_action}
          </span>
          <span className="text-[10px] text-slate-500 block">Score: {atm.priority_score}/100</span>
        </div>
      </div>

      {/* Chart Row 1: Balance Trend & Hourly Demand Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Balance Drawdown & Threshold Chart */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">24-Hour Balance Drawdown Trend</h3>
              <p className="text-xs text-slate-400">Actual vault depletion versus critical threshold</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              Live Vault
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrend}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                          <span className="font-semibold text-slate-300">{payload[0].payload.hour}</span>
                          <div className="text-indigo-400 font-mono mt-1">
                            Balance: ${Number(payload[0].value).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={15000} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Min Threshold ($15k)', fill: '#f43f5e', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#balanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Withdrawal Demand Pattern */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Hourly Withdrawal Demand Pattern</h3>
              <p className="text-xs text-slate-400">Diurnal transaction volume ($/hr)</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              Diurnal Flow
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                          <span className="font-semibold text-slate-300">{payload[0].payload.hour}</span>
                          <div className="text-emerald-400 font-mono mt-1">
                            Hourly Demand: ${Number(payload[0].value).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="demand" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: 7-Day Demand Trend & Forecast Risk Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Demand & Replenishment Trend */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">7-Day Demand &amp; Refill History</h3>
              <p className="text-xs text-slate-400">Weekly cycles highlighting weekend surges</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              Weekly Demand
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyDemandTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                          <span className="font-semibold text-slate-300">{payload[0].payload.day}</span>
                          <div className="text-blue-400 font-mono mt-1">
                            Daily Demand: ${Number(payload[0].value).toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 48-Hour Forecast Risk Probability Trajectory */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">48-Hour Cash-Out Risk Forecast</h3>
              <p className="text-xs text-slate-400">Predicted cashout probability curve over time</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Risk Curve
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrajectory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="horizonHours" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  domain={[0, 1]}
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                          <span className="font-semibold text-slate-300">Horizon: {p.horizonHours}</span>
                          <div className="text-rose-400 font-mono mt-1">
                            Cashout Risk: {Math.round(p.probability * 100)}%
                          </div>
                          <div className="text-slate-400 font-mono mt-0.5">
                            Est. Balance: ${p.balance.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0.8} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical (80%)', fill: '#f43f5e', fontSize: 10 }} />
                <ReferenceLine y={0.6} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'High (60%)', fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Refill Log History Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Replenishment Service Audit Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Last 3 Servicing Trips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Service Date</th>
                <th className="py-2.5 px-4 font-semibold">Loaded Amount</th>
                <th className="py-2.5 px-4 font-semibold">Technician / Logistics Carrier</th>
                <th className="py-2.5 px-4 font-semibold">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {refillHistory.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono">{item.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    ${item.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{item.technician}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status}</span>
                    </span>
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
