import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  DirectionsBoat as FacilityIcon,
  MeetingRoom as RoomIcon,
  Memory as AssetIcon,
  Sensors as SensorIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../../store/useDashboardStore';
import { TwinNode } from '../../types';

const getIconForType = (type: TwinNode['type']) => {
  switch (type) {
    case 'Facility': return <FacilityIcon sx={{ color: '#50E6FF' }} />;
    case 'Room': return <RoomIcon sx={{ color: '#FFB900' }} />;
    case 'Asset': return <AssetIcon sx={{ color: '#0078D4' }} />;
    case 'Sensor': return <SensorIcon sx={{ color: '#107C41' }} />;
  }
};

const TreeNodeItem: React.FC<{ node: TwinNode; level?: number }> = ({ node, level = 0 }) => {
  const [open, setOpen] = useState(true);
  const { selectedTwinId, setSelectedTwinId, telemetry } = useDashboardStore();

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedTwinId === node.id;

  // Use live telemetry if selecting m5stick-01
  const displayTemp = node.id === 'm5stick-01' ? telemetry.temperature : node.properties.temperature;

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: level * 2.5,
          py: 0.5,
          borderRadius: 2,
          mb: 0.5,
          backgroundColor: isSelected ? 'rgba(0, 120, 212, 0.25)' : 'transparent',
          borderLeft: isSelected ? '3px solid #0078D4' : '3px solid transparent',
          '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
          cursor: 'pointer',
        }}
        onClick={() => {
          setSelectedTwinId(node.id);
          if (hasChildren) setOpen(!open);
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {hasChildren ? (open ? <ExpandMoreIcon sx={{ color: '#9CA3AF' }} /> : <ChevronRightIcon sx={{ color: '#9CA3AF' }} />) : null}
        </ListItemIcon>

        <ListItemIcon sx={{ minWidth: 36 }}>{getIconForType(node.type)}</ListItemIcon>

        <ListItemText
          primary={node.name}
          secondary={displayTemp !== undefined ? `Temp: ${displayTemp.toFixed(1)}°C` : node.modelId}
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#FFF' : '#E5E7EB' }}
          secondaryTypographyProps={{ fontSize: '0.75rem', color: '#9CA3AF' }}
        />

        <Chip
          label={node.status}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            backgroundColor: 'rgba(16, 124, 65, 0.15)',
            color: '#107C41',
            border: '1px solid #107C41',
          }}
        />
      </ListItem>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {node.children!.map((child) => (
              <TreeNodeItem key={child.id} node={child} level={level + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

export const TwinHierarchyTree: React.FC = () => {
  const { twinTree, selectedTwinId } = useDashboardStore();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700 }}>
            Digital Twin Spatial Hierarchy
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
            Expandable asset tree matching DTDL Model topology
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 380, overflowY: 'auto' }}>
          <List disablePadding>
            <TreeNodeItem node={twinTree} />
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};
