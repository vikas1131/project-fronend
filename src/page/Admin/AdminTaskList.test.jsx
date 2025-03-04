import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminTaskList from "./AdminTaskList";
import { fetchAllTasks } from "../../redux/Slice/AdminSlice";

// --- Mock the fetchAllTasks action creator ---
jest.mock("../../redux/Slice/AdminSlice", () => ({
  fetchAllTasks: jest.fn(() => ({ type: "FETCH_ALL_TASKS" })),
}));

// --- Mock child component: AdminTaskCard ---
jest.mock("./AdminTaskCard", () => {
  return function MockAdminTaskCard({ task }) {
    return <div data-testid="admin-task-card">{task.serviceType}</div>;
  };
});

// --- Mock Loading component ---
jest.mock("../../compoents/Loadingpage", () => {
  return function MockLoading() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// --- Mock react-redux hooks ---
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// --- Mock Search icon from lucide-react ---
jest.mock("lucide-react", () => ({
  Search: (props) => <svg data-testid="search-icon" {...props} />,
}));

// --- Helper: render with MemoryRouter ---
const renderWithProviders = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("AdminTaskList Component", () => {
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
  });

  test("dispatches fetchAllTasks on mount", () => {
    // Setup selector to return some tasks (non-loading, non-error)
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks: [{ _id: "1", serviceType: "Test", status: "open", priority: "low" }], loading: false, error: null } })
    );

    renderWithProviders(<AdminTaskList />);
    expect(mockDispatch).toHaveBeenCalledWith(fetchAllTasks());
  });

  test("renders loading state correctly", () => {
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks: [], loading: true, error: null } })
    );
    renderWithProviders(<AdminTaskList />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("renders error state correctly", () => {
    const error = "Failed to fetch tasks";
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks: [], loading: false, error } })
    );
    renderWithProviders(<AdminTaskList />);
    expect(screen.getByText(`Error: ${error}`)).toBeInTheDocument();
  });

  test("renders no tasks available when tasks array is empty", () => {
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks: [], loading: false, error: null } })
    );
    renderWithProviders(<AdminTaskList />);
    expect(screen.getByText("No tasks available.")).toBeInTheDocument();
  });

  test("renders tasks and filters based on debounced search input", async () => {
    const tasks = [
      { _id: "1", serviceType: "Cleaning", status: "open", priority: "low" },
      { _id: "2", serviceType: "Repair", status: "completed", priority: "high" },
      { _id: "3", serviceType: "Maintenance", status: "in progress", priority: "medium" },
    ];
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks, loading: false, error: null } })
    );

    renderWithProviders(<AdminTaskList />);

    // Initially all tasks are displayed (debounced search term is empty)
    expect(screen.getAllByTestId("admin-task-card")).toHaveLength(3);

    // Type into the search input (e.g., "repair")
    const searchInput = screen.getByPlaceholderText("Search tasks by ...");
    fireEvent.change(searchInput, { target: { value: "repair" } });

    // Advance timers to trigger debounce (500ms)
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Now only tasks matching "repair" (case-insensitive) should render
    const filteredCards = screen.getAllByTestId("admin-task-card");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0]).toHaveTextContent("Repair");
  });

  test("filters tasks based on status filter", async () => {
    const tasks = [
      { _id: "1", serviceType: "Cleaning", status: "open", priority: "low" },
      { _id: "2", serviceType: "Repair", status: "completed", priority: "high" },
      { _id: "3", serviceType: "Maintenance", status: "in progress", priority: "medium" },
    ];
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks, loading: false, error: null } })
    );

    renderWithProviders(<AdminTaskList />);
    // Initially all tasks are rendered
    expect(screen.getAllByTestId("admin-task-card")).toHaveLength(3);

    // The component renders two dropdowns; the first one is for status filter.
    const dropdowns = screen.getAllByRole("combobox");
    const statusSelect = dropdowns[0];
    fireEvent.change(statusSelect, { target: { value: "open" } });

    // Only tasks with status "open" should be rendered
    const filteredCards = screen.getAllByTestId("admin-task-card");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0]).toHaveTextContent("Cleaning");
  });

  test("filters tasks based on priority filter", async () => {
    const tasks = [
      { _id: "1", serviceType: "Cleaning", status: "open", priority: "low" },
      { _id: "2", serviceType: "Repair", status: "completed", priority: "high" },
      { _id: "3", serviceType: "Maintenance", status: "in progress", priority: "medium" },
    ];
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks, loading: false, error: null } })
    );

    renderWithProviders(<AdminTaskList />);
    // Initially all tasks rendered.
    expect(screen.getAllByTestId("admin-task-card")).toHaveLength(3);

    // The second dropdown is for priority filter.
    const dropdowns = screen.getAllByRole("combobox");
    const prioritySelect = dropdowns[1];
    fireEvent.change(prioritySelect, { target: { value: "medium" } });

    // Should display only tasks with priority "medium"
    const filteredCards = screen.getAllByTestId("admin-task-card");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0]).toHaveTextContent("Maintenance");
  });

  test("filters tasks based on combined search, status, and priority filters", async () => {
    const tasks = [
      { _id: "1", serviceType: "Cleaning", status: "open", priority: "low" },
      { _id: "2", serviceType: "Repair", status: "completed", priority: "high" },
      { _id: "3", serviceType: "Repair", status: "open", priority: "high" },
      { _id: "4", serviceType: "Maintenance", status: "in progress", priority: "medium" },
    ];
    useSelector.mockImplementation((callback) =>
      callback({ admin: { tasks, loading: false, error: null } })
    );

    renderWithProviders(<AdminTaskList />);

    // Type "repair" in the search input
    const searchInput = screen.getByPlaceholderText("Search tasks by ...");
    fireEvent.change(searchInput, { target: { value: "repair" } });

    // Advance timers for debounce
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Apply status filter: "open"
    const dropdowns = screen.getAllByRole("combobox");
    const statusSelect = dropdowns[0];
    fireEvent.change(statusSelect, { target: { value: "open" } });

    // Apply priority filter: "high"
    const prioritySelect = dropdowns[1];
    fireEvent.change(prioritySelect, { target: { value: "high" } });

    // Only one task should match: a "Repair" task that is "open" with "high" priority
    const filteredCards = screen.getAllByTestId("admin-task-card");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0]).toHaveTextContent("Repair");
  });
});