import React, { useState } from 'react';
import { ATM } from '../types';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, Truck, ArrowUpRight, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ATMsListViewProps {
  atms: ATM[];
  onSelectATM: (atmId: string) => void;
  onOpenRefillModal: (atm: ATM) => void;
}

export const ATMsListView: React.FC<ATMsListViewProps> = ({
  atms,
  onSelectATM,
  onOpenRefillModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<keyof ATM>('priority_rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const locations = Array.from(new Set(atms.map(a => a.location)));

  const filtered = atms.filter(atm => {
    const matchesSearch = 
      atm.atm_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      atm.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || atm.risk_level === riskFilter;
    const matchesLocation = locationFilter === 'ALL' || atm.location === locationFilter;
    return matchesSearch && matchesRisk && matchesLocation;
  });

  filtered.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return sortOrder === 'asc' 
      ? String(valA).localeCompare(String(valB)) 
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (key: keyof ATM) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ATM ID (e.g. ATM004) or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    riskFilter === r
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Filter Line */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span>Filter Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none text-xs"
            >
              <option value="ALL">All Network Sites (10)</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 font-mono">
            Showing <span className="text-slate-100 font-bold">{filtered.length}</span> of {atms.length} Terminals
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(atm => {
            const isCritical = atm.risk_level === 'CRITICAL';
            const isHigh = atm.risk_level === 'HIGH';

            return (
              <div
                key={atm.atm_id}
                onClick={() => onSelectATM(atm.atm_id)}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100 text-sm">{atm.atm_id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        atm.priority_rank <= 3
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        Priority #{atm.priority_rank}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isCritical
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : isHigh
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : atm.risk_level === 'MEDIUM'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {atm.risk_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mb-4">{atm.location}</p>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vault Balance</span>
                      <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-slate-200'}`}>
                        ${atm.current_balance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">24h Demand</span>
                      <span className="font-mono text-slate-300">${atm.recent_24h_demand.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hours to Empty</span>
                      <span className="font-mono font-semibold text-amber-400">{atm.estimated_hours_to_empty} hrs</span>
                    </div>

                    {/* Probability Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Cash-Out Probability</span>
                        <span className="font-mono font-bold text-slate-200">{Math.round(atm.cashout_probability * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(atm.cashout_probability * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectATM(atm.atm_id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <span>View Telemetry</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenRefillModal(atm)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 rounded-xl border border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Refill</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
                <tr>
                  <th 
                    onClick={() => handleSort('priority_rank')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('atm_id')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>ATM ID</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th 
                    onClick={() => handleSort('current_balance')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Current Balance</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('recent_24h_demand')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>24h Demand</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('cashout_probability')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Cash-Out Prob</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Risk Level</th>
                  <th 
                    onClick={() => handleSort('estimated_hours_to_empty')} 
                    className="py-3.5 px-4 font-semibold cursor-pointer hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      <span>Hours to Empty</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Refill Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(atm => {
                  const isCritical = atm.risk_level === 'CRITICAL';
                  const isHigh = atm.risk_level === 'HIGH';
                  const isMedium = atm.risk_level === 'MEDIUM';

                  return (
                    <tr
                      key={atm.atm_id}
                      onClick={() => onSelectATM(atm.atm_id)}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          atm.priority_rank <= 3
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{atm.priority_rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{atm.atm_id}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium truncate max-w-[170px]">
                        {atm.location}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-slate-200'}>
                          ${atm.current_balance.toLocaleString()}
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
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {atm.estimated_hours_to_empty} hrs
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
      )}
    </div>
  );
};
