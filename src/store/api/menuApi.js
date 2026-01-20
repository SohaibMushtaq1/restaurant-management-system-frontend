import { apiSlice } from './apiSlice';

export const menuApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMenuItems: builder.query({
      query: (params) => ({
        url: '/api/menu',
        params,
      }),
      providesTags: ['Menu'],
    }),
    getMenuItem: builder.query({
      query: (id) => `/api/menu/${id}`,
      providesTags: (result, error, id) => [{ type: 'Menu', id }],
    }),
    createMenuItem: builder.mutation({
      query: (data) => ({
        url: '/api/menu',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Menu'],
    }),
    updateMenuItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/menu/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Menu', id }],
    }),
    deleteMenuItem: builder.mutation({
      query: (id) => ({
        url: `/api/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Menu'],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetMenuItemQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} = menuApi;
