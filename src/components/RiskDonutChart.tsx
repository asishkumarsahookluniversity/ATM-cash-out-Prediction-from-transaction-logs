import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RiskDonutChartProps {
  data: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  onSelectRisk?: (risk: string) => void;
  selectedRisk?: string;
}

const COLORS = {
  LOW: '#10b981',       // Emerald
  MEDIUM: '#3b82f6',    // Blue
  HIGH: '#f59e0b',      // Amber
  CRITICAL: '#f43f5e'   // Rose
};

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({ data, onSelectRisk, selectedRisk }) => {
  const chartData = [
    { name: 'LOW', value: data.low, color: COLORS.LOW, label: 'Low Risk' },
    { name: 'MEDIUM', value: data.medium, color: COLORS.MEDIUM, label: 'Medium Risk' },
    { name: 'HIGH', value: data.high, color: COLORS.HIGH, label: 'High Risk' },
    { name: 'CRITICAL', value: data.critical, color: COLORS.CRITICAL, label: 'Critical Risk' }
  ];

  const total = data.low + data.medium + data.high + data.critical;

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">Fleet Risk Distribution</h3>
          <p className="text-xs text-slate-400">Real-time ML cashout vulnerability</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          50 ATMs
        </span>
      </div>

      <div className="relative flex-1 min-h-[190px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0];
                  const percent = total > 0 ? Math.round(((p.value as number) / total) * 100) : 0;
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl text-xs">
                      <span className="font-semibold text-slate-200">{p.name} RISK</span>
                      <div className="text-slate-400 mt-1">
                        {p.value} ATMs ({percent}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              cursor="pointer"
              onClick={(entry) => {
                if (entry && entry.name) {
                  onSelectRisk?.(entry.name);
                }
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#0f172a"
                  strokeWidth={2}
                  opacity={!selectedRisk || selectedRisk === 'ALL' || selectedRisk === entry.name ? 1 : 0.35}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center overlay label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono text-slate-100">{total}</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Terminals</span>
        </div>
      </div>

      {/* Legend / Filter buttons */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800/80">
        {chartData.map((item) => {
          const isSelected = selectedRisk === item.name;
          return (
            <button
              key={item.name}
              onClick={() => onSelectRisk?.(isSelected ? 'ALL' : item.name)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                isSelected
                  ? 'bg-slate-800/90 border-slate-700 shadow-inner'
                  : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.label}</span>
              </div>
              <span className="font-mono font-bold text-slate-200">{item.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
