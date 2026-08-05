export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface TelemetryData {
  deviceId: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: 'Online' | 'Offline' | 'Warning';
  timestamp: string;
}

export interface HistoricalPoint {
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  cpu?: number;
  memory?: number;
  power?: number;
}

export interface TwinNode {
  id: string;
  name: string;
  modelId: string;
  type: 'Facility' | 'Room' | 'Asset' | 'Sensor';
  status: 'Online' | 'Offline' | 'Warning';
  properties: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    lastUpdated?: string;
    location?: string;
    owner?: string;
  };
  children?: TwinNode[];
}

export interface AlertItem {
  id: string;
  deviceId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface SystemMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  activeAlerts: number;
  avgTemperature: number;
  avgHumidity: number;
  avgPressure: number;
  lastUpdated: string;
}
