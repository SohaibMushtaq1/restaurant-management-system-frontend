import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  useGetDashboardDataQuery,
} from '../store/api/analyticsApi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">Error loading dashboard data</Typography>
      </Paper>
    );
  }

  const data = dashboardData || {
    today: { orders: 0, revenue: 0 },
    thisMonth: { orders: 0, revenue: 0 },
    orderTypes: { dining: 0, takeaway: 0, delivery: 0 },
    orderStatus: { pending: 0, preparing: 0, ready: 0, completed: 0 },
    revenueByType: { dining: 0, takeaway: 0, delivery: 0 },
    dailyRevenue: [],
    topItems: [],
  };

  const orderTypeData = [
    { name: 'Dining', value: data.orderTypes.dining },
    { name: 'Takeaway', value: data.orderTypes.takeaway },
    { name: 'Delivery', value: data.orderTypes.delivery },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Today's Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Orders
              </Typography>
              <Typography variant="h4">
                {data.today.orders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Revenue
              </Typography>
              <Typography variant="h4">
                ${data.today.revenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                This Month Orders
              </Typography>
              <Typography variant="h4">
                {data.thisMonth.orders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                This Month Revenue
              </Typography>
              <Typography variant="h4">
                ${data.thisMonth.revenue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Revenue (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Type Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Selling Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Items
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topItems.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Pending', value: data.orderStatus.pending },
                { name: 'Preparing', value: data.orderStatus.preparing },
                { name: 'Ready', value: data.orderStatus.ready },
                { name: 'Completed', value: data.orderStatus.completed },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
