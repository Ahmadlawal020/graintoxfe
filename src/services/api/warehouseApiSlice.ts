import { apiSlice } from './apiSlice';

export const warehouseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouses: builder.query({
      query: () => "/api/warehouses",
      providesTags: ["Warehouse"],
    }),
    getWarehouseById: builder.query({
      query: (id) => `/api/warehouses/${id}`,
      providesTags: ["Warehouse"],
    }),
    getMyWarehouse: builder.query({
      query: () => "/api/warehouses/my",
      providesTags: ["Warehouse"],
    }),
    createWarehouse: builder.mutation({
      query: (warehouseData) => ({
        url: "/api/warehouses",
        method: "POST",
        body: warehouseData,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    updateWarehouse: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/api/warehouses/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Warehouse"],
    }),
    deleteWarehouse: builder.mutation({
      query: (id) => ({
        url: `/api/warehouses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useGetMyWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehouseApiSlice;
