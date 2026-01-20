import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Box, CircularProgress } from '@mui/material';

import { store, persistor } from './store/store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import StaffManagement from './pages/StaffManagement';
import SalaryManagement from './pages/SalaryManagement';
import SalesReports from './pages/SalesReports';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import OrganizationManagement from './pages/OrganizationManagement';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return isAuthenticated && user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="organizations" element={<OrganizationManagement />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="salary" element={<SalaryManagement />} />
                <Route path="sales" element={<SalesReports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
