import React from 'react';
import { Box, Typography } from '@mui/material';
import { AlertPanel } from '../components/widgets/AlertPanel';

export const AlertsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 800 }}>
          Environmental Alert Command Center
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Real-time incident feed, threshold monitoring, and response SLA tracking
        </Typography>
      </Box>

      <AlertPanel />
    </Box>
  );
};
