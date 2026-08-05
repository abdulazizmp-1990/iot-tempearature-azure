import axios from 'axios';
import { TelemetryData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const telemetryApi = {
  getLatestTelemetry: async (deviceId: string = 'm5stick-01'): Promise<TelemetryData> => {
    const response = await axios.get(`${API_BASE_URL}/telemetry?deviceId=${deviceId}`);
    return response.data;
  },

  postTestTelemetry: async (payload: Partial<TelemetryData>) => {
    const response = await axios.post(`${API_BASE_URL}/telemetry`, payload);
    return response.data;
  },

  getHealth: async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },
};
