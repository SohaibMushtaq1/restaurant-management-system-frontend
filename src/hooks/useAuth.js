import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, logout as logoutAction } from '../store/slices/authSlice';
import { useLoginMutation, useGetMeQuery } from '../store/api/authApi';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const { data: meData, isLoading: isLoadingMe } = useGetMeQuery(undefined, {
    skip: !token || !isAuthenticated,
  });

  // Sync user data from API if token exists but user data is missing
  React.useEffect(() => {
    if (token && meData && (!user || user._id !== meData._id)) {
      dispatch(setCredentials({ user: meData, token }));
    }
  }, [token, meData, user, dispatch]);

  const login = async (email, password, organizationSerial) => {
    try {
      const result = await loginMutation({ 
        email, 
        password, 
        organizationSerial 
      }).unwrap();
      const { token, user } = result;
      
      localStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      
      toast.success('Login successful!');
      return { token, user };
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: loading || isLoadingMe || isLoggingIn,
    login,
    logout,
  };
};
