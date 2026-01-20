import { apiSlice } from './apiSlice';

export const salaryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalaries: builder.query({
      query: (params) => ({
        url: '/api/salary',
        params,
      }),
      providesTags: ['Salary'],
    }),
    getSalary: builder.query({
      query: (id) => `/api/salary/${id}`,
      providesTags: (result, error, id) => [{ type: 'Salary', id }],
    }),
    createSalary: builder.mutation({
      query: (data) => ({
        url: '/api/salary',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Salary'],
    }),
    updateSalary: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/salary/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Salary', id }],
    }),
    deleteSalary: builder.mutation({
      query: (id) => ({
        url: `/api/salary/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Salary'],
    }),
  }),
});

export const {
  useGetSalariesQuery,
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
} = salaryApi;
