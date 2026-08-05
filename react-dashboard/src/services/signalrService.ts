import * as signalR from '@microsoft/signalr';
import { useDashboardStore } from '../store/useDashboardStore';
import { TelemetryData } from '../types';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(hubUrl: string = '/api/negotiate') {
    const { setTelemetry, setSignalRConnected } = useDashboardStore.getState();

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('newTelemetry', (data: TelemetryData) => {
        console.log('[SignalR Received Live Telemetry]:', data);
        setTelemetry(data);
      });

      this.connection.onreconnecting(() => setSignalRConnected(false));
      this.connection.onreconnected(() => setSignalRConnected(true));

      // Always start live telemetry polling for real physical M5Stick readings
      this.startLivePolling();
    } catch (err) {
      console.warn('[SignalR Service] Fallback to live API polling:', err);
      setSignalRConnected(false);
      this.startLivePolling();
    }
  }

  // Live polling mode for real IoT telemetry from Azure Functions backend
  private startLivePolling() {
    // Immediate fetch on startup
    this.fetchLatestTelemetry();

    // Poll every 1.5 seconds for real-time M5Stick updates
    setInterval(() => {
      this.fetchLatestTelemetry();
    }, 1500);
  }

  private async fetchLatestTelemetry() {
    const { setTelemetry } = useDashboardStore.getState();
    try {
      const response = await fetch('/api/telemetry?deviceId=m5stick-01');
      const resJson = await response.json();
      if (resJson && resJson.data) {
        setTelemetry(resJson.data);
      }
    } catch (err) {
      console.warn('Telemetry polling error:', err);
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}

export const signalRService = new SignalRService();
