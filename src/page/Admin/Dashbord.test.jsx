import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "./Dashbord";
import { fetchAllTasks, fetchAllApprovedEngineers, fetchAllEngineers } from "../../redux/Slice/AdminSlice";

// --- Mock the fetch actions ---
jest.mock("../../redux/Slice/AdminSlice", () => ({
  fetchAllTasks: jest.fn(() => ({ type: "FETCH_ALL_TASKS" })),
  fetchAllApprovedEngineers: jest.fn(() => ({ type: "FETCH_ALL_APPROVED_ENGINEERS" })),
  fetchAllEngineers: jest.fn(() => ({ type: "FETCH_ALL_ENGINEERS" })),
}));

// --- Mock Dashbord so it renders its props as JSON for testing ---
jest.mock("./../../compoents/Dashbord", () => {
  return function MockDashbord(props) {
    return <div data-testid="dashboard">{JSON.stringify(props)}</div>;
  };
});

// --- Mock react-redux hooks ---
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// --- Helper to extract props passed to Dashbord ---
const getDashboardProps = () => {
  const dashboard = screen.getByTestId("dashboard");
  return JSON.parse(dashboard.textContent);
};

describe("AdminDashboard Component", () => {
  let mockDispatch;
  const { useDispatch, useSelector } = require("react-redux");

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("dispatches fetch actions on mount", () => {
    // Provide an initial state
    useSelector.mockImplementation((callback) =>
      callback({
        admin: { tasks: [], loading: false, error: null, approvedEngineers: [], engineers: [] },
      })
    );

    render(<AdminDashboard />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchAllTasks());
    expect(mockDispatch).toHaveBeenCalledWith(fetchAllApprovedEngineers());
    expect(mockDispatch).toHaveBeenCalledWith(fetchAllEngineers());
  });

  test("renders Dashbord with correct props when loading is true", () => {
    useSelector.mockImplementation((callback) =>
      callback({
        admin: { tasks: [], loading: true, error: null, approvedEngineers: ["eng1"], engineers: ["eng2"] },
      })
    );

    render(<AdminDashboard />);
    const props = getDashboardProps();

    // When loading is true, counts remain at their initial zero values
    expect(props.loading).toBe(true);
    expect(props.ticketStatusData.datasets[0].data).toEqual([0, 0, 0, 0, 0]); // [open, in-progress, completed, failed, deferred]
    expect(props.taskPriorityData.datasets[0].data).toEqual([0, 0, 0]); // [low, medium, high]
    expect(props.data.openTickets).toEqual([]);
    expect(props.data.resolvedTickets).toEqual([]);
    expect(props.data.approvedEngineers).toEqual(["eng1"]);
    expect(props.data.allEngineers).toEqual(["eng2"]);
  });

  test("computes counts correctly with tasks and no filters", () => {
    const tasks = [
      { serviceType: "Cleaning", status: "open", priority: "low" },
      { serviceType: "Repair", status: "completed", priority: "high" },
      { serviceType: "Maintenance", status: "in-progress", priority: "medium" },
      { serviceType: "Repair", status: "failed", priority: "high" },
      { serviceType: "Inspection", status: "deferred", priority: "medium" },
    ];
    const approvedEngineers = ["eng1", "eng2"];
    const engineers = ["eng1", "eng2", "eng3"];
    useSelector.mockImplementation((callback) =>
      callback({
        admin: { tasks, loading: false, error: null, approvedEngineers, engineers },
      })
    );

    render(<AdminDashboard />);
    const props = getDashboardProps();

    // With no filters provided, filteredTasks equals all tasks.
    // Ticket status counts: each status appears once.
    expect(props.ticketStatusData.labels).toEqual(["open", "in-progress", "completed", "failed", "deferred"]);
    expect(props.ticketStatusData.datasets[0].data).toEqual([1, 1, 1, 1, 1]);

    // Task priority counts: low: 1, medium: 2, high: 2.
    expect(props.taskPriorityData.labels).toEqual(["low", "medium", "high"]);
    expect(props.taskPriorityData.datasets[0].data).toEqual([1, 2, 2]);

    // adminData (not filtered)
    expect(props.data.openTickets).toEqual(tasks.filter((task) => task.status === "open"));
    expect(props.data.resolvedTickets).toEqual(tasks.filter((task) => task.status === "completed"));
    expect(props.data.approvedEngineers).toEqual(approvedEngineers);
    expect(props.data.allEngineers).toEqual(engineers);
  });

  test("applies filters correctly", () => {
    const tasks = [
      { serviceType: "Cleaning", status: "open", priority: "low" },
      { serviceType: "Repair", status: "completed", priority: "high" },
      { serviceType: "Maintenance", status: "in-progress", priority: "medium" },
      { serviceType: "Repair", status: "failed", priority: "high" },
      { serviceType: "Inspection", status: "deferred", priority: "medium" },
    ];
    // Using filters: debouncedSearchTerm = "repair", statusFilter = "completed", priorityFilter = "high"
    // Only one task should match: { serviceType: "Repair", status: "completed", priority: "high" }
    useSelector.mockImplementation((callback) =>
      callback({
        admin: { tasks, loading: false, error: null, approvedEngineers: [], engineers: [] },
      })
    );

    render(<AdminDashboard debouncedSearchTerm="repair" statusFilter="completed" priorityFilter="high" />);
    const props = getDashboardProps();

    // For the one matching task, ticket status "completed" count should be 1; others remain 0.
    expect(props.ticketStatusData.datasets[0].data).toEqual([0, 0, 1, 0, 0]);
    // For task priority, the matching task has "high" priority.
    expect(props.taskPriorityData.datasets[0].data).toEqual([0, 0, 1]);

    // Note: adminData (openTickets/resolvedTickets) is computed from all tasks, not filtered ones.
    expect(props.data.openTickets).toEqual(tasks.filter((task) => task.status === "open"));
    expect(props.data.resolvedTickets).toEqual(tasks.filter((task) => task.status === "completed"));
  });
});