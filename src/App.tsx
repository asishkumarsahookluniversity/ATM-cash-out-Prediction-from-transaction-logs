import React, { useState, useEffect } from 'react';
import { ATM, Alert, DashboardData } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewType } from './components/Sidebar';
import { RefillModal } from './components/RefillModal';
import { DashboardView } from './views/DashboardView';
import { ATMsListView } from './views/ATMsListView';
import { ATMDetailView } from './views/ATMDetailView';
import { PredictionSimView } from './views/PredictionSimView';
import { RefillPlanningView } from './views/RefillPlanningView';
import { TransactionsView } from './views/TransactionsView';
import { ModelPerformanceView } from './views/ModelPerformanceView';
import { DataUploadView } from './views/DataUploadView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedATMId, setSelectedATMId] = useState<string | null>(null);
  const [refillModalATM, setRefillModalATM] = useState<ATM | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [atmsList, setAtmsList] = useState<ATM[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');

  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [dashRes, atmsRes, alertsRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/atms'),
        fetch('/api/alerts')
      ]);

      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d);
      }
      if (atmsRes.ok) {
        const a = await atmsRes.json();
        setAtmsList(a.atms || []);
      }
      if (alertsRes.ok) {
        const al = await alertsRes.json();
        setAlerts(al.active || []);
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // Auto-refresh telemetry every 60 seconds
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (id: number) => {
    try {
      await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.filter(a => a.id !== id));
      fetchAllData();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await fetch('/api/reset-demo', { method: 'POST' });
      fetchAllData();
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  const handleSelectATM = (atmId: string) => {
    setSelectedATMId(atmId);
  };

  const handleBackFromDetail = () => {
    setSelectedATMId(null);
  };

  const handleRefillSuccess = (updatedAtm: ATM) => {
    setAtmsList(prev => prev.map(a => a.atm_id === updatedAtm.atm_id ? updatedAtm : a));
    fetchAllData();
  };

  const handleFilterRiskFromChart = (risk: string) => {
    setSelectedRiskFilter(risk);
  };

  const urgentCount = atmsList.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          setSelectedATMId(null);
        }}
        urgentCount={urgentCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          alerts={alerts}
          onResolveAlert={handleResolveAlert}
          onRefresh={fetchAllData}
          onResetDemo={handleResetDemo}
          isRefreshing={isRefreshing}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {selectedATMId ? (
            <ATMDetailView
              atmId={selectedATMId}
              onBack={handleBackFromDetail}
              onOpenRefillModal={setRefillModalATM}
            />
          ) : currentView === 'dashboard' ? (
            <DashboardView
              data={dashboardData}
              onSelectATM={handleSelectATM}
              onOpenRefillModal={setRefillModalATM}
              onFilterRisk={handleFilterRiskFromChart}
              selectedRisk={selectedRiskFilter}
            />
          ) : currentView === 'atms' ? (
            <ATMsListView
              atms={atmsList}
              onSelectATM={handleSelectATM}
              onOpenRefillModal={setRefillModalATM}
            />
          ) : currentView === 'refill-planning' ? (
            <RefillPlanningView
              atms={atmsList}
              onOpenRefillModal={setRefillModalATM}
            />
          ) : currentView === 'predictions' ? (
            <PredictionSimView />
          ) : currentView === 'transactions' ? (
            <TransactionsView />
          ) : currentView === 'model-performance' ? (
            <ModelPerformanceView />
          ) : currentView === 'data-upload' ? (
            <DataUploadView onTrainSuccess={fetchAllData} />
          ) : currentView === 'settings' ? (
            <SettingsView onSettingsSaved={fetchAllData} />
          ) : null}
        </main>
      </div>

      {/* Refill Dispatch Modal */}
      <RefillModal
        atm={refillModalATM}
        onClose={() => setRefillModalATM(null)}
        onRefillSuccess={handleRefillSuccess}
      />
    </div>
  );
}
