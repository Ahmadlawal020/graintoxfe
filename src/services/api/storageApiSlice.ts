import { apiSlice } from './apiSlice';

export const storageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStorageOperations: builder.query({
      query: () => "/api/storage",
      providesTags: ["Storage"],
    }),
    createStorageOperation: builder.mutation({
      query: (opData) => ({
        url: "/api/storage",
        method: "POST",
        body: opData,
      }),
      invalidatesTags: ["Storage", "Warehouse"],
    }),
    updateStorageOperation: builder.mutation({
      query: (data) => ({
        url: `/api/storage/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Storage"],
    }),
  }),
});

export const {
  useGetStorageOperationsQuery,
  useCreateStorageOperationMutation,
  useUpdateStorageOperationMutation,
} = storageApiSlice;
