import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DirectionsBoat as ShipIcon,
  Sensors as DevicesIcon,
  AccountTree as TwinsIcon,
  TrendingUp as AnalyticsIcon,
  NotificationsActive as AlertsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../../store/useDashboardStore';

const drawerWidth = 240;

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'ship', label: 'Ship Overview', icon: <ShipIcon /> },
  { id: 'devices', label: 'IoT Devices', icon: <DevicesIcon /> },
  { id: 'twins', label: 'Digital Twins', icon: <TwinsIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertsIcon /> },
  { id: 'history', label: 'History Logs', icon: <HistoryIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useDashboardStore();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0E1726',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          top: 64,
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: '#6B7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
          Navigation
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 2,
                  color: isSelected ? '#FFF' : '#9CA3AF',
                  backgroundColor: isSelected ? 'rgba(0, 120, 212, 0.2)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #0078D4' : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#FFF',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? '#50E6FF' : '#6B7280',
                    minWidth: 36,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />
        <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'rgba(0, 120, 212, 0.1)', border: '1px solid rgba(0, 120, 212, 0.2)' }}>
          <Typography variant="caption" sx={{ color: '#50E6FF', fontWeight: 700, display: 'block' }}>
            System Status: OK
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
            Azure Digital Twins connected
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
