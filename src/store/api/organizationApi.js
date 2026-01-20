import { apiSlice } from './apiSlice';

export const organizationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query({
      query: () => '/api/organizations',
      providesTags: ['Organization'],
    }),
    getOrganization: builder.query({
      query: (id) => `/api/organizations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),
    getNextSerial: builder.query({
      query: () => '/api/organizations/next-serial',
    }),
    createOrganization: builder.mutation({
      query: (data) => ({
        url: '/api/organizations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/organizations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Organization', id }],
    }),
    switchOrganization: builder.mutation({
      query: (orgId) => ({
        url: '/api/organizations/switch',
        method: 'POST',
        body: { organizationId: orgId },
      }),
      invalidatesTags: ['User', 'Organization', 'Menu', 'Inventory', 'Order', 'Staff', 'Salary', 'Sales', 'Analytics'],
    }),
    addStaffToOrganization: builder.mutation({
      query: ({ orgId, ...data }) => ({
        url: `/api/organizations/${orgId}/staff`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization', 'Staff', 'User'],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useGetNextSerialQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useSwitchOrganizationMutation,
  useAddStaffToOrganizationMutation,
} = organizationApi;
