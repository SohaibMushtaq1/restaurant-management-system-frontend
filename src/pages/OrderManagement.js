import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from '../store/api/orderApi';
import { toast } from 'react-toastify';

const orderTypes = ['dining', 'takeaway', 'delivery'];
const orderStatuses = ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'refunded'];
const paymentMethods = ['cash', 'card', 'online', 'other'];

export default function OrderManagement() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.orders?.edit;
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    orderType: 'dining',
    items: [],
    customer: { name: '', phone: '', email: '', address: '' },
    tableNumber: '',
    subtotal: 0,
    tax: 0,
    discount: 0,
    deliveryCharge: 0,
    total: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    status: 'pending',
  });

  const handleOpen = (order = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        orderType: order.orderType || 'dining',
        items: order.items || [],
        customer: order.customer || { name: '', phone: '', email: '', address: '' },
        tableNumber: order.tableNumber || '',
        subtotal: order.subtotal || 0,
        tax: order.tax || 0,
        discount: order.discount || 0,
        deliveryCharge: order.deliveryCharge || 0,
        total: order.total || 0,
        paymentMethod: order.paymentMethod || 'cash',
        paymentStatus: order.paymentStatus || 'pending',
        status: order.status || 'pending',
      });
    } else {
      setEditingOrder(null);
      setFormData({
        orderType: 'dining',
        items: [],
        customer: { name: '', phone: '', email: '', address: '' },
        tableNumber: '',
        subtotal: 0,
        tax: 0,
        discount: 0,
        deliveryCharge: 0,
        total: 0,
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrder(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingOrder) {
        await updateOrder({ id: editingOrder._id, ...formData }).unwrap();
        toast.success('Order updated successfully');
      } else {
        await createOrder(formData).unwrap();
        toast.success('Order created successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save order');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id).unwrap();
        toast.success('Order deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete order');
      }
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
        <Typography variant="h4">Order Management</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Create Order
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>
                  <Chip label={order.orderType} size="small" />
                </TableCell>
                <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                <TableCell>{order.items?.length || 0} items</TableCell>
                <TableCell>${order.total?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={order.status === 'completed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.paymentStatus}
                    color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(order)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(order._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingOrder ? 'Edit Order' : 'Create Order'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Order Type"
                value={formData.orderType}
                onChange={(e) => setFormData({ ...formData, orderType: e.target.value })}
                required
              >
                {orderTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {formData.orderType === 'dining' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Table Number"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customer.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: { ...formData.customer, name: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Phone"
                value={formData.customer.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: { ...formData.customer, phone: e.target.value },
                  })
                }
              />
            </Grid>
            {formData.orderType === 'delivery' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Address"
                  value={formData.customer.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer: { ...formData.customer, address: e.target.value },
                    })
                  }
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Tax"
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            {formData.orderType === 'delivery' && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Delivery Charge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
              >
                {paymentStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
