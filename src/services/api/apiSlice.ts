import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../authSlice";

interface Credentials {
  accessToken?: string;
  refreshToken?: string;
  // Add other credential properties if they exist
}

interface ErrorData {
  message?: string;
  // Add other error properties if they exist
}

interface CustomError {
  status?: number;
  data?: ErrorData | string;
}

interface CustomQueryResult {
  data?: unknown;
  error?: CustomError;
  meta?: FetchBaseQueryMeta;
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string } }).auth
      .accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
}) as BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  FetchBaseQueryMeta
>;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Perform the initial API request
  let result = await baseQuery(args, api, extraOptions);

  // ✅ [FIX] Only attempt token refresh if user had a token (i.e., logged in)
  const token = (api.getState() as { auth: { accessToken?: string } }).auth
    .accessToken;

  if (
    (result?.error?.status === 401 || result?.error?.status === 403) &&
    token
  ) {
    // 🛠️ Token might be expired — try refreshing it
    const refreshResult = (await baseQuery(
      "/api/auth/refresh",
      api,
      extraOptions,
    )) as CustomQueryResult;

    if (refreshResult?.data) {
      // ✅ Refresh succeeded — update credentials in store
      api.dispatch(setCredentials(refreshResult.data as Credentials));

      // 🔁 Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // ❌ Refresh failed — log user out and override only if needed
      api.dispatch(logout());

      if (
        refreshResult?.error?.status === 401 ||
        refreshResult?.error?.status === 403
      ) {
        // ✅ [FIX] Only override message on failed refresh — not on login
        refreshResult.error.data = {
          message: "Your login has expired. Please log in again.",
        };
      }

      // Return the failed refresh attempt as the final result
      return refreshResult as { error: FetchBaseQueryError };
    }
  }

  // 💬 Normalize plain string errors into { message } object for consistency
  if (result.error && typeof result.error.data === "string") {
    result.error.data = { message: result.error.data };
  }

  // ✅ Return the final result (whether successful or failed)
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Transactions", "User", "Trades", "PriceHistory"],
  endpoints: () => ({}),
});
