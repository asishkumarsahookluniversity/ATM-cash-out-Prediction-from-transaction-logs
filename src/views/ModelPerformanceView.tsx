import React, { useState, useEffect } from 'react';
import { ModelMetricsData } from '../types';
import { BarChart3, Award, TrendingUp, Cpu, Sliders, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
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

export const ModelPerformanceView: React.FC = () => {
  const [metricsData, setMetricsData] = useState<ModelMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => {
        setMetricsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !metricsData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading model evaluation metrics and weights...</p>
        </div>
      </div>
    );
  }

  const selectedModel = metricsData.models.find(m => m.model_name === metricsData.selected_model) || metricsData.models[0];
  const cm = selectedModel.confusion_matrix;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Award className="w-4 h-4" />
            <span>Academic &amp; Production Model Evaluation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">Machine Learning Model Comparison</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Trained strictly on chronological splits (70% train, 15% val, 15% test) to prevent future data leakage. 
            Prioritized by <strong>RECALL</strong> on the critical cash-out class to avoid false-negative terminal stockouts.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Selected Model</span>
            <span className="text-sm font-bold text-indigo-300 font-mono">{metricsData.selected_model}</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[11px]">Test Set Recall</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">{Math.round(selectedModel.recall * 1000) / 10}%</span>
          </div>
        </div>
      </div>

      {/* Dataset & Split Summary Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Total Transaction Records</span>
          <span className="text-xl font-bold font-mono text-slate-100">{metricsData.dataset_size.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Continuous ATM logs</span>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Historical Train Set (70%)</span>
          <span className="text-xl font-bold font-mono text-slate-100">{metricsData.train_samples.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{metricsData.training_period}</span>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Validation Set (15%)</span>
          <span className="text-xl font-bold font-mono text-slate-100">{metricsData.val_samples.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Hyperparameter tuning</span>
        </div>
        <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
          <span className="text-[11px] text-slate-400 block mb-1">Hold-out Test Set (15%)</span>
          <span className="text-xl font-bold font-mono text-slate-100">{metricsData.test_samples.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{metricsData.testing_period}</span>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Cross-Model Comparison Benchmark</h3>
            <p className="text-xs text-slate-400">Priority order: 1. Recall (Risk sensitivity), 2. F1 Score, 3. ROC-AUC</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            Test Holdout Set
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Model Architecture</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Accuracy</th>
                <th className="py-3.5 px-4 font-semibold">Precision</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400 bg-emerald-500/5">Recall (Primary)</th>
                <th className="py-3.5 px-4 font-semibold">F1 Score</th>
                <th className="py-3.5 px-4 font-semibold">ROC-AUC</th>
                <th className="py-3.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {metricsData.models.map(m => {
                const isSelected = m.model_name === metricsData.selected_model;
                return (
                  <tr key={m.model_name} className={`hover:bg-slate-800/30 transition-colors ${isSelected ? 'bg-indigo-600/5 font-medium' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <span>{m.model_name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{m.type}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{(m.precision * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 bg-emerald-500/5">
                      {(m.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{(m.f1 * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-indigo-300">{(m.roc_auc * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? 'ACTIVE IN PRODUCTION' : 'CANDIDATE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Feature Importance Weights</h3>
              <p className="text-xs text-slate-400">Actual weights computed from trained ML model</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
              Normalized Weights
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metricsData.feature_importances}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                />
                <YAxis
                  dataKey="displayName"
                  type="category"
                  stroke="#94a3b8"
                  width={140}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                          <span className="font-semibold text-slate-200">{payload[0].payload.displayName}</span>
                          <div className="text-indigo-400 font-mono mt-1">
                            Contribution: {Math.round((payload[0].value as number) * 1000) / 10}%
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">Holdout Confusion Matrix</h3>
                <p className="text-xs text-slate-400">{selectedModel.model_name} Test Predictions</p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                N={metricsData.test_samples.toLocaleString()}
              </span>
            </div>

            {/* Matrix Visualizer */}
            <div className="grid grid-cols-2 gap-3 text-center my-4">
              {/* True Positive */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <span className="text-[11px] text-emerald-400 font-bold block uppercase tracking-wider">
                  True Positive (TP)
                </span>
                <span className="text-3xl font-black font-mono text-emerald-300 my-1 block">
                  {cm.tp.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Correctly detected imminent cash-outs
                </span>
              </div>

              {/* False Positive */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <span className="text-[11px] text-amber-400 font-bold block uppercase tracking-wider">
                  False Positive (FP)
                </span>
                <span className="text-3xl font-black font-mono text-amber-300 my-1 block">
                  {cm.fp.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  False alarm / preemptive safety refill
                </span>
              </div>

              {/* False Negative */}
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <span className="text-[11px] text-rose-400 font-bold block uppercase tracking-wider">
                  False Negative (FN)
                </span>
                <span className="text-3xl font-black font-mono text-rose-300 my-1 block">
                  {cm.fn.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Missed cashout (Minimized by Recall)
                </span>
              </div>

              {/* True Negative */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                  True Negative (TN)
                </span>
                <span className="text-3xl font-black font-mono text-slate-200 my-1 block">
                  {cm.tn.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Correctly identified safe operations
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200 block mb-0.5">Banking Domain Insight:</strong>
            A missed stockout (FN) costs customer trust and emergency courier fees. By selecting the model maximizing Recall (94.3%), 
            the bank drastically reduces missed cash-outs down to negligible rates.
          </div>
        </div>
      </div>
    </div>
  );
};
