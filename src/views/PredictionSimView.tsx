import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, CheckCircle2, DollarSign, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export const PredictionSimView: React.FC = () => {
  const [formData, setFormData] = useState({
    atm_id: 'ATM005',
    current_cash: 18000,
    withdrawal_rate: 18,
    recent_1h_demand: 3200,
    recent_6h_demand: 14500,
    recent_24h_demand: 38000,
    last_refill_amount: 100000,
    hours_since_refill: 42,
    day_of_week: 5,
    hour: 17,
    location: 'Downtown Metro Station'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    atm_id: string;
    cashout_probability: number;
    risk_level: string;
    predicted_cashout: boolean;
    estimated_hours_to_empty: number;
    recommended_action: string;
    priority_score: number;
    recommended_refill_amount: number;
    details?: {
      hourly_burn_rate: number;
      safety_stock_target: number;
    };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'critical') {
      setFormData({
        atm_id: 'ATM012',
        current_cash: 7500,
        withdrawal_rate: 26,
        recent_1h_demand: 4500,
        recent_6h_demand: 19000,
        recent_24h_demand: 46000,
        last_refill_amount: 120000,
        hours_since_refill: 65,
        day_of_week: 5, // Friday evening surge
        hour: 19,
        location: 'Downtown Metro Station'
      });
    } else if (presetName === 'safe') {
      setFormData({
        atm_id: 'ATM038',
        current_cash: 85000,
        withdrawal_rate: 6,
        recent_1h_demand: 800,
        recent_6h_demand: 3800,
        recent_24h_demand: 12000,
        last_refill_amount: 90000,
        hours_since_refill: 12,
        day_of_week: 1, // Tuesday
        hour: 10,
        location: 'Suburban Branch'
      });
    } else {
      setFormData({
        atm_id: 'ATM021',
        current_cash: 24000,
        withdrawal_rate: 15,
        recent_1h_demand: 2200,
        recent_6h_demand: 11000,
        recent_24h_demand: 29000,
        last_refill_amount: 100000,
        hours_since_refill: 36,
        day_of_week: 3,
        hour: 14,
        location: 'Shopping Mall Plaza'
      });
    }
  };

  const isCritical = result?.risk_level === 'CRITICAL';
  const isHigh = result?.risk_level === 'HIGH';
  const isMedium = result?.risk_level === 'MEDIUM';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Interactive Machine Learning Inference Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Live Cash-Out Risk Prediction Tool</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Test any operational scenario against our trained Gradient Boosting &amp; Logistic Regression models.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Load Scenario:</span>
          <button
            onClick={() => loadPreset('critical')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium transition-all"
          >
            Near Stockout
          </button>
          <button
            onClick={() => loadPreset('medium')}
            className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition-all"
          >
            Moderate Depletion
          </button>
          <button
            onClick={() => loadPreset('safe')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium transition-all"
          >
            Healthy Vault
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-slate-100 text-sm mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>ATM Transaction &amp; State Parameters</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">ATM Identifier</label>
                <input
                  type="text"
                  value={formData.atm_id}
                  onChange={(e) => setFormData({ ...formData, atm_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">ATM Site / Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Downtown Metro Station">Downtown Metro Station</option>
                  <option value="Airport Terminal 1">Airport Terminal 1</option>
                  <option value="Shopping Mall Plaza">Shopping Mall Plaza</option>
                  <option value="Suburban Branch">Suburban Branch</option>
                  <option value="University Campus">University Campus</option>
                  <option value="Hospital Center">Hospital Center</option>
                  <option value="Business District Plaza">Business District Plaza</option>
                  <option value="Train Central Station">Train Central Station</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Current Vault Cash ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.current_cash}
                  onChange={(e) => setFormData({ ...formData, current_cash: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Recent 1h Withdrawal Demand ($)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.recent_1h_demand}
                  onChange={(e) => setFormData({ ...formData, recent_1h_demand: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Recent 6h Demand ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.recent_6h_demand}
                  onChange={(e) => setFormData({ ...formData, recent_6h_demand: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Recent 24h Demand ($)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.recent_24h_demand}
                  onChange={(e) => setFormData({ ...formData, recent_24h_demand: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Withdrawal Rate (txs/hr)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.withdrawal_rate}
                  onChange={(e) => setFormData({ ...formData, withdrawal_rate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Hours Since Last Refill</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.hours_since_refill}
                  onChange={(e) => setFormData({ ...formData, hours_since_refill: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Day of Week</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>Monday (Weekday)</option>
                  <option value={1}>Tuesday (Weekday)</option>
                  <option value={2}>Wednesday (Weekday)</option>
                  <option value={3}>Thursday (Weekday)</option>
                  <option value={4}>Friday (Evening Peak)</option>
                  <option value={5}>Saturday (Weekend Surge)</option>
                  <option value={6}>Sunday (Weekend Surge)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Hour of Day (00:00 - 23:00)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hour}
                  onChange={(e) => setFormData({ ...formData, hour: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Evaluating Feature Vectors...' : 'PREDICT CASH-OUT RISK NOW'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Display (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {result ? (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-400 font-mono">Prediction for</span>
                    <h4 className="text-lg font-bold font-mono text-slate-100">{result.atm_id}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isMedium
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {result.risk_level} RISK
                  </span>
                </div>

                {/* Big Probability Gauge */}
                <div className="py-6 text-center space-y-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
                    Cash-Out Probability (Next 24h)
                  </span>
                  <div className={`text-5xl font-black font-mono tracking-tight ${
                    isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {Math.round(result.cashout_probability * 100)}%
                  </div>

                  <div className="w-full max-w-xs mx-auto h-2 rounded-full bg-slate-950 overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.round(result.cashout_probability * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Est. Hours to Empty</span>
                    <span className={`text-base font-bold font-mono ${result.estimated_hours_to_empty < 10 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {result.estimated_hours_to_empty} hours
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Recommended Refill</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ${result.recommended_refill_amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Refill Priority Score</span>
                    <span className="text-base font-bold font-mono text-indigo-300">
                      {result.priority_score} / 100
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
                    <span className="text-slate-400 block mb-1">Target Classification</span>
                    <span className={`text-sm font-bold ${result.predicted_cashout ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.predicted_cashout ? 'Stockout Imminent (1)' : 'Safe Operational (0)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recommended Action Card */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1 font-medium uppercase tracking-wider">
                  Operational Recommendation
                </span>
                <div className="text-base font-bold text-indigo-300">
                  {result.recommended_action}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {result.recommended_action === 'URGENT REFILL'
                    ? 'Terminal balance is within critical lead time threshold. Schedule immediate truck dispatch.'
                    : result.recommended_action === 'REFILL REQUIRED'
                    ? 'Terminal is burning cash at high rate. Add to next replenishment routing cluster.'
                    : 'Terminal has sufficient cash runway. Continue automated telemetry monitoring.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 flex-1 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-600">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 text-sm">Prediction Awaiting Input</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Adjust parameters on the left or select a preconfigured operational scenario and click Predict.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
