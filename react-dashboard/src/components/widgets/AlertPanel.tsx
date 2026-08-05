import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, List, ListItem } from '@mui/material';
import {
  Warning as WarningIcon,
  Error as CriticalIcon,
  Info as InfoIcon,
  CheckCircle as AckIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../../store/useDashboardStore';
import { AlertSeverity } from '../../types';

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return <CriticalIcon sx={{ color: '#D13438' }} />;
    case 'warning': return <WarningIcon sx={{ color: '#FFB900' }} />;
    case 'info': return <InfoIcon sx={{ color: '#50E6FF' }} />;
  }
};

export const AlertPanel: React.FC = () => {
  const { alerts, acknowledgeAlert } = useDashboardStore();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700 }}>
              Active Environmental Alerts
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Real-time incident notifications & threshold monitoring
            </Typography>
          </Box>
          <Chip
            label={`${alerts.filter((a) => !a.acknowledged).length} Open`}
            color="error"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <List disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                backgroundColor: alert.acknowledged ? 'rgba(255, 255, 255, 0.03)' : 'rgba(23, 32, 51, 0.9)',
                border: `1px solid ${alert.acknowledged ? 'rgba(255,255,255,0.06)' : 'rgba(209, 52, 56, 0.3)'}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box sx={{ mt: 0.5 }}>{getSeverityIcon(alert.severity)}</Box>

              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFF', fontWeight: 700 }}>
                    {alert.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#9CA3AF', fontSize: '0.825rem', mb: 1 }}>
                  {alert.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={alert.deviceId}
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem', backgroundColor: 'rgba(0, 120, 212, 0.2)', color: '#50E6FF' }}
                  />

                  {alert.acknowledged ? (
                    <Chip
                      icon={<AckIcon style={{ color: '#107C41', fontSize: 14 }} />}
                      label="Acknowledged"
                      size="small"
                      sx={{ height: 22, fontSize: '0.7rem', color: '#107C41', backgroundColor: 'transparent' }}
                    />
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => acknowledgeAlert(alert.id)}
                      sx={{ py: 0.2, px: 1.5, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Acknowledge
                    </Button>
                  )}
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
