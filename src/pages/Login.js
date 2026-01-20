import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useLoginMutation, useRegisterMutation } from '../store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useGetNextSerialQuery } from '../store/api/organizationApi';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Login() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [organizationSerial, setOrganizationSerial] = useState('');
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [phone, setPhone] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [checkingSerial, setCheckingSerial] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const { refetch: fetchNextSerial } = useGetNextSerialQuery(undefined, {
    skip: true,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setOrganizationSerial('');
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
    setOrganizationName('');
    setPhone('');
    setSerialNumber('');
    setCheckingSerial(false);
  };

  const handleAutoGenerateSerial = async () => {
    setCheckingSerial(true);
    try {
      const result = await fetchNextSerial();
      if (result.data) {
        setSerialNumber(result.data.serialNumber);
        toast.success('Serial number generated!');
      }
    } catch (error) {
      toast.error('Failed to generate serial number');
    } finally {
      setCheckingSerial(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginEmail || !loginPassword || !organizationSerial) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await loginMutation({
        email: loginEmail,
        password: loginPassword,
        organizationSerial: organizationSerial.trim().toUpperCase(),
      }).unwrap();

      localStorage.setItem('token', result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      setError(err?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!registerName || !registerEmail || !registerPassword || !organizationName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await registerMutation({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        organizationName,
        phone,
        serialNumber: serialNumber.trim().toUpperCase() || undefined,
      }).unwrap();

      localStorage.setItem('token', result.token);
      dispatch(setCredentials({ user: result.user, token: result.token }));
      toast.success(`Registration successful! Your organization serial number is: ${result.user.organization.serialNumber}`);
      navigate('/');
    } catch (err) {
      setError(err?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <RestaurantIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Restaurant Management System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to your account or create a new organization
          </Typography>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />
            <TextField
              fullWidth
              label="Organization Serial Number"
              value={organizationSerial}
              onChange={(e) => setOrganizationSerial(e.target.value.toUpperCase())}
              margin="normal"
              required
              placeholder="ORG000001"
              helperText="Enter your organization's serial number"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        </TabPanel>

        {/* Register Tab */}
        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="Full Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              margin="normal"
              required
              InputProps={{
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField
                fullWidth
                label="Organization Serial Number (Optional)"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="ORG000001"
                helperText="Leave empty to auto-generate"
                InputProps={{
                  startAdornment: <AutoAwesomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register & Create Organization'}
            </Button>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
}
