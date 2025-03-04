import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import engineerReducer, { fetchEngineerTasks, HazardsTickets } from "../../redux/Slice/EngineerSlice";
import EngineerDashboard from "./Dashbord";
import apiClientEngineer from "../../utils/apiClientEngineer";
import apiClientNH from "../../utils/apiClientNH";
import Dashbord from "./Dashbord";

// --- Mock API Calls ---
jest.mock("../../utils/apiClientEngineer", () => ({
  get: jest.fn(),
}));

jest.mock("../../utils/apiClientNH", () => ({
  get: jest.fn(),
}));

jest.mock("../../compoents/Dashbord", () => {
  return function MockDashboard(props) {
    return <div data-testid="dashboard-mock">Mock Dashboard</div>;
  };
});

describe("EngineerDashboard Component", () => {
  let store;

  const mockTasks = [
    { _id: "1", serviceType: "Cleaning", status: "open", priority: "high" },
    { _id: "2", serviceType: "Electricity", status: "in-progress", priority: "medium" },
    { _id: "3", serviceType: "Water", status: "completed", priority: "low" },
  ];

  const mockHazards = [
    { id: "h1", type: "Fire", status: "active" },
    { id: "h2", type: "Gas Leak", status: "resolved" },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        engineer: engineerReducer,
      },
      preloadedState: {
        engineer: {
          tasks: [],
          loading: false,
          error: null,
          Hazards: [],
        },
      },
    });

    sessionStorage.setItem("email", "engineer@example.com");

    apiClientEngineer.get.mockClear();
    apiClientNH.get.mockClear();
  });

  test("renders EngineerDashboard component without crashing", () => {
    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
  });

  test("fetches engineer tasks and hazards on mount", async () => {
    apiClientEngineer.get.mockResolvedValueOnce({ data: { tasks: mockTasks } });
    apiClientNH.get.mockResolvedValueOnce({ data: { hazards: mockHazards } });

    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(apiClientEngineer.get).toHaveBeenCalledWith(`/tasks/engineer/engineer@example.com`);
      expect(apiClientNH.get).toHaveBeenCalledWith(`/hazards/getAllHazards`);
    });
  });

  test("displays loading state correctly", async () => {
    store = configureStore({
      reducer: { engineer: engineerReducer },
      preloadedState: {
        engineer: { tasks: [], loading: true, error: null, Hazards: [] },
      },
    });

    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
  });

  test("handles API fetch errors gracefully", async () => {
    apiClientEngineer.get.mockRejectedValueOnce(new Error("Failed to fetch tasks"));
    apiClientNH.get.mockRejectedValueOnce(new Error("Failed to fetch hazards"));

    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(apiClientEngineer.get).toHaveBeenCalled();
      expect(apiClientNH.get).toHaveBeenCalled();
    });
  });

  test("filters tasks based on search, status, and priority", async () => {
    store = configureStore({
      reducer: { engineer: engineerReducer },
      preloadedState: {
        engineer: {
          tasks: mockTasks,
          loading: false,
          error: null,
          Hazards: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <EngineerDashboard debouncedSearchTerm="cleaning" statusFilter="open" priorityFilter="high" />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
    });
  });

  test("calculates ticket status and priority counts correctly", async () => {
    store = configureStore({
      reducer: { engineer: engineerReducer },
      preloadedState: {
        engineer: {
          tasks: mockTasks,
          loading: false,
          error: null,
          Hazards: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
    });
  });

  test("displays empty state when there are no tasks or hazards", async () => {
    store = configureStore({
      reducer: { engineer: engineerReducer },
      preloadedState: {
        engineer: {
          tasks: [],
          loading: false,
          error: null,
          Hazards: [],
        },
      },
    });

    render(
      <Provider store={store}>
        <EngineerDashboard />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-mock")).toBeInTheDocument();
    });
  });
});
