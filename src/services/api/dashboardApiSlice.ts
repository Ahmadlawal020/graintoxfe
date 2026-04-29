import { apiSlice } from "./apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => "/api/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetAdminStatsQuery } = dashboardApiSlice;
