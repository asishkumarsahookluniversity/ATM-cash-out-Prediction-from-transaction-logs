export interface ATM {
  atm_id: string;
  location: string;
  current_balance: number;
  max_capacity: number;
  daily_avg_demand: number;
  today_withdrawals: number;
  recent_1h_demand: number;
  recent_6h_demand: number;
  recent_24h_demand: number;
  withdrawal_velocity: number;
  last_refill_date: string;
  hours_since_refill: number;
  status: 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  cashout_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predicted_cashout: boolean;
  estimated_hours_to_empty: number;
  recommended_refill_amount: number;
  priority_score: number;
  priority_rank: number;
  recommended_action: 'MONITOR' | 'REFILL SOON' | 'REFILL REQUIRED' | 'URGENT REFILL';
}

export interface Alert {
  id: number;
  atm_id: string;
  location: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  message: string;
  is_resolved: boolean;
}

export interface Transaction {
  id: string;
  atm_id: string;
  timestamp: string;
  transaction_type: 'WITHDRAWAL' | 'DEPOSIT' | 'REFILL' | 'INQUIRY' | 'WITHDRAWAL_FAILED';
  amount: number;
  balance_after: number;
  location: string;
}

export interface DashboardData {
  kpis: {
    total_atms: number;
    atms_at_risk: number;
    critical_atms: number;
    average_cash_balance: number;
    todays_withdrawals: number;
    predicted_cashouts: number;
  };
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  priority_atms: ATM[];
  active_alerts: Alert[];
  system_settings: SystemSettings;
}

export interface SystemSettings {
  minCashThreshold: number;
  lowRiskThreshold: number;
  highRiskThreshold: number;
  criticalRiskThreshold: number;
  safetyDays: number;
  safetyStockRatio: number;
  leadTimeHours: number;
}

export interface ModelMetricItem {
  model_name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusion_matrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  roc_curve?: Array<{ fpr: number; tpr: number; threshold: number }>;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  displayName: string;
}

export interface ModelMetricsData {
  dataset_size: number;
  train_samples: number;
  val_samples: number;
  test_samples: number;
  training_period: string;
  testing_period: string;
  selected_model: string;
  models: ModelMetricItem[];
  feature_importances: FeatureImportance[];
}
