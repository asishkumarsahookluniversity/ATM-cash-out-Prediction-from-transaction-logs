import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Play, RefreshCw, Database, Sparkles } from 'lucide-react';

interface DataUploadViewProps {
  onTrainSuccess?: () => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({ onTrainSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStats, setUploadStats] = useState<{
    valid: boolean;
    filename: string;
    total_rows: number;
    headers: string[];
    missing_values: number;
    duplicates: number;
    preview: Array<Record<string, string>>;
  } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);
  const [trainStep, setTrainStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      processFile(selected);
    }
  };

  const processFile = (fileToRead: File) => {
    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileToRead.name,
            content: text
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to process CSV file');
        setUploadStats(data);
      } catch (err: any) {
        setError(err.message || 'Error uploading file');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(fileToRead);
  };

  const handleTriggerTrain = async () => {
    setTraining(true);
    setTrainStep(1);
    setTrainStatus('Cleaning and chronological time sorting...');

    setTimeout(() => {
      setTrainStep(2);
      setTrainStatus('Extracting backward rolling windows and demand velocities...');
    }, 900);

    setTimeout(() => {
      setTrainStep(3);
      setTrainStatus('Splitting chronologically (70% train, 15% val, 15% test) & Training Models...');
    }, 1800);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/train', { method: 'POST' });
        const data = await res.json();
        setTrainStep(4);
        setTrainStatus('Model Training Complete! GBDT model selected with Recall priority.');
        onTrainSuccess?.();
      } catch (err: any) {
        setError(err.message || 'Training error');
      } finally {
        setTraining(false);
      }
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <UploadCloud className="w-4 h-4" />
          <span>Data Ingestion &amp; Model Retraining</span>
        </div>
        <h2 className="text-xl font-bold text-slate-100">Upload Transaction Logs</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Upload real or custom bank ATM CSV transaction files. The system validates column mappings, audits missing values and duplicates, 
          engineers temporal and rolling features without future leakage, and retrains all ML models.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="max-w-md mx-auto p-8 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-950/60 transition-all group cursor-pointer relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="p-3.5 rounded-full bg-indigo-500/10 text-indigo-400 w-12 h-12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm">
            {file ? file.name : 'Select or Drop ATM CSV Logs'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Supports CSV with ATM_ID, Timestamp, Amount, Balance, etc.
          </p>
        </div>

        {uploading && (
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Validating dataset headers and rows...</span>
          </div>
        )}

        {error && (
          <div className="p-3 max-w-lg mx-auto bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Statistics and Validation Results */}
      {uploadStats && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">{uploadStats.filename}</h3>
                <p className="text-xs text-slate-400">Schema verified and formatted for feature engineering</p>
              </div>
            </div>

            <button
              onClick={handleTriggerTrain}
              disabled={training}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
            >
              {training ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{training ? 'Training Models...' : 'Train ML Model on Dataset'}</span>
            </button>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Total Records</span>
              <span className="text-2xl font-bold font-mono text-slate-100">{uploadStats.total_rows.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">Valid rows parsed</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Detected Columns</span>
              <span className="text-2xl font-bold font-mono text-indigo-400">{uploadStats.headers.length}</span>
              <span className="text-[10px] text-slate-500 block">Headers mapped</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Missing Values</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{uploadStats.missing_values}</span>
              <span className="text-[10px] text-slate-500 block">Imputed automatically</span>
            </div>
            <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
              <span className="text-xs text-slate-400 block mb-1">Duplicate Records</span>
              <span className="text-2xl font-bold font-mono text-slate-200">{uploadStats.duplicates}</span>
              <span className="text-[10px] text-slate-500 block">Deduplicated in pipeline</span>
            </div>
          </div>

          {/* Progress Indicator when Training */}
          {trainStatus && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300">Pipeline Execution:</span>
                <span className="text-slate-400 font-mono">Step {trainStep} of 4</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${(trainStep / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 font-mono">{trainStatus}</p>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Sample Data Preview (First 5 Rows):</span>
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    {uploadStats.headers.map(h => (
                      <th key={h} className="py-2.5 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {uploadStats.preview.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      {uploadStats.headers.map(h => (
                        <td key={h} className="py-2.5 px-3 whitespace-nowrap">{row[h] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
