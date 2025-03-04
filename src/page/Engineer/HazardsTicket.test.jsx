import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Create all the mocks before importing the component
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

// Mock the entire react-redux module
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => mockSelector()
}));

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate
}));

// Mock the HazardsTicket action creator
jest.mock("../../redux/Slice/raiseticke", () => ({
  HazardsTicket: jest.fn(data => data)
}));

// Mock react-toastify
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
  ToastContainer: () => <div data-testid="toast-container" />
}));

// Mock the lucide-react icons
jest.mock("lucide-react", () => ({
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  Send: () => <div data-testid="send-icon" />,
  X: () => <div data-testid="x-icon" />
}));

// Mock the CustomCard component
jest.mock("../../compoents/CustomCard", () => ({
  __esModule: true,
  default: ({ children, title }) => (
    <div data-testid="custom-card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}));

// Now import the component after all mocks are set up
import TicketForm from "./HazardsTicket";
import { HazardsTicket } from "../../redux/Slice/raiseticke";
import { toast } from "react-toastify";

describe("TicketForm Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock behavior for dispatch to return an object with unwrap method
    mockDispatch.mockReturnValue({ 
      unwrap: jest.fn().mockResolvedValue({ success: true }) 
    });
    
    // Mock timers for setTimeout
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });
  
  // Helper function to render the component
  const renderComponent = () => render(<TicketForm />);
  
  test("renders the form correctly with all fields and buttons", () => {
    renderComponent();
    
    // Check for key form elements
    expect(screen.getByTestId("custom-card")).toBeInTheDocument();
    //expect(screen.getByTestId("alert-triangle-icon")).toBeInTheDocument();
    expect(screen.getByLabelText(/Hazards Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter Pincode/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });
  
  test("updates form fields when user types", () => {
    renderComponent();
    
    // Get input elements
    const hazardTypeInput = screen.getByLabelText(/Hazards Type/i);
    const addressInput = screen.getByLabelText(/Address/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const pincodeInput = screen.getByLabelText(/Enter Pincode/i);
    const riskLevelSelect = screen.getByLabelText(/Priority Level/i);
    
    // Change input values
    fireEvent.change(hazardTypeInput, { target: { value: "Electrical" } });
    fireEvent.change(addressInput, { target: { value: "123 Test St" } });
    fireEvent.change(descriptionInput, { target: { value: "Test description" } });
    fireEvent.change(pincodeInput, { target: { value: "12345" } });
    fireEvent.change(riskLevelSelect, { target: { value: "high" } });
    
    // Check if values were updated in the form state
    expect(hazardTypeInput.value).toBe("Electrical");
    expect(addressInput.value).toBe("123 Test St");
    expect(descriptionInput.value).toBe("Test description");
    expect(pincodeInput.value).toBe("12345");
    expect(riskLevelSelect.value).toBe("high");
  });
  
  test("dispatches HazardsTicket when form is submitted with valid data", async () => {
    renderComponent();
    
    // Fill in required form fields
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test description" } });
    fireEvent.change(screen.getByLabelText(/Enter Pincode/i), { target: { value: "12345" } });
    fireEvent.change(screen.getByLabelText(/Priority Level/i), { target: { value: "high" } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Check if the action was dispatched with correct data
    expect(mockDispatch).toHaveBeenCalled();
    expect(HazardsTicket).toHaveBeenCalledWith({
      hazardType: "Electrical",
      description: "Test description",
      riskLevel: "high",
      address: "123 Test St",
      pincode: "12345"
    });
  });
  
  test("shows success toast and navigates on successful submission", async () => {
    // Setup the unwrap mock to resolve successfully
    const unwrapMock = jest.fn().mockResolvedValue({ success: true });
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    
    renderComponent();
    
    // Fill and submit form with minimal required fields
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test description" } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Verify unwrap was called
    await waitFor(() => {
      expect(unwrapMock).toHaveBeenCalled();
    });
    
    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith("Ticket submitted successfully!");
    
    // Advance timers to trigger the navigation setTimeout
    jest.advanceTimersByTime(1000);
    
    // Verify navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith("/engineer/Hazards");
  });
  
  test("shows error toast on submission failure", async () => {
    // Setup the unwrap mock to reject with an error
    const unwrapMock = jest.fn().mockRejectedValue(new Error("Submission failed"));
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    
    renderComponent();
    
    // Fill and submit form with minimal required fields
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test description" } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(unwrapMock).toHaveBeenCalled();
    });
    
    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith("Failed to submit ticket. Try again.");
    
    // Navigation should not occur on error
    jest.advanceTimersByTime(1000);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test("navigates to Hazards page when Cancel button is clicked", () => {
    renderComponent();
    
    // Click the Cancel button
    fireEvent.click(screen.getByText(/Cancel/i));
    
    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith("/engineer/Hazards");
  });
  
  test("prevents submission when required fields are missing", async () => {
    renderComponent();
    
    // Submit form without filling required fields
    fireEvent.submit(screen.getByLabelText(/Priority Level/i).closest("form"));
    
    // Dispatch should not be called if validation fails
    expect(mockDispatch).not.toHaveBeenCalled();
    
    // Fill only one required field
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Dispatch still should not be called
    expect(mockDispatch).not.toHaveBeenCalled();
  });
  
  test("log is called with correct form data on submit", async () => {
    // Mock console.log to verify it's called
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    
    renderComponent();
    
    // Fill form with test data
    const testData = {
      hazardType: "Chemical",
      address: "456 Lab St",
      description: "Chemical spill",
      riskLevel: "high",
      pincode: "54321"
    };
    
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: testData.hazardType } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: testData.address } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: testData.description } });
    fireEvent.change(screen.getByLabelText(/Priority Level/i), { target: { value: testData.riskLevel } });
    fireEvent.change(screen.getByLabelText(/Enter Pincode/i), { target: { value: testData.pincode } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Verify console.log was called with the form data
    expect(console.log).toHaveBeenCalledWith("Ticket submitted:", {
      hazardType: testData.hazardType,
      description: testData.description,
      riskLevel: testData.riskLevel,
      address: testData.address,
      pincode: testData.pincode
    });
    
    // Restore original console.log
    console.log = originalConsoleLog;
  });
  
  test("logs error on submission failure", async () => {
    // Mock console.error to verify it's called
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Setup the unwrap mock to reject with an error
    const testError = new Error("API error");
    const unwrapMock = jest.fn().mockRejectedValue(testError);
    mockDispatch.mockReturnValue({ unwrap: unwrapMock });
    
    renderComponent();
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test description" } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Wait for async operations to complete
    await waitFor(() => {
      expect(unwrapMock).toHaveBeenCalled();
    });
    
    // Verify console.error was called with the error
    expect(console.error).toHaveBeenCalledWith("Failed to submit ticket:", testError);
    
    // Restore original console.error
    console.error = originalConsoleError;
  });
  
  test("form has correct initial state values", () => {
    renderComponent();
    
    // Check initial values
    expect(screen.getByLabelText(/Hazards Type/i).value).toBe("");
    expect(screen.getByLabelText(/Address/i).value).toBe("");
    expect(screen.getByLabelText(/Description/i).value).toBe("");
    expect(screen.getByLabelText(/Priority Level/i).value).toBe("medium");
    expect(screen.getByLabelText(/Enter Pincode/i).value).toBe("");
  });
  
  test("submits form with optional pincode field left empty", async () => {
    renderComponent();
    
    // Fill required fields but leave pincode empty
    fireEvent.change(screen.getByLabelText(/Hazards Type/i), { target: { value: "Electrical" } });
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: "123 Test St" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Test description" } });
    
    // Submit the form
    fireEvent.submit(screen.getByLabelText(/Hazards Type/i).closest("form"));
    
    // Check if the action was dispatched with empty pincode
    expect(HazardsTicket).toHaveBeenCalledWith({
      hazardType: "Electrical",
      description: "Test description",
      riskLevel: "medium",
      address: "123 Test St",
      pincode: ""
    });
  });
  
  test("renders required field indicators correctly", () => {
    renderComponent();
    
    // Check if required attributes are set correctly
    expect(screen.getByLabelText(/Hazards Type/i)).toHaveAttribute("required");
    expect(screen.getByLabelText(/Address/i)).toHaveAttribute("required");
    expect(screen.getByLabelText(/Description/i)).toHaveAttribute("required");
    
    // Pincode should not be required
    expect(screen.getByLabelText(/Enter Pincode/i)).not.toHaveAttribute("required");
  });
});