import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutUser } from "@/utils/logout";
import { User } from "@/interface/user";
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  role: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; role: string }>
    ) => {
      const { token, role } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.role = role;

      localStorage.setItem("jwt_token", token);
      localStorage.setItem("role", role);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      localStorage.clear();
      localStorage.clear();
      logoutUser();
    },
    loadAuthFromCookies: (state) => {
      const token = localStorage.getItem("jwt_token");
      const role = localStorage.getItem("role");

      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        state.role = role || null;
      } else {
        state.isAuthenticated = false;
        state.token = null;
        state.role = null;
      }
    },
    getUserDetails: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { loginSuccess, logout, loadAuthFromCookies, getUserDetails } =
  authSlice.actions;
export default authSlice.reducer;
