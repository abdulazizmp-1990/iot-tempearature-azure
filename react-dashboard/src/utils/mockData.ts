import { TelemetryData, HistoricalPoint, TwinNode, AlertItem } from '../types';

export const initialTelemetry: TelemetryData = {
  deviceId: 'm5stick-01',
  temperature: 23.25,
  humidity: 65.81,
  pressure: 0.0,
  status: 'Online',
  timestamp: new Date().toISOString(),
};

export const mockHistoricalData: HistoricalPoint[] = Array.from({ length: 24 }).map((_, index) => {
  const hour = index < 10 ? `0${index}:00` : `${index}:00`;
  const baseTemp = 22.0 + Math.sin(index / 3) * 3;
  const baseHumi = 55.0 + Math.cos(index / 3) * 10;
  const basePres = 1012.0 + Math.sin(index / 2) * 4;

  return {
    time: hour,
    temperature: parseFloat(baseTemp.toFixed(2)),
    humidity: parseFloat(baseHumi.toFixed(2)),
    pressure: parseFloat(basePres.toFixed(2)),
    cpu: parseFloat((35 + Math.random() * 20).toFixed(1)),
    memory: parseFloat((60 + Math.random() * 15).toFixed(1)),
    power: parseFloat((120 + Math.random() * 30).toFixed(1)),
  };
});

export const mockTwinHierarchy: TwinNode = {
  id: 'ship-alpha',
  name: 'Vessel Ocean Sentinel (IMO 9876543)',
  modelId: 'dtmi:ship:Vessel;1',
  type: 'Facility',
  status: 'Online',
  properties: { location: 'North Sea Sector 4', owner: 'Global Maritime Ops' },
  children: [
    {
      id: 'bridge-deck',
      name: 'Bridge Navigation Deck',
      modelId: 'dtmi:ship:Compartment;1',
      type: 'Room',
      status: 'Online',
      properties: { temperature: 21.5, humidity: 48.0 },
      children: [
        {
          id: 'radar-unit-01',
          name: 'Primary Nav Radar',
          modelId: 'dtmi:ship:NavRadar;1',
          type: 'Asset',
          status: 'Online',
          properties: { temperature: 34.2, status: 'Online' },
        },
      ],
    },
    {
      id: 'engine-room',
      name: 'Main Machinery Room',
      modelId: 'dtmi:ship:Compartment;1',
      type: 'Room',
      status: 'Online',
      properties: { temperature: 28.4, humidity: 62.1 },
      children: [
        {
          id: 'm5stick-01',
          name: 'M5Stick-01 (ENV III Sensor)',
          modelId: 'dtmi:ship:Sensor;1',
          type: 'Sensor',
          status: 'Online',
          properties: { temperature: 23.66, humidity: 63.72, pressure: 1013.25 },
        },
        {
          id: 'm5stick-02',
          name: 'M5Stick-02 (Auxiliary Engine)',
          modelId: 'dtmi:ship:Sensor;1',
          type: 'Sensor',
          status: 'Online',
          properties: { temperature: 26.1, humidity: 58.4, pressure: 1012.8 },
        },
      ],
    },
  ],
};

export const mockAlerts: AlertItem[] = [
  {
    id: 'alt-001',
    deviceId: 'm5stick-01',
    severity: 'warning',
    title: 'High Humidity Warning',
    description: 'Relative humidity crossed 63% threshold in Engine Room.',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alt-002',
    deviceId: 'generator-02',
    severity: 'critical',
    title: 'Power Output Drop',
    description: 'Generator #2 frequency fluctuation detected.',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    acknowledged: true,
  },
  {
    id: 'alt-003',
    deviceId: 'm5stick-02',
    severity: 'info',
    title: 'NTP Time Sync Success',
    description: 'Device clock synchronized via pool.ntp.org.',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    acknowledged: true,
  },
];
