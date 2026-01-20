import { apiSlice } from './apiSlice';

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: (params) => ({
        url: '/api/inventory',
        params,
      }),
      providesTags: ['Inventory'],
    }),
    getInventoryItem: builder.query({
      query: (id) => `/api/inventory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),
    getLowStockAlerts: builder.query({
      query: () => '/api/inventory/alerts/low-stock',
      providesTags: ['Inventory'],
    }),
    createInventoryItem: builder.mutation({
      query: (data) => ({
        url: '/api/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory'],
    }),
    updateInventoryItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Inventory', id }],
    }),
    deleteInventoryItem: builder.mutation({
      query: (id) => ({
        url: `/api/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetInventoryItemQuery,
  useGetLowStockAlertsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
} = inventoryApi;
