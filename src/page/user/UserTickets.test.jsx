import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ticketsReducer, { fetchTickets } from "../../redux/Slice/UserSlice";
import UserTicketList from "./UserTickets";
// import { setupServer } from "msw/node";
import { rest } from "msw";

// ✅ Mock API Response using Mock Service Worker (MSW)
const server = setupServer(
  rest.get("/api/tickets", (req, res, ctx) => {
    return res(ctx.json([{ _id: "1", title: "Mock Task", status: "completed" }]));
  })
);

// ✅ Start and close the server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UserTicketList Component", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { tickets: ticketsReducer },
      preloadedState: {
        auth: { user: { email: "test@example.com", role: "user" } },
        tickets: { tasks: [], loading: false, error: null },
      },
    });

    // ✅ Mock `fetchTickets`
    jest.spyOn(store, "dispatch");
  });

  test("renders loading state initially", async () => {
    render(
      <Provider store={store}>
        <UserTicketList />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders error message if error occurs", async () => {
    store = configureStore({
      reducer: { tickets: ticketsReducer },
      preloadedState: {
        tickets: { tasks: [], loading: false, error: "Something went wrong" },
      },
    });

    render(
      <Provider store={store}>
        <UserTicketList />
      </Provider>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  test("renders tasks when available", async () => {
    store = configureStore({
      reducer: { tickets: ticketsReducer },
      preloadedState: {
        tickets: {
          tasks: [
            { _id: "1", title: "Task 1", status: "completed" },
            { _id: "2", title: "Task 2", status: "in-progress" },
          ],
        },
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

    expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function)); // ✅ Corrected
  });
});
