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
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';
import {
  useGetSalariesQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
} from '../store/api/salaryApi';
import { useGetStaffQuery } from '../store/api/staffApi';
import { toast } from 'react-toastify';

export default function SalaryManagement() {
  const { user } = useAuth();
  const canEdit = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.salary?.edit;
  const { data: salaries = [], isLoading } = useGetSalariesQuery();
  const { data: staff = [] } = useGetStaffQuery();
  const [createSalary] = useCreateSalaryMutation();
  const [updateSalary] = useUpdateSalaryMutation();
  const [deleteSalary] = useDeleteSalaryMutation();

  const [open, setOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(null);
  const [formData, setFormData] = useState({
    staff: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: '',
    bonuses: 0,
    deductions: 0,
    overtime: { hours: 0, rate: 0 },
  });

  const handleOpen = (salary = null) => {
    if (salary) {
      setEditingSalary(salary);
      setFormData({
        staff: salary.staff?._id || salary.staff || '',
        month: salary.month || new Date().getMonth() + 1,
        year: salary.year || new Date().getFullYear(),
        baseSalary: salary.baseSalary || '',
        bonuses: salary.bonuses || 0,
        deductions: salary.deductions || 0,
        overtime: salary.overtime || { hours: 0, rate: 0 },
      });
    } else {
      setEditingSalary(null);
      setFormData({
        staff: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: '',
        bonuses: 0,
        deductions: 0,
        overtime: { hours: 0, rate: 0 },
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSalary(null);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        baseSalary: parseFloat(formData.baseSalary),
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        overtime: {
          hours: parseFloat(formData.overtime.hours) || 0,
          rate: parseFloat(formData.overtime.rate) || 0,
        },
      };

      if (editingSalary) {
        await updateSalary({ id: editingSalary._id, ...data }).unwrap();
        toast.success('Salary record updated successfully');
      } else {
        await createSalary(data).unwrap();
        toast.success('Salary record created successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save salary record');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await deleteSalary(id).unwrap();
        toast.success('Salary record deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete salary record');
      }
    }
  };

  const calculateTotal = (salary) => {
    const base = salary.baseSalary || 0;
    const bonuses = salary.bonuses || 0;
    const deductions = salary.deductions || 0;
    const overtime = salary.overtime?.amount || 0;
    return base + bonuses - deductions + overtime;
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
        <Typography variant="h4">Salary Management</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Salary Record
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff</TableCell>
              <TableCell>Month/Year</TableCell>
              <TableCell>Base Salary</TableCell>
              <TableCell>Bonuses</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Overtime</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {salaries.map((salary) => (
              <TableRow key={salary._id}>
                <TableCell>{salary.staff?.name || 'N/A'}</TableCell>
                <TableCell>
                  {new Date(salary.year, salary.month - 1).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>${salary.baseSalary?.toFixed(2)}</TableCell>
                <TableCell>${salary.bonuses?.toFixed(2)}</TableCell>
                <TableCell>${salary.deductions?.toFixed(2)}</TableCell>
                <TableCell>${salary.overtime?.amount?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>${calculateTotal(salary).toFixed(2)}</TableCell>
                <TableCell>
                  <Typography variant="body2" color={salary.paymentStatus === 'paid' ? 'success.main' : 'warning.main'}>
                    {salary.paymentStatus || 'pending'}
                  </Typography>
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(salary)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(salary._id)}>
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
        <DialogTitle>{editingSalary ? 'Edit Salary Record' : 'Add Salary Record'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Staff"
                value={formData.staff}
                onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                required
              >
                {staff.map((member) => (
                  <MenuItem key={member._id} value={member._id}>
                    {member.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                label="Month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Base Salary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bonuses"
                type="number"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deductions"
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Overtime Hours"
                type="number"
                value={formData.overtime.hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overtime: { ...formData.overtime, hours: parseFloat(e.target.value) || 0 },
                  })
                }
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Overtime Rate"
                type="number"
                value={formData.overtime.rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overtime: { ...formData.overtime, rate: parseFloat(e.target.value) || 0 },
                  })
                }
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSalary ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
