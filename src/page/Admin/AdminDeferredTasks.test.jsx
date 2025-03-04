import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import AdminDeferredTasks from "./AdminDeferredTasks";
 
// Mock child components
jest.mock("./NavBar", () => {
  return function MockNavBar() {
    return <div data-testid="admin-navbar">Mock NavBar</div>;
  };
});
 
jest.mock("./AdminTaskCard", () => {
  return function MockTaskCard({ task }) {
    return <div data-testid="admin-task-card">{task.title}</div>;
  };
});
 
jest.mock("../../compoents/Loadingpage", () => {
  return function MockLoading() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});
 
// Mock Redux dispatch
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));
 
describe("AdminDeferredTasks Component", () => {
  // Helper function to create a mock store
  const createMockStore = (initialState) => {
    return createStore(() => initialState);
  };
 
  // Helper function to render with providers
  const renderWithProviders = (component, store) => {
    return render(
      <MemoryRouter>
        <Provider store={store}>{component}</Provider>
      </MemoryRouter>
    );
  };
 
  test("renders loading state correctly", () => {
    const store = createMockStore({
      admin: {
        tasks: [], // Updated key to `tasks`
        loading: true,
        error: null,
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
 
  test("renders error state correctly", () => {
    const store = createMockStore({
      admin: {
        tasks: [], // Updated key to `tasks`
        loading: false,
        error: "Failed to fetch tasks",
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
    expect(screen.getByText("Error: Failed to fetch tasks")).toBeInTheDocument();
  });
 
  test("renders empty state when no deferred tasks", () => {
    const store = createMockStore({
      admin: {
        tasks: [], // Updated key to `tasks`
        loading: false,
        error: null,
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
    expect(screen.getByText("No pending tasks found")).toBeInTheDocument(); // Updated to match actual UI message
  });
 
  test("renders deferred, unassigned, and failed tasks correctly", () => {
    const store = createMockStore({
      admin: {
        tasks: [
          { _id: "1", title: "Task 1", status: "deferred", engineerEmail: "eng1@example.com" },
          { _id: "2", title: "Task 2", status: "failed", engineerEmail: "eng2@example.com" },
          { _id: "3", title: "Task 3", status: "open", engineerEmail: null }, // Unassigned task
          { _id: "4", title: "Task 4", status: "completed", engineerEmail: "eng3@example.com" }, // Should be excluded
        ],
        loading: false,
        error: null,
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
 
    // Should render only deferred, failed, or unassigned tasks (3 out of 4 in our mock data)
    const taskCards = screen.getAllByTestId("admin-task-card");
    expect(taskCards).toHaveLength(3);
 
    // Verify displayed task titles
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
 
  test("does not show tasks that are not deferred, unassigned, or failed", () => {
    const store = createMockStore({
      admin: {
        tasks: [
          { _id: "1", title: "Task 1", status: "completed", engineerEmail: "eng@example.com" },
        ],
        loading: false,
        error: null,
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
 
    expect(screen.getByText("No pending tasks found")).toBeInTheDocument();
  });
 
  test("dispatches fetchAllTasks on mount", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(require("react-redux"), "useDispatch").mockReturnValue(mockDispatch);
 
    const store = createMockStore({
      admin: {
        tasks: [], // Updated key to `tasks`
        loading: false,
        error: null,
      },
    });
 
    renderWithProviders(<AdminDeferredTasks />, store);
    expect(mockDispatch).toHaveBeenCalled();
  });
});