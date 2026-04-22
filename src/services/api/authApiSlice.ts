import { apiSlice } from "@/services/api/apiSlice";
import { logout, setCredentials } from "../authSlice";

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

interface AuthResponse {
  id: string;
  roles: string[];
  accessToken: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, id, roles } = data;

          const user = {
            id,
            email: arg.email,
            roles,
          };

          dispatch(setCredentials({ accessToken, user }));
        } catch (err) {
          console.error("Login error:", err);
        }
      },
    }),

    logoutUser: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled();
          dispatch(logout());
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (err) {
          console.error("Logout error:", err);
        }
      },
    }),

    refreshToken: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "/api/auth/refresh",
        method: "GET",
        credentials: "include", // Important for cookies
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, id, roles } = data;

          const user = {
            id,
            email: "", // Email is not returned in refresh, so you may want to decode or store persistently
            roles,
          };

          dispatch(setCredentials({ accessToken, user }));
        } catch (err) {
          console.error("Refresh token error:", err);
        }
      },
    }),

    checkEmail: builder.mutation<{ registered: boolean }, { email: string }>({
      query: (body) => ({
        url: "/api/auth/check-email",
        method: "POST",
        body,
      }),
    }),

    registerUser: builder.mutation<{ message: string }, any>({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    verifyOTP: builder.mutation<AuthResponse, { email: string; code: string }>({
      query: (body) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, id, roles } = data;

          const user = {
            id,
            email: arg.email,
            roles,
          };

          dispatch(setCredentials({ accessToken, user }));
        } catch (err) {
          console.error("OTP verification error:", err);
        }
      },
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useCheckEmailMutation,
  useRegisterUserMutation,
  useVerifyOTPMutation,
} = authApiSlice;
