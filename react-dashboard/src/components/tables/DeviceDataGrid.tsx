import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, TextField, InputAdornment, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useDashboardStore } from '../../store/useDashboardStore';

export const DeviceDataGrid: React.FC = () => {
  const { telemetry } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample device list combining real-time state with registered sensors
  const rows = [
    {
      id: 'm5stick-01',
      deviceId: 'm5stick-01',
      twinName: 'M5Stick-01 (ENV III)',
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      pressure: telemetry.pressure,
      status: telemetry.status,
      connection: 'WiFi (192.168.1.105)',
      lastUpdated: telemetry.timestamp,
    },
    {
      id: 'm5stick-02',
      deviceId: 'm5stick-02',
      twinName: 'M5Stick-02 (Aux Engine)',
      temperature: 26.1,
      humidity: 58.4,
      pressure: 1012.8,
      status: 'Online',
      connection: 'WiFi (192.168.1.106)',
      lastUpdated: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'radar-unit-01',
      deviceId: 'radar-unit-01',
      twinName: 'Primary Nav Radar',
      temperature: 34.2,
      humidity: 45.0,
      pressure: 1013.0,
      status: 'Online',
      connection: 'Ethernet',
      lastUpdated: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'generator-02',
      deviceId: 'generator-02',
      twinName: 'Aux Generator #2',
      temperature: 42.8,
      humidity: 71.2,
      pressure: 1009.5,
      status: 'Warning',
      connection: 'Modbus TCP',
      lastUpdated: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  const filteredRows = rows.filter(
    (row) =>
      row.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.twinName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: 'deviceId',
      headerName: 'Device ID',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#50E6FF' }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'twinName', headerName: 'Digital Twin Name', width: 220 },
    {
      field: 'temperature',
      headerName: 'Temp (°C)',
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFB900' }}>
          {params.value} °C
        </Typography>
      ),
    },
    {
      field: 'humidity',
      headerName: 'Humidity (%)',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#50E6FF' }}>
          {params.value} %
        </Typography>
      ),
    },
    {
      field: 'pressure',
      headerName: 'Pressure (hPa)',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#107C41' }}>
          {params.value} hPa
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const isOnline = params.value === 'Online';
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              backgroundColor: isOnline ? 'rgba(16, 124, 65, 0.15)' : 'rgba(255, 185, 0, 0.15)',
              color: isOnline ? '#107C41' : '#FFB900',
              border: `1px solid ${isOnline ? '#107C41' : '#FFB900'}`,
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        );
      },
    },
    { field: 'connection', headerName: 'Connectivity', width: 180 },
    {
      field: 'lastUpdated',
      headerName: 'Last Telemetry',
      width: 190,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
          {new Date(params.value).toLocaleTimeString()} ({new Date(params.value).toLocaleDateString()})
        </Typography>
      ),
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700 }}>
              Registered IoT Devices & Digital Twins
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Material UI DataGrid with real-time state synchronization
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9CA3AF', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 240,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                input: { color: '#FFF', fontSize: '0.85rem' },
              }}
            />
            <Button variant="outlined" startIcon={<RefreshIcon />} size="small" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#9CA3AF' }}>
              Refresh
            </Button>
          </Box>
        </Box>

        <Box sx={{ height: 320, width: '100%' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            sx={{
              border: 'none',
              color: '#FFF',
              '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.06)' },
              '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(0, 120, 212, 0.15)', borderColor: 'rgba(255,255,255,0.1)' },
              '& .MuiDataGrid-footerContainer': { borderColor: 'rgba(255,255,255,0.06)', color: '#9CA3AF' },
              '& .MuiTablePagination-root': { color: '#9CA3AF' },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
