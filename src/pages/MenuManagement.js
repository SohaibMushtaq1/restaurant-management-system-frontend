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
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} from '../store/api/menuApi';
import { toast } from 'react-toastify';

const categories = ['appetizer', 'main-course', 'dessert', 'beverage', 'salad', 'soup', 'other'];

export default function MenuManagement() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.menu?.edit;
  const { data: menuItems = [], isLoading } = useGetMenuItemsQuery();
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    price: '',
    cost: '',
    availability: true,
    featured: false,
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'other',
        price: item.price || '',
        cost: item.cost || '',
        availability: item.availability !== false,
        featured: item.featured || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: 'other',
        price: '',
        cost: '',
        availability: true,
        featured: false,
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
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
      };

      if (editingItem) {
        await updateMenuItem({ id: editingItem._id, ...data }).unwrap();
        toast.success('Menu item updated successfully');
      } else {
        await createMenuItem(data).unwrap();
        toast.success('Menu item created successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteMenuItem(id).unwrap();
        toast.success('Menu item deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete menu item');
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
        <Typography variant="h4">Menu Management</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Menu Item
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" />
                </TableCell>
                <TableCell>${item.price?.toFixed(2)}</TableCell>
                <TableCell>${item.cost?.toFixed(2)}</TableCell>
                <TableCell>${((item.price || 0) - (item.cost || 0)).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={item.availability ? 'Available' : 'Unavailable'}
                    color={item.availability ? 'success' : 'default'}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <MenuItem value={true}>Available</MenuItem>
                <MenuItem value={false}>Unavailable</MenuItem>
              </TextField>
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
