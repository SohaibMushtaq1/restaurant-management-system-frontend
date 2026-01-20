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
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../hooks/useAuth';
import { useChangePasswordMutation } from '../store/api/authApi';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user } = useAuth();
  const [changePassword] = useChangePasswordMutation();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      toast.success('Password changed successfully');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to change password');
    }
  };

  const modules = ['menu', 'inventory', 'orders', 'staff', 'salary', 'sales', 'analytics', 'invoices'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">User Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{user?.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Role
                  </Typography>
                  <Chip label={user?.role} color="primary" size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={user?.status || 'active'}
                    color={user?.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                {user?.phone && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{user.phone}</Typography>
                  </Grid>
                )}
              </Grid>
              <Box mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                  fullWidth
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Organization Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Organization Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {user?.organization && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Organization Name
                    </Typography>
                    <Typography variant="body1">{user.organization.name}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Serial Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {user.organizationSerial || user.organization.serialNumber}
                    </Typography>
                  </Grid>
                  {user.organization.email && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1">{user.organization.email}</Typography>
                    </Grid>
                  )}
                  {user.organization.phone && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">{user.organization.phone}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip
                      label={user.organization.status || 'active'}
                      color={user.organization.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Permissions</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {modules.map((module) => {
                  const hasView = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.[module]?.view;
                  const hasEdit = user?.role === 'owner' || user?.role === 'admin' || user?.permissions?.[module]?.edit;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={module}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', mb: 1 }}>
                          {module}
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Chip
                            label="View"
                            color={hasView ? 'success' : 'default'}
                            size="small"
                          />
                          <Chip
                            label="Edit"
                            color={hasEdit ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal"
            required
            helperText="Password must be at least 6 characters"
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            margin="normal"
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
