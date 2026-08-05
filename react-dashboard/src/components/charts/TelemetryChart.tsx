import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup, ButtonGroup, Button } from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useDashboardStore } from '../../store/useDashboardStore';

export const TelemetryChart: React.FC = () => {
  const { history, timeRange, setTimeRange } = useDashboardStore();
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'temp' | 'humi' | 'pres'>('all');

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700 }}>
              Live Telemetry Analytics
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Real-time environmental metrics stream (Recharts + SignalR)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Metric Toggle */}
            <ToggleButtonGroup
              size="small"
              value={selectedMetric}
              exclusive
              onChange={(_, val) => val && setSelectedMetric(val)}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiToggleButton-root': { color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.1)' },
                '& .Mui-selected': { color: '#50E6FF !important', backgroundColor: 'rgba(0, 120, 212, 0.3) !important' },
              }}
            >
              <ToggleButton value="all">ALL METRICS</ToggleButton>
              <ToggleButton value="temp">TEMP (°C)</ToggleButton>
              <ToggleButton value="humi">HUMI (%)</ToggleButton>
              <ToggleButton value="pres">PRES (hPa)</ToggleButton>
            </ToggleButtonGroup>

            {/* Time Range Selector */}
            <ButtonGroup size="small" variant="outlined" sx={{ '& .MuiButton-root': { borderColor: 'rgba(255,255,255,0.1)', color: '#9CA3AF' } }}>
              {['1m', '15m', '1h', '24h', '7d', '30d'].map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  sx={{
                    backgroundColor: timeRange === range ? '#0078D4' : 'transparent',
                    color: timeRange === range ? '#FFF !important' : '#9CA3AF',
                    fontWeight: timeRange === range ? 700 : 400,
                  }}
                >
                  {range}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB900" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB900" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#50E6FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#50E6FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="presGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#107C41" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#107C41" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 11 }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#172033',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: 8,
                  color: '#FFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />

              {(selectedMetric === 'all' || selectedMetric === 'temp') && (
                <Area
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#FFB900"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'humi') && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#50E6FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#humiGradient)"
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'pres') && (
                <Area
                  type="monotone"
                  dataKey="pressure"
                  name="Pressure (hPa)"
                  stroke="#107C41"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#presGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};
