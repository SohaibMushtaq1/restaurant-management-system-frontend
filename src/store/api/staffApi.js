import { apiSlice } from './apiSlice';

export const staffApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStaff: builder.query({
      query: () => '/api/staff',
      providesTags: ['Staff'],
    }),
    getStaffMember: builder.query({
      query: (id) => `/api/staff/${id}`,
      providesTags: (result, error, id) => [{ type: 'Staff', id }],
    }),
    createStaff: builder.mutation({
      query: (data) => ({
        url: '/api/staff',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Staff'],
    }),
    updateStaff: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/staff/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Staff', id }],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/api/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
    changeStaffPassword: builder.mutation({
      query: ({ id, password }) => ({
        url: `/api/staff/${id}/password`,
        method: 'PUT',
        body: { password },
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffMemberQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useChangeStaffPasswordMutation,
} = staffApi;
