// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface User {
//   id: string;
//   email: string;
//   roles: string[];
// }

// interface AuthState {
//   accessToken: string | null;
//   user: User | null;
// }

// const initialState: AuthState = {
//   accessToken: null,
//   user: null,
// };

// interface CredentialsPayload {
//   accessToken: string;
//   user: User;
// }

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
//       const { accessToken, user } = action.payload;
//       state.accessToken = accessToken;
//       state.user = user;
//       localStorage.setItem("auth", JSON.stringify({ accessToken, user }));
//     },
//     logout: (state) => {
//       state.accessToken = null;
//       state.user = null;
//       localStorage.removeItem("auth");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

// interface RootState {
//   auth: AuthState;
// }

// export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
// export const selectCurrentUser = (state: RootState) => state.auth.user;

// authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  activeRole: string | null;
}

const getInitialState = (): AuthState => {
  const storedAuth = typeof window !== 'undefined' ? localStorage.getItem("auth") : null;
  if (storedAuth) {
    try {
      return JSON.parse(storedAuth);
    } catch (e) {
      console.error("Failed to parse stored auth", e);
    }
  }
  return {
    accessToken: null,
    user: null,
    activeRole: null,
  };
};

const initialState: AuthState = getInitialState();


interface CredentialsPayload {
  accessToken: string;
  user: User;
  activeRole: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      const { accessToken, user, activeRole } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.activeRole = activeRole;
      localStorage.setItem(
        "auth",
        JSON.stringify({ accessToken, user, activeRole })
      );
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.activeRole = null;
      localStorage.removeItem("auth");
    },
    // Optional: for switching roles later
    setActiveRole: (state, action: PayloadAction<string>) => {
      state.activeRole = action.payload;
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          "auth",
          JSON.stringify({ ...parsed, activeRole: action.payload })
        );
      }
    },
  },
});

export const { setCredentials, logout, setActiveRole } = authSlice.actions;
export default authSlice.reducer;

// Selectors
interface RootState {
  auth: AuthState;
}

export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectActiveRole = (state: RootState) => state.auth.activeRole;
