import React from "react";
import { render, waitFor } from "@testing-library/react";
import UserDashboard from "./Dashbord";
import { useDispatch, useSelector } from "react-redux";
import apiClientEngineer from "../../utils/apiClientEngineer";
import { fetchTickets } from "../../redux/Slice/UserSlice";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../redux/Slice/UserSlice", () => ({
  fetchTickets: {
    fulfilled: (tasks) => ({ type: "tickets/fetchTickets/fulfilled", payload: tasks }),
    rejected: (error) => ({ type: "tickets/fetchTickets/rejected", payload: error }),
  },
}));

jest.mock("./../../compoents/Dashbord", () => (props) => {
  return <div data-testid="dashboard">{JSON.stringify(props)}</div>;
});

describe("UserDashboard", () => {
  const sampleTasks = [
    { id: "1", serviceType: "Repair", status: "open", priority: "low" },
    { id: "2", serviceType: "Installation", status: "completed", priority: "high" },
    { id: "3", serviceType: "Maintenance", status: "in-progress", priority: "medium" },
  ];

  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((cb) =>
      cb({ tickets: { tasks: sampleTasks, loading: false, error: null } })
    );
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(() => "test@example.com"),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches tasks on mount and dispatches fulfilled action on success", async () => {
    const apiResponse = { data: { tasks: sampleTasks } };
    const apiGetSpy = jest.spyOn(apiClientEngineer, "get").mockResolvedValue(apiResponse);

    const { findByTestId } = render(
      <UserDashboard debouncedSearchTerm="" statusFilter="" priorityFilter="" />
    );

    await waitFor(() => {
      expect(apiGetSpy).toHaveBeenCalledWith("/tasks/user/test@example.com");
    });

    expect(dispatchMock).toHaveBeenCalledWith(fetchTickets.fulfilled(sampleTasks));
    const dashEl = await findByTestId("dashboard");
    const dashProps = JSON.parse(dashEl.textContent);
    expect(dashProps.loading).toBe(false);
    expect(dashProps.error).toBeNull();
  });

  it("handles API error and dispatches rejected action", async () => {
    const errorResponse = { response: { data: "API error" } };
    const apiGetSpy = jest.spyOn(apiClientEngineer, "get").mockRejectedValue(errorResponse);

    render(<UserDashboard />);

    await waitFor(() => {
      expect(apiGetSpy).toHaveBeenCalledWith("/tasks/user/test@example.com");
    });

    expect(dispatchMock).toHaveBeenCalledWith(fetchTickets.rejected("API error"));
  });

  it("correctly computes ticketStatusCounts and taskPriorityCounts", async () => {
    const customTasks = [
      { id: "1", serviceType: "Test1", status: "open", priority: "low" },
      { id: "2", serviceType: "Test2", status: "Completed", priority: "High" },
      { id: "3", serviceType: "Test3", status: "unknown", priority: "Random" },
      { id: "4", serviceType: "Test4", status: "deferred", priority: "medium" },
    ];

    useSelector.mockImplementation((cb) =>
      cb({ tickets: { tasks: customTasks, loading: false, error: null } })
    );

    const { findByTestId } = render(
      <UserDashboard debouncedSearchTerm="" statusFilter="" priorityFilter="" />
    );

    const dashEl = await findByTestId("dashboard");
    const dashProps = JSON.parse(dashEl.textContent);
    expect(dashProps.ticketStatusData.datasets[0].data).toEqual([1, 0, 1, 0, 1]);
    expect(dashProps.taskPriorityData.datasets[0].data).toEqual([1, 1, 1]);
  });

  it("filters tasks correctly based on search and filters", async () => {
    const customTasks = [
      { id: "1", serviceType: "Repair", status: "open", priority: "low" },
      { id: "2", serviceType: "Installation", status: "completed", priority: "high" },
      { id: "3", serviceType: "Cleaning", status: "failed", priority: "medium" },
    ];
    useSelector.mockImplementation((cb) =>
      cb({ tickets: { tasks: customTasks, loading: false, error: null } })
    );

    const { findByTestId } = render(
      <UserDashboard debouncedSearchTerm="clean" statusFilter="failed" priorityFilter="medium" />
    );

    const dashboard = await findByTestId("dashboard");
    const props = JSON.parse(dashboard.textContent);
    expect(props.ticketStatusData.datasets[0].data).toEqual([0, 0, 0, 1, 0]);
    expect(props.taskPriorityData.datasets[0].data).toEqual([0, 1, 0]);
  });
});
