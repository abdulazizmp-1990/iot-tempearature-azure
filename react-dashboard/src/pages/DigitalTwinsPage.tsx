import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { DigitalTwin3D } from '../components/3d/DigitalTwin3D';
import { TwinHierarchyTree } from '../components/hierarchy/TwinHierarchyTree';

export const DigitalTwinsPage: React.FC = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 800 }}>
          Azure Digital Twins Explorer
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          Interactive 3D spatial models and DTDL interface topology
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <DigitalTwin3D />
        </Grid>
        <Grid item xs={12} md={5}>
          <TwinHierarchyTree />
        </Grid>
      </Grid>
    </Box>
  );
};
