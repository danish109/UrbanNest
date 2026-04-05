import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("nestmate_user")) || null,
  isAuthenticated: !!localStorage.getItem("nestmate_user"),
  role: JSON.parse(localStorage.getItem("nestmate_user"))?.role || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload?.role;
      localStorage.setItem("nestmate_user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("nestmate_user");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
