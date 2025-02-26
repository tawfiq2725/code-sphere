import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
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
      console.log(action.payload);
      state.isAuthenticated = true;
      state.token = token;
      state.role = role;
      console.log(token);
      console.log(role);
      sessionStorage.setItem("jwt_token", token);
      sessionStorage.setItem("role", role);
      console.log(state.isAuthenticated, state.token, state.role);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      sessionStorage.clear();
      localStorage.clear();
      logoutUser();
    },
    loadAuthFromCookies: (state) => {
      const token = sessionStorage.getItem("jwt_token");
      const role = sessionStorage.getItem("role");
      console.log("Token from cookies:", token);
      console.log("Role from cookies:", role);

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
      console.log("User details:", state.user);
    },
  },
});

export const { loginSuccess, logout, loadAuthFromCookies, getUserDetails } =
  authSlice.actions;
export default authSlice.reducer;
