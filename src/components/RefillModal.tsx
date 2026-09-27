import React, { useState } from 'react';
import { ATM } from '../types';
import { X, Truck, CheckCircle2, AlertTriangle, DollarSign } from 'lucide-react';

interface RefillModalProps {
  atm: ATM | null;
  onClose: () => void;
  onRefillSuccess: (updatedAtm: ATM) => void;
}

export const RefillModal: React.FC<RefillModalProps> = ({ atm, onClose, onRefillSuccess }) => {
  if (!atm) return null;

  const defaultRefill = atm.recommended_refill_amount > 0 
    ? atm.recommended_refill_amount 
    : (atm.max_capacity - atm.current_balance);

  const [amount, setAmount] = useState<number>(defaultRefill);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/atms/${atm.atm_id}/refill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refill_amount: amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch refill');

      setSuccessMsg(data.message);
      setTimeout(() => {
        onRefillSuccess(data.atm);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error executing refill');
    } finally {
      setLoading(false);
    }
  };

  const maxFillable = Math.max(0, atm.max_capacity - atm.current_balance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-lg">Dispatch Cash Refill</h3>
              <p className="text-xs text-slate-400">{atm.atm_id} — {atm.location}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-lg font-medium text-slate-100">Refill Dispatched!</h4>
            <p className="text-sm text-slate-400">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Current Balance</span>
                <span className="text-lg font-bold text-slate-200">${atm.current_balance.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 block mb-1">Canister Capacity</span>
                <span className="text-lg font-bold text-slate-200">${atm.max_capacity.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-slate-300 font-medium">Replenishment Amount ($)</label>
                <span className="text-indigo-400 cursor-pointer hover:underline" onClick={() => setAmount(defaultRefill)}>
                  Recommended: ${defaultRefill.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="number"
                  step="5000"
                  min="5000"
                  max={maxFillable}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Math.min(maxFillable, Number(e.target.value))))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Available vault space: ${maxFillable.toLocaleString()}. Loaded in standard $5,000 banknote cassettes.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
              <div className="flex justify-between">
                <span>Predicted Post-Refill Balance:</span>
                <span className="font-semibold text-slate-200">${(atm.current_balance + amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Operational Runway:</span>
                <span className="font-semibold text-slate-200">
                  {Math.round(((atm.current_balance + amount) / Math.max(100, atm.recent_24h_demand / 24)) * 10) / 10} hours
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || amount <= 0}
                className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-2"
              >
                {loading ? 'Dispatching...' : 'Confirm Armored Dispatch'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
