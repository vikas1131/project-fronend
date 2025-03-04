import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider, useDispatch } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import TicketForm from "./RaiseTicket";
import { submitTicket } from "../../redux/Slice/raiseticke";
import { sendNotification } from "../../redux/Slice/notificationSlice";
import { toast } from "react-toastify";

// --- Mocks ---
// Mock the thunk actions.
jest.mock("../../redux/Slice/raiseticke", () => ({
  submitTicket: jest.fn(),
}));

jest.mock("../../redux/Slice/notificationSlice", () => ({
  sendNotification: jest.fn(),
}));

// Mock CustomCard so it simply renders its title and children.
jest.mock("./../../compoents/CustomCard", () => {
  return function MockCustomCard({ title, children }) {
    return (
      <div data-testid="custom-card">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

// Mock Footer if used.
jest.mock("./../../compoents/footers", () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

// Mock useNavigate from react-router-dom.
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock ToastContainer and toast methods.
jest.mock("react-toastify", () => ({
  ToastContainer: ({ children }) => <div data-testid="toast-container">{children}</div>,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useDispatch.
jest.mock("react-redux", () => {
  const actual = jest.requireActual("react-redux");
  return {
    ...actual,
    useDispatch: jest.fn(),
  };
});

// Mock sessionStorage
const mockSessionStorage = {
  email: "test@example.com",
  token: "testToken"
};

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(key => mockSessionStorage[key]),
    setItem: jest.fn((key, value) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete mockSessionStorage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(mockSessionStorage).forEach(key => {
        delete mockSessionStorage[key];
      });
    })
  },
  writable: true
});

// --- Helper functions ---
const createMockStore = (initialState) => createStore(() => initialState);
const renderWithProviders = (component, store) => {
  return render(
    <MemoryRouter>
      <Provider store={store}>{component}</Provider>
    </MemoryRouter>
  );
};

describe("TicketForm Component", () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    // Create a mock store with the auth.user structure that the component expects
    store = createMockStore({
      auth: {
        user: {
          email: "test@example.com",
          name: "Test User"
        }
      },
      Raisetickets: {
        loading: false,
        error: null
      }
    });
    
    mockDispatch = jest.fn(action => {
      if (typeof action === 'function') {
        return action(mockDispatch, () => store.getState());
      }
      return action;
    });
    
    useDispatch.mockReturnValue(mockDispatch);
    
    // Setup mock timers for any timeouts
    jest.useFakeTimers();
    
    // Reset mocks
    mockNavigate.mockReset();
    toast.success.mockClear();
    toast.error.mockClear();
    submitTicket.mockClear();
    sendNotification.mockClear();
    window.sessionStorage.getItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("renders TicketForm component correctly", () => {
    renderWithProviders(<TicketForm />, store);
    expect(screen.getByText("Raise New Ticket")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Describe your issue or request in detail")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter pincode")).toBeInTheDocument();
    expect(screen.getByText("Submit Ticket")).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  test("updates form inputs correctly", () => {
    renderWithProviders(<TicketForm />, store);
    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe your issue or request in detail");
    const pincodeInput = screen.getByPlaceholderText("Enter pincode");

    fireEvent.change(addressInput, { target: { value: "123 Test Street" } });
    fireEvent.change(descriptionInput, { target: { value: "Issue description" } });
    fireEvent.change(pincodeInput, { target: { value: "123456" } });

    expect(addressInput.value).toBe("123 Test Street");
    expect(descriptionInput.value).toBe("Issue description");
    expect(pincodeInput.value).toBe("123456");
  });

  test("displays error if user email not found", async () => {
    // Temporarily remove email from sessionStorage for this test
    const originalGetItem = window.sessionStorage.getItem;
    window.sessionStorage.getItem = jest.fn(key => key === 'email' ? null : mockSessionStorage[key]);
    
    renderWithProviders(<TicketForm />, store);
    
    await act(async () => {
      fireEvent.submit(screen.getByText("Submit Ticket"));
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("User email not found!");
    });
    
    // Restore original behavior
    window.sessionStorage.getItem = originalGetItem;
  });

  test("submits ticket successfully without notification if engineerEmail is absent", async () => {
    const mockTicket = {
      _id: "123",
      userEmail: "test@example.com",
      engineerEmail: null,
    };
    
    // The component expects the resolved value to be nested as: ticket.payload.ticket.ticket
    submitTicket.mockResolvedValue({
      type: "tickets/submitTicket/fulfilled",
      payload: { ticket: { ticket: mockTicket } },
    });

    renderWithProviders(<TicketForm />, store);

    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe your issue or request in detail");
    const pincodeInput = screen.getByPlaceholderText("Enter pincode");

    fireEvent.change(addressInput, { target: { value: "123 Test Street" } });
    fireEvent.change(descriptionInput, { target: { value: "Issue description" } });
    fireEvent.change(pincodeInput, { target: { value: "123456" } });

    await act(async () => {
      fireEvent.submit(screen.getByText("Submit Ticket"));
    });

    const expectedData = {
      serviceType: "installation",
      address: "123 Test Street",
      description: "Issue description",
      pincode: "123456",
      email: "test@example.com",
    };
    
    expect(submitTicket).toHaveBeenCalledWith(expectedData);
    expect(toast.success).toHaveBeenCalledWith("Ticket submitted successfully!");
    expect(sendNotification).not.toHaveBeenCalled();
    
    // Check form reset
    expect(addressInput.value).toBe("");
    expect(descriptionInput.value).toBe("");
    expect(pincodeInput.value).toBe("");
  });

  test("submits ticket successfully and sends notification if engineerEmail is present", async () => {
    const mockTicket = {
      _id: "123",
      userEmail: "test@example.com",
      engineerEmail: "engineer@example.com",
    };
    
    submitTicket.mockResolvedValue({
      type: "tickets/submitTicket/fulfilled",
      payload: { ticket: { ticket: mockTicket } },
    });
    
    sendNotification.mockResolvedValue({
      type: "notifications/sendNotification/fulfilled",
      payload: { success: true }
    });

    renderWithProviders(<TicketForm />, store);

    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe your issue or request in detail");
    const pincodeInput = screen.getByPlaceholderText("Enter pincode");

    fireEvent.change(addressInput, { target: { value: "123 Test Street" } });
    fireEvent.change(descriptionInput, { target: { value: "Issue description" } });
    fireEvent.change(pincodeInput, { target: { value: "123456" } });

    await act(async () => {
      fireEvent.submit(screen.getByText("Submit Ticket"));
    });

    const expectedData = {
      serviceType: "installation",
      address: "123 Test Street",
      description: "Issue description",
      pincode: "123456",
      email: "test@example.com",
    };
    
    expect(submitTicket).toHaveBeenCalledWith(expectedData);
    expect(toast.success).toHaveBeenCalledWith("Ticket submitted successfully!");
    
    await waitFor(() => {
      expect(sendNotification).toHaveBeenCalled();
    });
    
    const notifArg = sendNotification.mock.calls[0][0];
    expect(notifArg.email).toBe("engineer@example.com");
    expect(notifArg.message).toContain("123");
    expect(notifArg.message).toContain("test@example.com");
    
    // Check form reset
    expect(addressInput.value).toBe("");
    expect(descriptionInput.value).toBe("");
    expect(pincodeInput.value).toBe("");
  });

  test("handles ticket submission failure gracefully", async () => {
    submitTicket.mockRejectedValue(new Error("Failed to submit ticket"));
    
    renderWithProviders(<TicketForm />, store);

    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe your issue or request in detail");
    const pincodeInput = screen.getByPlaceholderText("Enter pincode");

    fireEvent.change(addressInput, { target: { value: "123 Test Street" } });
    fireEvent.change(descriptionInput, { target: { value: "Issue description" } });
    fireEvent.change(pincodeInput, { target: { value: "123456" } });

    await act(async () => {
      fireEvent.submit(screen.getByText("Submit Ticket"));
    });

    await waitFor(() => {
      expect(submitTicket).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to submit ticket!");
    });
    
    // Verify loading state is reset
    expect(screen.getByText("Submit Ticket")).toBeInTheDocument();
    expect(screen.queryByText("Submitting...")).not.toBeInTheDocument();
  });

  // Add snapshot test
  // test("matches snapshot", () => {
  //   const { container } = renderWithProviders(<TicketForm />, store);
  //   expect(container).toMatchSnapshot();
  // });
});