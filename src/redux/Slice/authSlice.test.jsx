import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setUser, logout } from "./authSlice";

describe("Auth Slice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  test("setUser should update state with user data", () => {
    const userData = { user: { email: "test@example.com", role: "admin" }, token: "token123" };
    store.dispatch(setUser(userData));
    expect(store.getState().auth.user).toEqual(userData.user);
    expect(store.getState().auth.token).toEqual(userData.token);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  test("logout should clear user data and token", () => {
    store.dispatch(logout());
    expect(store.getState().auth.user).toEqual({ email: null, role: null });
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});