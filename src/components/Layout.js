import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useAuth } from '../hooks/useAuth';
import { useGetOrganizationsQuery, useSwitchOrganizationMutation } from '../store/api/organizationApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const drawerWidth = 260;

const getMenuItems = (user) => {
  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin' || isOwner;
  const permissions = user?.permissions || {};

  // Helper to check if user has view permission
  const hasPermission = (module) => {
    if (isAdmin) return true; // Admin/Owner have all permissions
    return permissions[module]?.view === true;
  };

  const menuItems = [];

  // Dashboard - always visible if authenticated
  menuItems.push({ text: 'Dashboard', icon: <DashboardIcon />, path: '/', module: 'analytics' });

  // Organizations - only for owners
  if (isOwner) {
    menuItems.push({ text: 'Organizations', icon: <BusinessIcon />, path: '/organizations', module: null });
  }

  // Menu Management
  if (hasPermission('menu')) {
    menuItems.push({ text: 'Menu Management', icon: <RestaurantMenuIcon />, path: '/menu', module: 'menu' });
  }

  // Inventory
  if (hasPermission('inventory')) {
    menuItems.push({ text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', module: 'inventory' });
  }

  // Orders
  if (hasPermission('orders')) {
    menuItems.push({ text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders', module: 'orders' });
  }

  // Staff Management
  if (hasPermission('staff')) {
    menuItems.push({ text: 'Staff Management', icon: <PeopleIcon />, path: '/staff', module: 'staff' });
  }

  // Salary Management
  if (hasPermission('salary')) {
    menuItems.push({ text: 'Salary Management', icon: <AttachMoneyIcon />, path: '/salary', module: 'salary' });
  }

  // Sales Reports
  if (hasPermission('sales')) {
    menuItems.push({ text: 'Sales Reports', icon: <AssessmentIcon />, path: '/sales', module: 'sales' });
  }

  // Analytics
  if (hasPermission('analytics')) {
    menuItems.push({ text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', module: 'analytics' });
  }

  // Profile - always visible
  menuItems.push({ text: 'Profile', icon: <PersonIcon />, path: '/profile', module: null });

  return menuItems;
};

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { logout, user } = useAuth();
  const isOwner = user?.role === 'owner';
  const { data: organizations = [] } = useGetOrganizationsQuery(undefined, {
    skip: !isOwner,
  });
  const [switchOrganization] = useSwitchOrganizationMutation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOrganizationSwitch = async (orgId) => {
    if (orgId === user?.organization?._id || orgId === user?.organization) {
      return; // Already on this organization
    }
    
    try {
      const result = await switchOrganization(orgId).unwrap();
      dispatch(setCredentials({ user: result.user, token: localStorage.getItem('token') }));
      toast.success(`Switched to ${result.user.organization.name}`);
      // Invalidate all queries to refresh data
      window.location.reload();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to switch organization');
    }
  };

  const menuItems = getMenuItems(user);

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Restaurant MS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Restaurant Management System
          </Typography>
          
          {/* Organization Switcher - Only for owners with multiple organizations */}
          {isOwner && organizations.length > 1 && (
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: 200, 
                mr: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <Select
                value={user?.organization?._id || user?.organization || ''}
                onChange={(e) => handleOrganizationSwitch(e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                }}
                startAdornment={<SwapHorizIcon sx={{ mr: 1, color: 'white' }} />}
              >
                {organizations.map((org) => (
                  <MenuItem key={org._id} value={org._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon fontSize="small" />
                      <Box>
                        <Typography variant="body2">{org.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {org.serialNumber}
                        </Typography>
                      </Box>
                      {user?.organization?._id === org._id && (
                        <Chip label="Current" size="small" color="success" sx={{ ml: 1, height: 20 }} />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {/* Show current organization if not owner or only one organization */}
          {user?.organization && (!isOwner || organizations.length <= 1) && (
            <Typography variant="body2" sx={{ mr: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
              {user.organization.name} ({user.organizationSerial || user.organization.serialNumber})
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ mr: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
            {user?.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
