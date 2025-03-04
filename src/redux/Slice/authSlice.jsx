import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  user: {
    email: sessionStorage.getItem("email") || null,
    role: sessionStorage.getItem("role") || null,
  },
  token: sessionStorage.getItem("token") || null,
  isAuthenticated: !!sessionStorage.getItem("token"),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      sessionStorage.setItem("token", action.payload.token);
      sessionStorage.setItem("email", action.payload.user.email);
      sessionStorage.setItem("role", action.payload.user.role);
    },
    logout: (state) => {
      state.user = { email: null, role: null };
      state.token = null;
      state.isAuthenticated = false;

      sessionStorage.clear()
    }
  }
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
