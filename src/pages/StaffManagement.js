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
  Tooltip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SecurityIcon from '@mui/icons-material/Security';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../hooks/useAuth';
import {
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useChangeStaffPasswordMutation,
} from '../store/api/staffApi';
import { toast } from 'react-toastify';

const positions = ['chef', 'waiter', 'cashier', 'manager', 'delivery', 'other'];
const modules = ['menu', 'inventory', 'orders', 'staff', 'salary', 'sales', 'analytics', 'invoices'];

export default function StaffManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';
  const canEdit = isAdmin || user?.permissions?.staff?.edit;
  const { data: staff = [], isLoading } = useGetStaffQuery();
  const [createStaff] = useCreateStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();
  const [changePassword] = useChangeStaffPasswordMutation();

  const [open, setOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedStaffForPassword, setSelectedStaffForPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const defaultPermissions = {
    menu: { view: false, edit: false },
    inventory: { view: false, edit: false },
    orders: { view: false, edit: false },
    staff: { view: false, edit: false },
    salary: { view: false, edit: false },
    sales: { view: false, edit: false },
    analytics: { view: false, edit: false },
    invoices: { view: false, edit: false },
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    position: 'waiter',
    department: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: '',
    status: 'active',
    permissions: { ...defaultPermissions },
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
    },
    notes: '',
  });

  const handleOpen = async (member = null) => {
    if (member) {
      setEditingStaff(member);
      let permissions = { ...defaultPermissions };
      if (member.user) {
        try {
          // Permissions should be in member.user.permissions
          permissions = member.user?.permissions || defaultPermissions;
        } catch (error) {
          console.error('Error fetching permissions:', error);
        }
      }
      setFormData({
        name: member.name || '',
        email: member.email || '',
        password: '',
        phone: member.phone || '',
        address: member.address || '',
        position: member.position || 'waiter',
        department: member.department || '',
        hireDate: member.hireDate ? new Date(member.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        salary: member.salary || '',
        status: member.status || 'active',
        permissions: permissions,
        emergencyContact: member.emergencyContact || {
          name: '',
          phone: '',
          relation: '',
        },
        notes: member.notes || '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        position: 'waiter',
        department: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
        status: 'active',
        permissions: { ...defaultPermissions },
        emergencyContact: {
          name: '',
          phone: '',
          relation: '',
        },
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStaff(null);
  };

  const handlePermissionChange = (module, action, value) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [module]: {
          ...formData.permissions[module],
          [action]: value,
        },
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
      };

      if (editingStaff) {
        await updateStaff({ id: editingStaff._id, ...data }).unwrap();
        toast.success('Staff member updated successfully');
      } else {
        await createStaff(data).unwrap();
        toast.success('Staff member created successfully');
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save staff member');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id).unwrap();
        toast.success('Staff member deleted successfully');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete staff member');
      }
    }
  };

  const handleOpenPasswordDialog = (member) => {
    setSelectedStaffForPassword(member);
    setNewPassword('');
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        id: selectedStaffForPassword._id,
        password: newPassword,
      }).unwrap();
      toast.success('Password changed successfully');
      setPasswordDialogOpen(false);
      setSelectedStaffForPassword(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to change password');
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
        <Typography variant="h4">Staff Management</Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Staff
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell>Password Status</TableCell>}
              {canEdit && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member._id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Chip label={member.position} size="small" />
                </TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>${member.salary?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={member.status}
                    color={member.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Tooltip title={member.hasPassword ? 'Password is set' : 'No password set'}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenPasswordDialog(member)}
                        color={member.hasPassword ? 'success' : 'default'}
                      >
                        {member.hasPassword ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
                {canEdit && (
                  <TableCell>
                    <IconButton size="small" onClick={() => handleOpen(member)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(member._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Staff Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
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
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            {isAdmin && (!editingStaff || !editingStaff.user) && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText="Set password to create user account"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              >
                {positions.map((pos) => (
                  <MenuItem key={pos} value={pos}>
                    {pos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </TextField>
            </Grid>

            {/* Permissions Section - Only show if admin and password is being set or editing existing user */}
            {isAdmin && (formData.password || editingStaff?.user) && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Permissions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {modules.map((module) => (
                  <Accordion key={module} elevation={1} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <SecurityIcon sx={{ mr: 1 }} />
                      <Typography sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                        {module}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ display: 'flex', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions[module]?.view || false}
                            onChange={(e) => handlePermissionChange(module, 'view', e.target.checked)}
                          />
                        }
                        label="View"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions[module]?.edit || false}
                            onChange={(e) => handlePermissionChange(module, 'edit', e.target.checked)}
                            disabled={!formData.permissions[module]?.view}
                          />
                        }
                        label="Edit"
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Emergency Contact
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Relation"
                value={formData.emergencyContact.relation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relation: e.target.value },
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingStaff ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            helperText="Password must be at least 6 characters"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
