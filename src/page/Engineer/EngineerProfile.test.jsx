import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import engineerReducer, {
  fetchProfile,
  fetchUpdateEngineerProfile,
  fetchEngineerTasks,
} from "../../redux/Slice/EngineerSlice";
import EngineerProfile from "./EngineerProfile";
import { useSelector, useDispatch } from "react-redux";

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn((key) => {
    if (key === "email") return "test@example.com";
    if (key === "role") return "engineer";
    return null;
  }),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

// Mock Redux Actions
jest.mock("../../redux/Slice/EngineerSlice", () => ({
  ...jest.requireActual("../../redux/Slice/EngineerSlice"),
  fetchProfile: jest.fn(),
  fetchUpdateEngineerProfile: jest.fn(),
  fetchEngineerTasks: jest.fn(),
}));

// Mock useDispatch hook
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: () => mockDispatch,
}));

// Mock Navbar component
jest.mock("./Navbar", () => () => <div data-testid="navbar-mock">Navbar</div>);

describe("EngineerProfile Component", () => {
  let mockState;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Initialize mock state
    mockState = {
      engineer: {
        profile: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
          address: "123 Main Street",
          availability: {
            Monday: true,
            Tuesday: false,
            Wednesday: true,
            Thursday: false,
            Friday: true,
            Saturday: false,
            Sunday: true,
          },
          specialization: "Installation",
        },
        updateSuccess: false,
        loading: false,
      },
      notifications: {
        notifications: [],
      },
    };

    // Mock useSelector to return our mock state
    useSelector.mockImplementation((selector) => {
      if (selector === expect.any(Function)) {
        return mockState.engineer;
      }
      return selector(mockState);
    });

    // Mock implementations for Redux actions
    fetchProfile.mockReturnValue({ type: "engineer/fetchProfile" });
    fetchUpdateEngineerProfile.mockReturnValue({ 
      type: "engineer/fetchUpdateEngineerProfile"
    });
    fetchEngineerTasks.mockReturnValue({ type: "engineer/fetchEngineerTasks" });
  });

  test("renders EngineerProfile component correctly", () => {
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    expect(screen.getByText("Engineer Profile")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-mock")).toBeInTheDocument();
  });

  test("dispatches fetchProfile and fetchEngineerTasks action on mount", async () => {
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenNthCalledWith(1, fetchProfile({
        userEmail: "test@example.com",
        role: "engineer"
      }));
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenNthCalledWith(2, fetchEngineerTasks());
    });
  });

  test("initializes engineer state with profile data", async () => {
    useSelector.mockImplementationOnce(() => ({
      profile: undefined
    }));
    
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(fetchProfile({
        userEmail: "test@example.com",
        role: "engineer"
      }));
    });
    
    useSelector.mockImplementation(() => ({
      profile: mockState.engineer.profile
    }));
    
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );
    
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  test("allows profile update", async () => {
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    fireEvent.click(screen.getByText("Update Profile"));

    await waitFor(() => expect(screen.getByText("Full Name")).toBeInTheDocument());

    const nameInput = screen.getByRole("textbox", { name: /Full Name/i });

    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        fetchUpdateEngineerProfile({
          email: "test@example.com",
          updatedData: expect.objectContaining({ name: "Jane Doe" }),
        })
      );
    });
  });

  test("toggles availability checkboxes", async () => {
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    fireEvent.click(screen.getByText("Update Profile"));

    const checkboxes = screen.getAllByRole("checkbox");
    const mondayCheckbox = checkboxes[0];

    const initialCheckedState = mondayCheckbox.checked;

    fireEvent.click(mondayCheckbox);

    expect(mondayCheckbox.checked).not.toBe(initialCheckedState);
  });

  test("changes specialization when radio button is clicked", async () => {
    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    fireEvent.click(screen.getByText("Update Profile"));

    const radioButtons = screen.getAllByRole("radio");
    const faultRadio = radioButtons.find(radio => radio.value === "Fault");

    fireEvent.click(faultRadio);

    expect(faultRadio.checked).toBe(true);
  });

  test("shows success message on profile update", async () => {
    mockDispatch.mockImplementationOnce(action => {
      if (action.type === "engineer/fetchUpdateEngineerProfile") {
        return Promise.resolve();
      }
      return action;
    });

    render(
      <Provider store={configureStore({
        reducer: {
          engineer: engineerReducer,
          notifications: (state = { notifications: [] }) => state,
        }
      })}>
        <EngineerProfile />
      </Provider>
    );

    fireEvent.click(screen.getByText("Update Profile"));

    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(screen.getByText("Profile Updated!")).toBeInTheDocument();
    });
  });
});
