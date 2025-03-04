import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";  // ✅ Import redux-thunk
import { fetchTickets } from "../../redux/Slice/UserSlice";
import UserTicketList from "./UserTickets";
import { createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Mock Redux Store with Thunk Middleware
const mockStore = configureStore([thunk]);

// ✅ Mock fetchTickets as an async thunk
jest.mock("../../redux/Slice/UserSlice", () => ({
  ...jest.requireActual("../../redux/Slice/UserSlice"),
  fetchTickets: createAsyncThunk("tickets/fetchTickets", async () => {
    return [{ _id: "1", title: "Mock Task", status: "completed" }];
  }),
}));

describe("UserTicketList Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { user: { email: "test@example.com", role: "user" } },
      tickets: { tasks: [], loading: false, error: null },
    });

    store.dispatch = jest.fn(); // ✅ Mock the dispatch function

    // ✅ Mock sessionStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "email") return "test@example.com";
      if (key === "role") return "user";
      return null;
    });
  });

  test("renders loading state initially", async () => {
    store = mockStore({
      auth: { user: { email: "test@example.com", role: "user" } },
      tickets: { tasks: [], loading: true, error: null },
    });

    render(
      <Provider store={store}>
        <UserTicketList />
      </Provider>
    );

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  test("renders error message if error occurs", () => {
    store = mockStore({
      auth: { user: { email: "test@example.com", role: "user" } },
      tickets: { tasks: [], loading: false, error: "Something went wrong" },
    });

    render(
      <Provider store={store}>
        <UserTicketList />
      </Provider>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("renders tasks when available", () => {
    store = mockStore({
      auth: { user: { email: "test@example.com", role: "user" } },
      tickets: {
        tasks: [
          { _id: "1", title: "Task 1", status: "completed" },
          { _id: "2", title: "Task 2", status: "in-progress" },
        ],
        loading: false,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <UserTicketList />
      </Provider>
    );

    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
  });

  test("dispatches fetchTickets on mount if email exists", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <UserTicketList />
        </Provider>
      );
    });

    expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function)); // ✅ Corrected to check for async thunk function
  });
});
