import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  role: null,
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
      Cookies.set("jwt_token", token, { expires: 7 });
      Cookies.set("role", role, { expires: 7 });
      console.log(state.isAuthenticated, state.token, state.role);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      Cookies.remove("jwt_token");
      Cookies.remove("role");
    },
    loadAuthFromCookies: (state) => {
      const token = Cookies.get("jwt_token");
      const role = Cookies.get("role");
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
        state.role = role || null;
      }
    },
  },
});

export const { loginSuccess, logout, loadAuthFromCookies } = authSlice.actions;
export default authSlice.reducer;
