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
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} from '../store/api/inventoryApi';
import { toast } from 'react-toastify';

const categories = ['vegetables', 'meat', 'dairy', 'beverages', 'spices', 'grains', 'other'];
const units = ['kg', 'liter', 'piece', 'pack', 'box', 'bottle'];

export default function InventoryManagement() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.inventory?.edit;
  const { data: inventoryItems = [], isLoading } = useGetInventoryItemsQuery();
  const [createItem] = useCreateInventoryItemMutation();
  const [updateItem] = useUpdateInventoryItemMutation();
  const [deleteItem] = useDeleteInventoryItemMutation();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    unit: 'piece',
    quantity: '',
    minQuantity: '',
    unitPrice: '',
    supplier: '',
    location: '',
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        category: item.category || 'other',
        unit: item.unit || 'piece',
        quantity: item.quantity || '',
        minQuantity: item.minQuantity || '',
        unitPrice: item.unitPrice || '',
        supplier: item.supplier || '',
        location: item.location || '',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'other',
        unit: 'piece',
        quantity: '',
        minQuantity: '',
        unitPrice: '',
        supplier: '',
        location: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        minQuantity: parseFloat(formData.minQuantity),
        unitPrice: parseFloat(formData.unitPrice),
      };

      if (editingItem) {
        await updateItem({ id: editingItem._id, ...data }).unwrap();
        toast.success('Inventory item updated successfully');
      } else {
        await createItem(data).unwrap();
        toast.success('Inventory item created successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save inventory item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteItem(id).unwrap();
        toast.success('Inventory item deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete inventory item');
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
        <Typography variant="h4">Inventory Management</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Item
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Value</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map((item) => {
              const totalValue = (item.quantity || 0) * (item.unitPrice || 0);
              const getStatusColor = (status) => {
                switch (status) {
                  case 'in-stock': return 'success';
                  case 'low-stock': return 'warning';
                  case 'out-of-stock': return 'error';
                  case 'expired': return 'error';
                  default: return 'default';
                }
              };
              return (
                <TableRow key={item._id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" />
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                  <TableCell>${totalValue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  {canEdit && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                {units.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Min Quantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
