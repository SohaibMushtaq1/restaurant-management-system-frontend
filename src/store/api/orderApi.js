import { apiSlice } from './apiSlice';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => ({
        url: '/api/orders',
        params,
      }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id) => `/api/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/api/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order', 'Analytics', 'Sales'],
    }),
    updateOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Analytics',
        'Sales',
      ],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/api/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order', 'Analytics', 'Sales'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
