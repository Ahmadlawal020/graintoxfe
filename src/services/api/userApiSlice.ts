import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET all users
    getUsers: builder.query({
      query: () => "/api/users",
      providesTags: ["User"],
    }),

    // GET all warehouse managers
    getManagers: builder.query({
      query: () => "/api/users/managers",
      providesTags: ["User"],
    }),

    // GET all platform users (joined)
    getPlatformUsers: builder.query({
      query: () => "/api/users/platform",
      providesTags: ["User"],
    }),

    // GET all KYC submissions
    getKycSubmissions: builder.query({
      query: () => "/api/users/kyc",
      providesTags: ["User"],
    }),

    // GET departments
    getDepartments: builder.query({
      query: () => "/api/users/departments",
      providesTags: ["User"],
    }),

    // GET user by ID
    getUserById: builder.query({
      query: (id: string) => `/api/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // CREATE user
    createUser: builder.mutation({
      query: (data) => ({
        url: "/api/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // UPDATE user
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/api/users",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // DELETE user
    deleteUser: builder.mutation({
      query: (data) => ({
        url: "/api/users",
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // UPDATE KYC status
    updateKycStatus: builder.mutation({
      query: ({ id, kycStatus }: { id: string; kycStatus: string }) => ({
        url: `/api/users/kyc/${id}`,
        method: "PATCH",
        body: { kycStatus },
      }),
      invalidatesTags: ["User"],
    }),

    // SUBMIT KYC
    submitKyc: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/api/users/kyc/submit/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetKycSubmissionsQuery,
  useGetManagersQuery,
  useGetPlatformUsersQuery,
  useGetDepartmentsQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateKycStatusMutation,
  useSubmitKycMutation,
} = userApiSlice;
