import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinsPage } from './pages/DigitalTwinsPage';
import { DevicesPage } from './pages/DevicesPage';
import { AlertsPage } from './pages/AlertsPage';
import { useDashboardStore } from './store/useDashboardStore';
import { signalRService } from './services/signalrService';

export const App: React.FC = () => {
  const { activeTab } = useDashboardStore();

  useEffect(() => {
    // Start live SignalR WebSockets connection or fallback to live simulation
    signalRService.startConnection('/api/negotiate');

    return () => {
      signalRService.stopConnection();
    };
  }, []);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'twins':
        return <DigitalTwinsPage />;
      case 'devices':
        return <DevicesPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MainLayout>{renderActivePage()}</MainLayout>
    </ThemeProvider>
  );
};

export default App;
