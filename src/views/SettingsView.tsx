import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { Sliders, Save, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

interface SettingsViewProps {
  onSettingsSaved?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    minCashThreshold: 15000,
    lowRiskThreshold: 0.30,
    highRiskThreshold: 0.60,
    criticalRiskThreshold: 0.80,
    safetyDays: 2.5,
    safetyStockRatio: 0.20,
    leadTimeHours: 6.0
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.minCashThreshold === 'number') {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSavedMsg(true);
      onSettingsSaved?.();
      setTimeout(() => setSavedMsg(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      minCashThreshold: 15000,
      lowRiskThreshold: 0.30,
      highRiskThreshold: 0.60,
      criticalRiskThreshold: 0.80,
      safetyDays: 2.5,
      safetyStockRatio: 0.20,
      leadTimeHours: 6.0
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <Sliders className="w-4 h-4" />
          <span>System Policies &amp; Thresholds</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Configurable Operational Parameters</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Tune cash replenishment safety buffers and ML classification boundaries. All calculations and fleet priority rankings update dynamically.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        {savedMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Operational settings saved and applied to entire 50-ATM network!</span>
          </div>
        )}

        {/* Cash Thresholds Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
            1. Cash Reserve &amp; Lead-Time Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Minimum Cash Threshold (Floor $)
              </label>
              <input
                type="number"
                step="1000"
                min="1000"
                value={settings.minCashThreshold}
                onChange={(e) => setSettings({ ...settings, minCashThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                ATM triggers emergency label when vault cash falls below this limit.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Armored Truck Lead Time (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={settings.leadTimeHours}
                onChange={(e) => setSettings({ ...settings, leadTimeHours: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Average elapsed time between refill order and vault cash reload.
              </span>
            </div>
          </div>
        </div>

        {/* Risk Probability Classification */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
            2. ML Cash-Out Risk Classification Boundaries
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-blue-400 block mb-1">
                Low Risk Boundary (p &lt; ?)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="0.50"
                value={settings.lowRiskThreshold}
                onChange={(e) => setSettings({ ...settings, lowRiskThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 0.30 (30%)</span>
            </div>

            <div>
              <label className="text-xs font-medium text-amber-400 block mb-1">
                High Risk Threshold (p &ge; ?)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.35"
                max="0.80"
                value={settings.highRiskThreshold}
                onChange={(e) => setSettings({ ...settings, highRiskThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 0.60 (60%)</span>
            </div>

            <div>
              <label className="text-xs font-medium text-rose-400 block mb-1">
                Critical Risk Cutoff (p &ge; ?)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.70"
                max="0.95"
                value={settings.criticalRiskThreshold}
                onChange={(e) => setSettings({ ...settings, criticalRiskThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Default: 0.80 (80%)</span>
            </div>
          </div>
        </div>

        {/* Replenishment Policy */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2">
            3. Refill Formula Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Safety Coverage Days (Multiplier)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="7"
                value={settings.safetyDays}
                onChange={(e) => setSettings({ ...settings, safetyDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Multiplies daily predicted demand for replenishment delivery cycle.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Safety Stock Buffer Ratio (% of Daily Demand)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                max="0.60"
                value={settings.safetyStockRatio}
                onChange={(e) => setSettings({ ...settings, safetyStockRatio: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Extra cash cushion reserved against demand spikes (e.g. 0.20 = 20%).
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Bank Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Fleet Policies...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
