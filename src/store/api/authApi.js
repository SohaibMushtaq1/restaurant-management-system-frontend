import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query({
      query: () => '/api/auth/me',
      providesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/api/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useChangePasswordMutation,
} = authApi;
