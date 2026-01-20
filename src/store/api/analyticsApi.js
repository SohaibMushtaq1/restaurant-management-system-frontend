import { apiSlice } from './apiSlice';

export const analyticsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => '/api/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    getRevenueChart: builder.query({
      query: (params) => ({
        url: '/api/analytics/revenue-chart',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetRevenueChartQuery,
} = analyticsApi;
