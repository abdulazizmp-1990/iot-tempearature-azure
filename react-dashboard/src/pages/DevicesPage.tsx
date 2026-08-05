import React from 'react';
import { Box, Typography } from '@mui/material';
import { DeviceDataGrid } from '../components/tables/DeviceDataGrid';

export const DevicesPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 800 }}>
          IoT Device Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Registered M5Stick devices, sensors, and network connectivity status
        </Typography>
      </Box>

      <DeviceDataGrid />
    </Box>
  );
};
