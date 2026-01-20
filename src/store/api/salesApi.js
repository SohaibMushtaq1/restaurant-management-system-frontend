import { apiSlice } from './apiSlice';

export const salesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query({
      query: (params) => ({
        url: '/api/sales',
        params,
      }),
      providesTags: ['Sales'],
    }),
    getSalesSummary: builder.query({
      query: (params) => ({
        url: '/api/sales/summary',
        params,
      }),
      providesTags: ['Sales'],
    }),
    createDailySales: builder.mutation({
      query: (data) => ({
        url: '/api/sales/daily',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Sales'],
    }),
  }),
});

export const {
  useGetSalesQuery,
  useGetSalesSummaryQuery,
  useCreateDailySalesMutation,
} = salesApi;
