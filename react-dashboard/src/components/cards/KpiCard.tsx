import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  status: 'Healthy' | 'Warning' | 'Critical' | 'Online';
  icon: React.ReactNode;
  accentColor: string;
  sparklineData?: { val: number }[];
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit = '',
  trend = '+0.0%',
  status,
  icon,
  accentColor,
  sparklineData = [
    { val: 10 },
    { val: 15 },
    { val: 13 },
    { val: 18 },
    { val: 22 },
    { val: 20 },
    { val: 25 },
  ],
}) => {
  const getStatusBg = () => {
    switch (status) {
      case 'Healthy':
      case 'Online':
        return { bg: 'rgba(16, 124, 65, 0.15)', color: '#107C41', border: '#107C41' };
      case 'Warning':
        return { bg: 'rgba(255, 185, 0, 0.15)', color: '#FFB900', border: '#FFB900' };
      case 'Critical':
        return { bg: 'rgba(209, 52, 56, 0.15)', color: '#D13438', border: '#D13438' };
      default:
        return { bg: 'rgba(0, 120, 212, 0.15)', color: '#0078D4', border: '#0078D4' };
    }
  };

  const statusStyle = getStatusBg();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderLeft: `4px solid ${accentColor}`,
          '&:hover': {
            boxShadow: `0 8px 30px 0 ${accentColor}25`,
          },
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: `${accentColor}18`,
                  color: accentColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon}
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                {title}
              </Typography>
            </Box>

            <Chip
              label={status}
              size="small"
              sx={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`,
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700, display: 'inline-block' }}>
                {value}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#9CA3AF', ml: 0.5, display: 'inline-block' }}>
                {unit}
              </Typography>
              <Typography variant="caption" sx={{ color: '#107C41', display: 'block', mt: 0.5, fontWeight: 600 }}>
                ↑ {trend} <span style={{ color: '#6B7280', fontWeight: 400 }}>vs last hour</span>
              </Typography>
            </Box>

            {/* Sparkline Chart */}
            <Box sx={{ width: 80, height: 40 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="monotone"
                    dataKey="val"
                    stroke={accentColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};
