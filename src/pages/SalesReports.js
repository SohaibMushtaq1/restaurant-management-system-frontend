import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { useGetSalesSummaryQuery } from '../store/api/salesApi';

export default function SalesReports() {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)));
  const [endDate, setEndDate] = useState(new Date());
  const { data: summary, isLoading } = useGetSalesSummaryQuery({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });

  const handleApplyFilter = () => {
    // Query will automatically refetch when dates change
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const data = summary || {
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0,
    orderCount: 0,
    diningRevenue: 0,
    takeawayRevenue: 0,
    deliveryRevenue: 0,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sales Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={handleApplyFilter} fullWidth>
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">${data.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4">${data.totalCost.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Profit
              </Typography>
              <Typography variant="h4" color={data.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                ${data.totalProfit.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Profit Margin
              </Typography>
              <Typography variant="h4">{data.profitMargin}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">{data.orderCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Dining Revenue
              </Typography>
              <Typography variant="h4">${data.diningRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Takeaway Revenue
              </Typography>
              <Typography variant="h4">${data.takeawayRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Delivery Revenue
              </Typography>
              <Typography variant="h4">${data.deliveryRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
