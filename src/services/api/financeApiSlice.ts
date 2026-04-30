import { apiSlice } from "./apiSlice";

export const financeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializeDeposit: builder.mutation({
      query: (data) => ({
        url: "/api/finance/deposit/initialize",
        method: "POST",
        body: data,
      }),
    }),
    instantDeposit: builder.mutation({
      query: (data) => ({
        url: "/api/finance/deposit/instant",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions", "User"],
    }),
    executeTrade: builder.mutation({
      query: (data) => ({
        url: "/api/finance/trade",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions", "User", "Trades", "PriceHistory", "Crop"],
    }),
    verifyDeposit: builder.mutation({
      query: (reference) => ({
        url: `/api/finance/deposit/verify/${reference}`,
        method: "GET",
      }),
      invalidatesTags: ["Transactions", "User"],
    }),
    getUserTransactions: builder.query({
      query: () => "/api/finance/transactions",
      providesTags: ["Transactions"],
    }),
    getUserTrades: builder.query({
      query: () => "/api/finance/trades",
      providesTags: ["Trades"],
    }),
    getAllTransactions: builder.query({
      query: () => "/api/finance/admin/transactions",
      providesTags: ["Transactions"],
    }),
    getAllTrades: builder.query({
      query: () => "/api/finance/admin/trades",
      providesTags: ["Trades"],
    }),
    getFinancialSummary: builder.query({
      query: () => "/api/finance/admin/summary",
      providesTags: ["Transactions"],
    }),
    requestWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/api/finance/withdrawal/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions", "User"],
    }),
    processWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/api/finance/admin/withdrawal/process",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions", "User"],
    }),
  }),
});

export const {
  useInitializeDepositMutation,
  useInstantDepositMutation,
  useExecuteTradeMutation,
  useVerifyDepositMutation,
  useGetUserTransactionsQuery,
  useGetUserTradesQuery,
  useGetAllTransactionsQuery,
  useGetAllTradesQuery,
  useGetFinancialSummaryQuery,
  useRequestWithdrawalMutation,
  useProcessWithdrawalMutation,
} = financeApiSlice;
