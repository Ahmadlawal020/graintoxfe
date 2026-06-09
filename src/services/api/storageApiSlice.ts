import { apiSlice } from './apiSlice';

export const storageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStorageOperations: builder.query({
      query: () => "/api/storage",
      providesTags: ["Storage"],
    }),
    getStorageBalances: builder.query({
      query: () => "/api/storage/balances",
      providesTags: ["Storage", "User"],
    }),
    transferTradingCrops: builder.mutation({
      query: (data) => ({
        url: "/api/storage/trading-transfer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Storage", "User", "Trades"],
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
  useGetStorageBalancesQuery,
  useTransferTradingCropsMutation,
  useCreateStorageOperationMutation,
  useUpdateStorageOperationMutation,
} = storageApiSlice;
