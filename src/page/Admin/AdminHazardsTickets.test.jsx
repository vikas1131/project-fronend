import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider, useDispatch } from "react-redux";
import { createStore } from "redux";
import { MemoryRouter } from "react-router-dom";
import AdminHazardsTickets from "./AdminHazardsTickets";
import { HazardsTicket } from "../../redux/Slice/raiseticke";
import { toast } from "react-toastify";

// Define a dummy global value for inputStyles if needed
global.inputStyles = "dummy-input-styles";

// --- Mock CustomCard so that it simply renders its title and children ---
jest.mock("../../compoents/CustomCard", () => {
  return function MockCustomCard({ title, children }) {
    return (
      <div data-testid="custom-card">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

// --- Mock HazardsTicket action creator ---
jest.mock("../../redux/Slice/raiseticke", () => ({
  HazardsTicket: jest.fn(),
}));

// --- Mock useNavigate from react-router-dom ---
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// --- Mock react-toastify's ToastContainer and toast methods ---
jest.mock("react-toastify", () => ({
  ToastContainer: ({ children }) => (
    <div data-testid="toast-container">{children}</div>
  ),
  toast: { 
    success: jest.fn(),
    error: jest.fn()
  },
}));

// --- Mock react-redux's useDispatch ---
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

// --- Helper to create a dummy Redux store (without middleware) ---
const createMockStore = (initialState) => createStore(() => initialState);

// --- Helper function to render with Redux Provider and MemoryRouter ---
const renderWithProviders = (component, store) => {
  return render(
    <MemoryRouter>
      <Provider store={store}>{component}</Provider>
    </MemoryRouter>
  );
};

describe("AdminHazardsTickets Component", () => {
  let mockDispatch;

  beforeEach(() => {
    jest.useFakeTimers();
    mockDispatch = jest.fn();
    // Set the return value on the mocked useDispatch.
    useDispatch.mockReturnValue(mockDispatch);
    mockNavigate.mockReset();
    toast.success.mockClear();
    toast.error.mockClear();
    HazardsTicket.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("renders component correctly", () => {
    const store = createMockStore({});
    renderWithProviders(<AdminHazardsTickets />, store);

    // Check that the CustomCard title is rendered
    expect(screen.getByText("Add New Hazards")).toBeInTheDocument();

    // Check for presence of form inputs and buttons
    expect(screen.getByPlaceholderText("Hazard Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Address")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Describe hazard in detail")
    ).toBeInTheDocument();

    // Check for the select element (using its role "combobox")
    const riskLevelSelect = screen.getByRole("combobox");
    expect(riskLevelSelect).toBeInTheDocument();
    expect(riskLevelSelect.value).toBe("medium");

    // Check for pincode input via its label (matches exactly "Enter Pincode")
    const pinLabel = screen.getByText("Enter Pincode");
    expect(pinLabel).toBeInTheDocument();
    expect(pinLabel.nextElementSibling).toBeInTheDocument();

    // Check that Cancel and Submit buttons are present
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();

    // Check toast container presence
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  test("updates form inputs correctly", () => {
    const store = createMockStore({});
    renderWithProviders(<AdminHazardsTickets />, store);

    const hazardTitleInput = screen.getByPlaceholderText("Hazard Title");
    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe hazard in detail");
    const riskLevelSelect = screen.getByRole("combobox");
    const pinLabel = screen.getByText("Enter Pincode");
    const pinCodeInput = pinLabel.nextElementSibling;

    // Update each field and check its value.
    fireEvent.change(hazardTitleInput, { target: { value: "Fire" } });
    expect(hazardTitleInput.value).toBe("Fire");

    fireEvent.change(addressInput, { target: { value: "123 Main St" } });
    expect(addressInput.value).toBe("123 Main St");

    fireEvent.change(descriptionInput, { target: { value: "Test hazard description" } });
    expect(descriptionInput.value).toBe("Test hazard description");

    fireEvent.change(riskLevelSelect, { target: { value: "high" } });
    expect(riskLevelSelect.value).toBe("high");

    fireEvent.change(pinCodeInput, { target: { value: "12345" } });
    expect(pinCodeInput.value).toBe("12345");
  });

  test("submits form successfully with truthy response", async () => {
    const store = createMockStore({});
    // Simulate dispatch resolving with payload.success true.
    mockDispatch.mockResolvedValue({ payload: { success: true } });
    HazardsTicket.mockImplementation((data) => ({
      type: "HAZARD_TICKET",
      payload: { ...data, success: true },
    }));

    renderWithProviders(<AdminHazardsTickets />, store);

    const hazardTitleInput = screen.getByPlaceholderText("Hazard Title");
    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe hazard in detail");
    const riskLevelSelect = screen.getByRole("combobox");
    const pinLabel = screen.getByText("Enter Pincode");
    const pinCodeInput = pinLabel.nextElementSibling;

    // Fill in the form.
    fireEvent.change(hazardTitleInput, { target: { value: "Initial Title" } });
    fireEvent.change(addressInput, { target: { value: "123 Main St" } });
    fireEvent.change(descriptionInput, { target: { value: "Test hazard description" } });
    fireEvent.change(riskLevelSelect, { target: { value: "high" } });
    fireEvent.change(pinCodeInput, { target: { value: "12345" } });

    // Submit the form.
    const submitButton = screen.getByText(/submit/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });

    const expectedFormData = {
      hazardType: "Initial Title",
      description: "Test hazard description",
      riskLevel: "high",
      address: "123 Main St",
      pincode: "12345",
    };

    expect(mockDispatch).toHaveBeenCalledWith(HazardsTicket(expectedFormData));
    expect(toast.success).toHaveBeenCalledWith("Hazard submitted successfully!");

    // Advance timers to simulate delayed navigation.
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/hazards");

    // Verify that the form resets.
    expect(hazardTitleInput.value).toBe("");
    expect(addressInput.value).toBe("");
    expect(descriptionInput.value).toBe("");
    expect(riskLevelSelect.value).toBe("medium");
    expect(pinCodeInput.value).toBe("");
  });

  test("submits form with falsey response (no toast or navigation)", async () => {
    const store = createMockStore({});
    // Simulate dispatch resolving with payload.success false.
    mockDispatch.mockResolvedValue({ payload: { success: false } });
    HazardsTicket.mockImplementation((data) => ({
      type: "HAZARD_TICKET",
      payload: { ...data, success: false },
    }));

    renderWithProviders(<AdminHazardsTickets />, store);

    const hazardTitleInput = screen.getByPlaceholderText("Hazard Title");
    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe hazard in detail");
    const riskLevelSelect = screen.getByRole("combobox");
    const pinLabel = screen.getByText("Enter Pincode");
    const pinCodeInput = pinLabel.nextElementSibling;

    fireEvent.change(hazardTitleInput, { target: { value: "Test Title" } });
    fireEvent.change(addressInput, { target: { value: "456 Another St" } });
    fireEvent.change(descriptionInput, { target: { value: "Another description" } });
    fireEvent.change(riskLevelSelect, { target: { value: "low" } });
    fireEvent.change(pinCodeInput, { target: { value: "67890" } });

    const submitButton = screen.getByText(/submit/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });

    const expectedFormData = {
      hazardType: "Test Title",
      description: "Another description",
      riskLevel: "low",
      address: "456 Another St",
      pincode: "67890",
    };

    expect(mockDispatch).toHaveBeenCalledWith(HazardsTicket(expectedFormData));
    // Since response is falsey, success toast should not trigger.
    expect(toast.success).not.toHaveBeenCalledWith("Hazard submitted successfully!");

    // The form resets regardless.
    expect(hazardTitleInput.value).toBe("");
    expect(addressInput.value).toBe("");
    expect(descriptionInput.value).toBe("");
    expect(riskLevelSelect.value).toBe("medium");
    expect(pinCodeInput.value).toBe("");

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("handles submission error gracefully", async () => {
    const store = createMockStore({});
    const originalConsoleError = console.error;
    console.error = jest.fn();
    mockDispatch.mockRejectedValue(new Error("Submission failed"));
    HazardsTicket.mockImplementation((data) => ({
      type: "HAZARD_TICKET",
      payload: data,
    }));

    renderWithProviders(<AdminHazardsTickets />, store);

    const hazardTitleInput = screen.getByPlaceholderText("Hazard Title");
    const addressInput = screen.getByPlaceholderText("Address");
    const descriptionInput = screen.getByPlaceholderText("Describe hazard in detail");
    const riskLevelSelect = screen.getByRole("combobox");
    const pinLabel = screen.getByText("Enter Pincode");
    const pinCodeInput = pinLabel.nextElementSibling;

    fireEvent.change(hazardTitleInput, { target: { value: "Error Title" } });
    fireEvent.change(addressInput, { target: { value: "Error Address" } });
    fireEvent.change(descriptionInput, { target: { value: "Error description" } });
    fireEvent.change(riskLevelSelect, { target: { value: "high" } });
    fireEvent.change(pinCodeInput, { target: { value: "00000" } });

    const submitButton = screen.getByText(/submit/i);
    await act(async () => {
      fireEvent.click(submitButton);
    });

    const expectedFormData = {
      hazardType: "Error Title",
      description: "Error description",
      riskLevel: "high",
      address: "Error Address",
      pincode: "00000",
    };

    expect(mockDispatch).toHaveBeenCalledWith(HazardsTicket(expectedFormData));
    expect(console.error).toHaveBeenCalledWith("Failed to submit Hazard:", "Submission failed");
    console.error = originalConsoleError;
  });

  test("handles cancel button correctly", () => {
    const store = createMockStore({});
    renderWithProviders(<AdminHazardsTickets />, store);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(toast.success).toHaveBeenCalledWith("Cancelled!");
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin/hazards");
  });
});