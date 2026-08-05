import { create } from 'zustand';
import { TelemetryData, HistoricalPoint, AlertItem, TwinNode } from '../types';
import { initialTelemetry, mockHistoricalData, mockAlerts, mockTwinHierarchy } from '../utils/mockData';

interface DashboardState {
  telemetry: TelemetryData;
  history: HistoricalPoint[];
  alerts: AlertItem[];
  twinTree: TwinNode;
  selectedTwinId: string;
  timeRange: string;
  isSignalRConnected: boolean;
  activeTab: string;

  // Actions
  setTelemetry: (data: Partial<TelemetryData>) => void;
  setTimeRange: (range: string) => void;
  setActiveTab: (tab: string) => void;
  setSelectedTwinId: (id: string) => void;
  setSignalRConnected: (connected: boolean) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  telemetry: initialTelemetry,
  history: mockHistoricalData,
  alerts: mockAlerts,
  twinTree: mockTwinHierarchy,
  selectedTwinId: 'm5stick-01',
  timeRange: '24h',
  isSignalRConnected: false,
  activeTab: 'dashboard',

  setTelemetry: (incomingData) =>
    set((state) => {
      const updatedTelemetry: TelemetryData = {
        ...state.telemetry,
        ...incomingData,
        timestamp: incomingData.timestamp || new Date().toISOString(),
      };

      // Add to historical trend
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newHistoryPoint: HistoricalPoint = {
        time: timeLabel,
        temperature: updatedTelemetry.temperature,
        humidity: updatedTelemetry.humidity,
        pressure: updatedTelemetry.pressure,
        cpu: parseFloat((35 + Math.random() * 10).toFixed(1)),
        memory: parseFloat((60 + Math.random() * 5).toFixed(1)),
        power: parseFloat((120 + Math.random() * 10).toFixed(1)),
      };

      const updatedHistory = [...state.history.slice(1), newHistoryPoint];

      return {
        telemetry: updatedTelemetry,
        history: updatedHistory,
      };
    }),

  setTimeRange: (timeRange) => set({ timeRange }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedTwinId: (selectedTwinId) => set({ selectedTwinId }),
  setSignalRConnected: (isSignalRConnected) => set({ isSignalRConnected }),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((alt) =>
        alt.id === alertId ? { ...alt, acknowledged: true } : alt
      ),
    })),
}));
