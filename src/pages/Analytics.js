import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetRevenueChartQuery } from '../store/api/analyticsApi';

export default function Analytics() {
  const [period, setPeriod] = useState('7d');
  const { data: chartData = [], isLoading } = useGetRevenueChartQuery({ period });

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics</Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          aria-label="period selection"
        >
          <ToggleButton value="7d" aria-label="7 days">
            7 Days
          </ToggleButton>
          <ToggleButton value="30d" aria-label="30 days">
            30 Days
          </ToggleButton>
          <ToggleButton value="90d" aria-label="90 days">
            90 Days
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Revenue Trend
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              name="Revenue ($)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
