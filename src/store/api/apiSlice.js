import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result?.error?.status === 401) {
    // Token expired or invalid
    api.dispatch(logout());
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Menu',
    'Inventory',
    'Order',
    'Staff',
    'Salary',
    'Sales',
    'Analytics',
    'Organization',
  ],
  endpoints: (builder) => ({}),
});
