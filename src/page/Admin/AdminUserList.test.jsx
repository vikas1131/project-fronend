import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import AdminUserList from "./AdminUserList";
import { debounce } from "lodash";

// Mock Redux dispatch
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => jest.fn(),
}));

// Mock debounce to avoid waiting for real delays in tests
jest.mock("lodash", () => ({
  ...jest.requireActual("lodash"),
  debounce: (fn) => fn,
}));

describe("AdminUserList Component", () => {
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
        users: [],
        loading: true,
        error: null,
      },
    });

    renderWithProviders(<AdminUserList />, store);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("renders error state correctly", () => {
    const store = createMockStore({
      admin: {
        users: [],
        loading: false,
        error: "Failed to fetch users",
      },
    });

    renderWithProviders(<AdminUserList />, store);

    expect(screen.getByText("Error: Failed to fetch users")).toBeInTheDocument();
  });

  test("renders empty state when no users are found", () => {
    const store = createMockStore({
      admin: {
        users: [],
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AdminUserList />, store);

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  test("renders users correctly", () => {
    const store = createMockStore({
      admin: {
        users: [
          { email: "user1@example.com", name: "User 1", role: "Admin", status: "Active", address: "Address 1", phone: "1234567890" },
          { email: "user2@example.com", name: "User 2", role: "User", status: "Inactive", address: "Address 2", phone: "0987654321" },
        ],
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AdminUserList />, store);

    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("User 2")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
        return element.textContent.includes("Address: Address 1");
    })).toBeInTheDocument();
    expect(screen.getByText("Phone: 1234567890")).toBeInTheDocument();
  });

  test("filters users based on search input", () => {
    const store = createMockStore({
      admin: {
        users: [
          { email: "user1@example.com", name: "Alice", role: "Admin", status: "Active", address: "Address 1", phone: "1234567890" },
          { email: "user2@example.com", name: "Bob", role: "User", status: "Inactive", address: "Address 2", phone: "0987654321" },
        ],
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AdminUserList />, store);

    // Check both users are displayed initially
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Simulate typing "Alice" into the search input
    fireEvent.change(screen.getByPlaceholderText("Search by name..."), { target: { value: "Alice" } });

    // Alice should be visible, but Bob should not
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  test("dispatches fetchAllUsers on mount", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(require("react-redux"), "useDispatch").mockReturnValue(mockDispatch);

    const store = createMockStore({
      admin: {
        users: [],
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AdminUserList />, store);

    expect(mockDispatch).toHaveBeenCalled();
  });
});
