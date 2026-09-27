import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Receipt, Search, Download, ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight, Truck } from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [atmFilter, setAtmFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });
    if (atmFilter !== 'ALL') params.append('atm_id', atmFilter);
    if (typeFilter !== 'ALL') params.append('type', typeFilter);

    fetch(`/api/transactions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, atmFilter, typeFilter]);

  const filtered = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.atm_id.toLowerCase().includes(term) ||
      tx.location.toLowerCase().includes(term) ||
      tx.id.toLowerCase().includes(term)
    );
  });

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction_ID,ATM_ID,Timestamp,Type,Amount,Balance_After,Location'];
    const rows = transactions.map(t =>
      `${t.id},${t.atm_id},${t.timestamp},${t.transaction_type},${t.amount},${t.balance_after},"${t.location}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atm_transactions_export_page_${page}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Tx ID, ATM ID, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Type:</span>
              {['ALL', 'WITHDRAWAL', 'DEPOSIT', 'REFILL'].map(type => (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(type); setPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    typeFilter === type
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="font-mono text-slate-400">
            Total Logs: <span className="text-slate-100 font-bold">{total.toLocaleString()}</span> records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Tx ID</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">ATM ID</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map(tx => {
                const isWithdrawal = tx.transaction_type === 'WITHDRAWAL';
                const isDeposit = tx.transaction_type === 'DEPOSIT';
                const isRefill = tx.transaction_type === 'REFILL';

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{tx.timestamp}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-100">{tx.atm_id}</td>
                    <td className="py-3 px-4 text-slate-300 truncate max-w-[200px]">{tx.location}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isWithdrawal
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : isDeposit
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : isRefill
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {isWithdrawal && <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                        {isDeposit && <ArrowUpRight className="w-3 h-3 text-blue-400" />}
                        {isRefill && <Truck className="w-3 h-3 text-emerald-400" />}
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={isWithdrawal ? 'text-rose-400' : 'text-emerald-400'}>
                        {isWithdrawal ? `-$${tx.amount.toLocaleString()}` : `+$${tx.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200 font-semibold">
                      ${tx.balance_after.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <span className="text-slate-100 font-bold">{page}</span> of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none border border-slate-800 rounded-xl transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none border border-slate-800 rounded-xl transition-all flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
