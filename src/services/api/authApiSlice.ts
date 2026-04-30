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
          const { accessToken, id, roles, email, firstName, lastName } = data as any;

          const user = {
            id,
            email: email || arg.email,
            roles,
            firstName,
            lastName
          };

          dispatch(setCredentials({ accessToken, user, activeRole: roles[0] }));
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
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { accessToken, id, roles, email, firstName, lastName } = data as any;

          const currentAuth = (getState() as any).auth;

          dispatch(setCredentials({ 
            accessToken, 
            user: { id, email, roles, firstName, lastName },
            activeRole: currentAuth?.activeRole
          }));
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
          const { accessToken, id, roles, email, firstName, lastName } = data as any;

          const user = {
            id,
            email: email || arg.email,
            roles,
            firstName,
            lastName
          };

          dispatch(setCredentials({ accessToken, user, activeRole: roles[0] }));
        } catch (err) {
          console.error("OTP verification error:", err);
        }
      },
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, any>({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
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
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApiSlice;
