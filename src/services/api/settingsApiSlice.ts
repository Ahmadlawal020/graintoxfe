import { apiSlice } from "./apiSlice";

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/api/settings",
      providesTags: ["Settings"],
    }),
    createSettings: builder.mutation({
      query: (data) => ({
        url: "/api/settings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: "/api/settings",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Settings"],
    }),
    deleteSettings: builder.mutation({
      query: () => ({
        url: "/api/settings",
        method: "DELETE",
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSettingsQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useDeleteSettingsMutation,
} = settingsApiSlice;
