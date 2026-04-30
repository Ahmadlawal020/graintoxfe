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

import { Mutex } from "async-mutex";

const mutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  const token = (api.getState() as { auth: { accessToken?: string } }).auth.accessToken;

  if (
    (result?.error?.status === 401 || result?.error?.status === 403) &&
    token
  ) {
    // Check whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = (await baseQuery(
          "/api/auth/refresh",
          api,
          extraOptions
        )) as CustomQueryResult;

        if (refreshResult?.data) {
          const data = refreshResult.data as any;
          const currentAuth = (api.getState() as any).auth;
          
          api.dispatch(setCredentials({ 
            accessToken: data.accessToken, 
            user: {
              id: data.id,
              email: data.email,
              roles: data.roles,
              firstName: data.firstName,
              lastName: data.lastName
            },
            activeRole: currentAuth.activeRole
          }));
          // Retry the original query
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
          if (refreshResult?.error?.status === 401 || refreshResult?.error?.status === 403) {
            refreshResult.error.data = {
              message: "Your login has expired. Please log in again.",
            };
          }
          return refreshResult as { error: FetchBaseQueryError };
        }
      } finally {
        release();
      }
    } else {
      // Wait until the mutex is available once more
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  if (result.error && typeof result.error.data === "string") {
    result.error.data = { message: result.error.data };
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Transactions", "User", "Trades", "PriceHistory", "Dashboard", "Crop"],
  endpoints: () => ({}),
});
