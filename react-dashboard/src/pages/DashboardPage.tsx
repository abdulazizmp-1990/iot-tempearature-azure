import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import {
  Thermostat as TempIcon,
  WaterDrop as HumiIcon,
  Speed as PresIcon,
  Sensors as DeviceIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { KpiCard } from '../components/cards/KpiCard';
import { TelemetryChart } from '../components/charts/TelemetryChart';
import { DigitalTwin3D } from '../components/3d/DigitalTwin3D';
import { TwinHierarchyTree } from '../components/hierarchy/TwinHierarchyTree';
import { AlertPanel } from '../components/widgets/AlertPanel';
import { DeviceDataGrid } from '../components/tables/DeviceDataGrid';
import { useDashboardStore } from '../store/useDashboardStore';

export const DashboardPage: React.FC = () => {
  const { telemetry } = useDashboardStore();

  return (
    <Box>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 800 }}>
            Executive IoT Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
            Vessel Ocean Sentinel • Real-Time Azure Digital Twins Telemetry Command Center
          </Typography>
        </Box>

        <Button variant="contained" color="primary" startIcon={<RefreshIcon />}>
          Sync Digital Twin
        </Button>
      </Box>

      {/* Hero KPI Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Temperature"
            value={telemetry.temperature.toFixed(2)}
            unit="°C"
            trend="+1.2%"
            status={telemetry.temperature > 28 ? 'Critical' : telemetry.temperature > 25 ? 'Warning' : 'Healthy'}
            icon={<TempIcon />}
            accentColor="#FFB900"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Relative Humidity"
            value={telemetry.humidity.toFixed(2)}
            unit="%"
            trend="+0.8%"
            status={telemetry.humidity > 65 ? 'Warning' : 'Healthy'}
            icon={<HumiIcon />}
            accentColor="#50E6FF"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Barometric Pressure"
            value={telemetry.pressure.toFixed(1)}
            unit="hPa"
            trend="-0.1%"
            status="Healthy"
            icon={<PresIcon />}
            accentColor="#107C41"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Device Status"
            value="M5Stick-01"
            unit=""
            trend="100% SLA"
            status={telemetry.status === 'Online' ? 'Online' : 'Warning'}
            icon={<DeviceIcon />}
            accentColor="#0078D4"
          />
        </Grid>
      </Grid>

      {/* Main Interactive Row: Live Chart & 3D Spatial Digital Twin */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={7}>
          <TelemetryChart />
        </Grid>
        <Grid item xs={12} lg={5}>
          <DigitalTwin3D />
        </Grid>
      </Grid>

      {/* Secondary Row: Spatial Tree & Active Alerts Feed */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TwinHierarchyTree />
        </Grid>
        <Grid item xs={12} md={6}>
          <AlertPanel />
        </Grid>
      </Grid>

      {/* Full Width Row: Registered Devices DataGrid */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <DeviceDataGrid />
        </Grid>
      </Grid>
    </Box>
  );
};
