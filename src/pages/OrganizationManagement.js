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
  Grid,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../hooks/useAuth';
import {
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useGetNextSerialQuery,
  useAddStaffToOrganizationMutation,
} from '../store/api/organizationApi';
import { useGetStaffQuery } from '../store/api/staffApi';
import { toast } from 'react-toastify';

const modules = ['menu', 'inventory', 'orders', 'staff', 'salary', 'sales', 'analytics', 'invoices'];

export default function OrganizationManagement() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const { data: organizations = [], isLoading } = useGetOrganizationsQuery(undefined, {
    skip: !isOwner,
  });
  const { data: allStaff = [] } = useGetStaffQuery();
  const [createOrganization] = useCreateOrganizationMutation();
  const { refetch: fetchNextSerial } = useGetNextSerialQuery(undefined, {
    skip: true,
  });
  const [addStaffToOrg] = useAddStaffToOrganizationMutation();

  const [open, setOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [staffTab, setStaffTab] = useState(0);
  const [checkingSerial, setCheckingSerial] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serialNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [staffFormData, setStaffFormData] = useState({
    existingStaffId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    position: 'waiter',
    permissions: {
      menu: { view: false, edit: false },
      inventory: { view: false, edit: false },
      orders: { view: false, edit: false },
      staff: { view: false, edit: false },
      salary: { view: false, edit: false },
      sales: { view: false, edit: false },
      analytics: { view: false, edit: false },
      invoices: { view: false, edit: false },
    },
  });

  const handleOpen = (org = null) => {
    if (org) {
      setFormData({
        name: org.name || '',
        email: org.email || '',
        phone: org.phone || '',
        serialNumber: org.serialNumber || '',
        address: org.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        serialNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAutoGenerateSerial = async () => {
    setCheckingSerial(true);
    try {
      const result = await fetchNextSerial();
      if (result.data) {
        setFormData({ ...formData, serialNumber: result.data.serialNumber });
        toast.success('Serial number generated!');
      }
    } catch (error) {
      toast.error('Failed to generate serial number');
    } finally {
      setCheckingSerial(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await createOrganization(formData).unwrap();
      toast.success('Organization created successfully');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create organization');
    }
  };

  const handleOpenStaffDialog = (org) => {
    setSelectedOrg(org);
    setStaffFormData({
      existingStaffId: '',
      name: '',
      email: '',
      password: '',
      phone: '',
      position: 'waiter',
      permissions: {
        menu: { view: false, edit: false },
        inventory: { view: false, edit: false },
        orders: { view: false, edit: false },
        staff: { view: false, edit: false },
        salary: { view: false, edit: false },
        sales: { view: false, edit: false },
        analytics: { view: false, edit: false },
        invoices: { view: false, edit: false },
      },
    });
    setStaffDialogOpen(true);
  };

  const handlePermissionChange = (module, action, value) => {
    setStaffFormData({
      ...staffFormData,
      permissions: {
        ...staffFormData.permissions,
        [module]: {
          ...staffFormData.permissions[module],
          [action]: value,
        },
      },
    });
  };

  const handleAddStaff = async () => {
    if (!selectedOrg) return;

    try {
      if (staffTab === 0) {
        // Add existing staff
        if (!staffFormData.existingStaffId) {
          toast.error('Please select a staff member');
          return;
        }
        await addStaffToOrg({
          orgId: selectedOrg._id,
          staffId: staffFormData.existingStaffId,
          permissions: staffFormData.permissions,
        }).unwrap();
      } else {
        // Hire new staff
        if (!staffFormData.name || !staffFormData.email || !staffFormData.password) {
          toast.error('Please fill in all required fields');
          return;
        }
        await addStaffToOrg({
          orgId: selectedOrg._id,
          name: staffFormData.name,
          email: staffFormData.email,
          password: staffFormData.password,
          phone: staffFormData.phone,
          position: staffFormData.position,
          permissions: staffFormData.permissions,
        }).unwrap();
      }
      toast.success('Staff added successfully');
      setStaffDialogOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add staff');
    }
  };

  if (!isOwner) {
    return (
      <Box>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography>Only owners can manage organizations.</Typography>
      </Box>
    );
  }

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
        <Typography variant="h4">Organization Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Organization
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org._id}>
                <TableCell>{org.name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{org.serialNumber}</TableCell>
                <TableCell>{org.email || 'N/A'}</TableCell>
                <TableCell>{org.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={org.status || 'active'}
                    color={org.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenStaffDialog(org)}>
                    <BusinessIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Organization Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Organization</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Serial Number (Optional)"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value.toUpperCase() })}
                  placeholder="ORG000001"
                  helperText="Leave empty to auto-generate"
                />
                <Button
                  variant="outlined"
                  onClick={handleAutoGenerateSerial}
                  disabled={checkingSerial}
                  sx={{ minWidth: 150 }}
                >
                  {checkingSerial ? <CircularProgress size={20} /> : 'Auto Generate'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Staff Dialog */}
      <Dialog open={staffDialogOpen} onClose={() => setStaffDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Staff - {selectedOrg?.name}</DialogTitle>
        <DialogContent>
          <Tabs value={staffTab} onChange={(e, v) => setStaffTab(v)} sx={{ mb: 2 }}>
            <Tab label="Add Existing Staff" />
            <Tab label="Hire New Staff" />
          </Tabs>

          {staffTab === 0 ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Select Staff Member"
                  value={staffFormData.existingStaffId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, existingStaffId: e.target.value })}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a staff member</option>
                  {allStaff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.email}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {/* Permissions Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
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
                        checked={staffFormData.permissions[module]?.view || false}
                        onChange={(e) => handlePermissionChange(module, 'view', e.target.checked)}
                      />
                    }
                    label="View"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={staffFormData.permissions[module]?.edit || false}
                        onChange={(e) => handlePermissionChange(module, 'edit', e.target.checked)}
                        disabled={!staffFormData.permissions[module]?.view}
                      />
                    }
                    label="Edit"
                  />
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStaff} variant="contained">
            Add Staff
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
