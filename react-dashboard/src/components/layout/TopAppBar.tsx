import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Avatar,
  Chip,
  InputBase,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../../store/useDashboardStore';

export const TopAppBar: React.FC = () => {
  const { isSignalRConnected, alerts } = useDashboardStore();
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(23, 32, 51, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
        {/* Left: Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0078D4 0%, #50E6FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#FFF',
              fontSize: '1.2rem',
              boxShadow: '0 0 12px rgba(0, 120, 212, 0.5)',
            }}
          >
            DT
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1, color: '#FFF' }}>
              Azure Digital Twins
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              Environment Monitoring Portal • Vessel Sentinel
            </Typography>
          </Box>
        </Box>

        {/* Center: Search */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            width: 320,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder="Search twins, sensors, alerts..."
            sx={{ color: '#FFF', fontSize: '0.875rem', width: '100%' }}
          />
        </Box>

        {/* Right: Actions & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* SignalR Connection Status */}
          <Tooltip title={isSignalRConnected ? 'SignalR Live Connected' : 'Disconnected (Simulation Mode)'}>
            <Chip
              icon={isSignalRConnected ? <WifiIcon style={{ color: '#107C41' }} /> : <WifiOffIcon style={{ color: '#FFB900' }} />}
              label={isSignalRConnected ? 'LIVE STREAM' : 'SIMULATION'}
              size="small"
              sx={{
                backgroundColor: isSignalRConnected ? 'rgba(16, 124, 65, 0.15)' : 'rgba(255, 185, 0, 0.15)',
                color: isSignalRConnected ? '#107C41' : '#FFB900',
                fontWeight: 700,
                fontSize: '0.7rem',
                border: `1px solid ${isSignalRConnected ? '#107C41' : '#FFB900'}`,
              }}
            />
          </Tooltip>

          {/* Notifications */}
          <IconButton sx={{ color: '#9CA3AF' }}>
            <Badge badgeContent={unacknowledgedAlerts} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: '#0078D4', fontSize: '0.875rem', fontWeight: 700 }}>
              AA
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFF', lineHeight: 1.1 }}>
                Abdul Aziz
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                IoT Engineer
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
