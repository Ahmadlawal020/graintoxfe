import { apiSlice } from './apiSlice';

export const cropApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCrops: builder.query({
      query: () => "/api/crops",
      providesTags: ["Crop"],
    }),
    getCropById: builder.query({
      query: (id) => `/api/crops/${id}`,
      providesTags: ["Crop"],
    }),
    getCropHistory: builder.query({
      query: (id) => `/api/crops/${id}/history`,
      providesTags: ["PriceHistory"],
    }),
    createCrop: builder.mutation({
      query: (cropData) => ({
        url: "/api/crops",
        method: "POST",
        body: cropData,
      }),
      invalidatesTags: ["Crop"],
    }),
    updateCrop: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `/api/crops/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Crop"],
    }),
    deleteCrop: builder.mutation({
      query: (id) => ({
        url: `/api/crops/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Crop"],
    }),
  }),
});

export const {
  useGetCropsQuery,
  useGetCropByIdQuery,
  useGetCropHistoryQuery,
  useCreateCropMutation,
  useUpdateCropMutation,
  useDeleteCropMutation,
} = cropApiSlice;
