import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "./Signup";
import apiClientUser from "../../utils/apiClientUser";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
  validatePincode,
  validatePhoneNumber,
  validateSecurityAnswer,
} from "../../utils/validation";

// Mock API and dependencies
jest.mock("../../utils/apiClientUser");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: jest.fn(() => <div data-testid="toast-container" />),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock validation
jest.mock("../../utils/validation", () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  validatePincode: jest.fn(),
  validatePhoneNumber: jest.fn(),
  validateSecurityAnswer: jest.fn(),
}));

// Setup timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const renderSignupComponent = () => {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
};

describe("Signup Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validateEmail.mockReturnValue(true);
    validatePassword.mockReturnValue(true);
    validatePincode.mockReturnValue(true);
    validatePhoneNumber.mockReturnValue(true);
    validateSecurityAnswer.mockReturnValue(true);
  });

  test("renders signup form correctly", () => {
    renderSignupComponent();
    expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter phone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter pincode/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter securityQuestion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter securityAnswer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("validates email field correctly", () => {
    renderSignupComponent();
    const emailInput = screen.getByPlaceholderText(/enter email/i);
    
    // Simulate invalid email
    validateEmail.mockReturnValue(false);
    fireEvent.change(emailInput, { target: { name: "email", value: "invalid-email" } });
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    
    // Now simulate valid email
    validateEmail.mockReturnValue(true);
    fireEvent.change(emailInput, { target: { name: "email", value: "valid@example.com" } });
    expect(screen.queryByText(/invalid email format/i)).not.toBeInTheDocument();
  });

  test("validates password field correctly", () => {
    renderSignupComponent();
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    
    // Simulate invalid password
    validatePassword.mockReturnValue(false);
    fireEvent.change(passwordInput, { target: { name: "password", value: "weak" } });
    expect(screen.getByText(/Password must be 8-15 characters/i)).toBeInTheDocument();
    
    // Now simulate valid password
    validatePassword.mockReturnValue(true);
    fireEvent.change(passwordInput, { target: { name: "password", value: "StrongPassword1!" } });
    expect(screen.queryByText(/Password must be 8-15 characters/i)).not.toBeInTheDocument();
  });

  test("validates phone number field correctly", () => {
    renderSignupComponent();
    const phoneInput = screen.getByPlaceholderText(/enter phone/i);
    
    // Simulate invalid phone
    validatePhoneNumber.mockReturnValue(false);
    fireEvent.change(phoneInput, { target: { name: "phone", value: "123" } });
    expect(screen.getByText(/Invalid phone number format/i)).toBeInTheDocument();
    
    // Now simulate valid phone
    validatePhoneNumber.mockReturnValue(true);
    fireEvent.change(phoneInput, { target: { name: "phone", value: "1234567890" } });
    expect(screen.queryByText(/Invalid phone number format/i)).not.toBeInTheDocument();
  });

  test("validates pincode field correctly", () => {
    renderSignupComponent();
    const pincodeInput = screen.getByPlaceholderText(/enter pincode/i);
    
    // Simulate invalid pincode
    validatePincode.mockReturnValue(false);
    fireEvent.change(pincodeInput, { target: { name: "pincode", value: "123" } });
    expect(screen.getByText(/Invalid pincode format/i)).toBeInTheDocument();
    
    // Now simulate valid pincode
    validatePincode.mockReturnValue(true);
    fireEvent.change(pincodeInput, { target: { name: "pincode", value: "123456" } });
    expect(screen.queryByText(/Invalid pincode format/i)).not.toBeInTheDocument();
  });

  test("validates security answer field correctly", () => {
    renderSignupComponent();
    const securityAnswerInput = screen.getByPlaceholderText(/enter securityAnswer/i);
    
    // Simulate invalid security answer
    validateSecurityAnswer.mockReturnValue(false);
    fireEvent.change(securityAnswerInput, { target: { name: "securityAnswer", value: "" } });
    expect(screen.getByText(/Invalid security answer/i)).toBeInTheDocument();
    
    // Now simulate valid security answer
    validateSecurityAnswer.mockReturnValue(true);
    fireEvent.change(securityAnswerInput, { target: { name: "securityAnswer", value: "MyAnswer" } });
    expect(screen.queryByText(/Invalid security answer/i)).not.toBeInTheDocument();
  });

  test("toggles engineer fields when role changes", () => {
    renderSignupComponent();
    const roleSelect = screen.getByLabelText(/role/i);
    
    // Engineer-specific fields should not be visible initially
    expect(screen.queryByLabelText(/specialization/i)).not.toBeInTheDocument();
    
    // Choose engineer role
    fireEvent.change(roleSelect, { target: { name: "role", value: "engineer" } });
    expect(screen.getByLabelText(/specialization/i)).toBeInTheDocument();
    expect(screen.getByText(/availability/i)).toBeInTheDocument();
    
    // Change back to user
    fireEvent.change(roleSelect, { target: { name: "role", value: "user" } });
    expect(screen.queryByLabelText(/specialization/i)).not.toBeInTheDocument();
  });

  test("handles specialization selection for engineers", () => {
    renderSignupComponent();
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "engineer" } });
    
    const specializationSelect = screen.getByLabelText(/specialization/i);
    expect(specializationSelect).toBeInTheDocument();
    
    fireEvent.change(specializationSelect, { target: { name: "specialization", value: "Installation" } });
    expect(specializationSelect.value).toBe("Installation");
    
    fireEvent.change(specializationSelect, { target: { name: "specialization", value: "Fault" } });
    expect(specializationSelect.value).toBe("Fault");
  });

  test("handles availability checkbox changes correctly", () => {
    renderSignupComponent();
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "engineer" } });
    
    const mondayCheckbox = screen.getByLabelText(/monday/i);
    const tuesdayCheckbox = screen.getByLabelText(/tuesday/i);
    
    expect(mondayCheckbox.checked).toBe(false);
    expect(tuesdayCheckbox.checked).toBe(false);
    
    // Toggle Monday on
    fireEvent.click(mondayCheckbox);
    expect(mondayCheckbox.checked).toBe(true);
    expect(tuesdayCheckbox.checked).toBe(false);
    
    // Toggle Tuesday on
    fireEvent.click(tuesdayCheckbox);
    expect(mondayCheckbox.checked).toBe(true);
    expect(tuesdayCheckbox.checked).toBe(true);
    
    // Toggle Monday off
    fireEvent.click(mondayCheckbox);
    expect(mondayCheckbox.checked).toBe(false);
    expect(tuesdayCheckbox.checked).toBe(true);
  });

  test("prevents form submission when validation errors exist", async () => {
    renderSignupComponent();
    
    // Add validation error
    validateEmail.mockReturnValue(false);
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { 
      target: { name: "email", value: "invalid-email" } 
    });
    
    // Try to submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    
    // Should show error message
    expect(toast.error).toHaveBeenCalledWith("Please correct the errors and try again.");
    
    // API should not be called
    expect(apiClientUser.post).not.toHaveBeenCalled();
  });

  test("submits form with valid data for regular user and navigates", async () => {
    apiClientUser.post.mockResolvedValue({ data: { success: true } });
    renderSignupComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter name/i), { target: { name: "name", value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { name: "email", value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter phone/i), { target: { name: "phone", value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), { target: { name: "address", value: "123 Test St" } });
    fireEvent.change(screen.getByPlaceholderText(/enter pincode/i), { target: { name: "pincode", value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { name: "password", value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityQuestion/i), { target: { name: "securityQuestion", value: "Favorite color?" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityAnswer/i), { target: { name: "securityAnswer", value: "Blue" } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "user" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith("/users/newUser", expect.objectContaining({
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Test St",
        pincode: "123456",
        password: "Password123!",
        securityQuestion: "Favorite color?",
        securityAnswer: "Blue",
        role: "user",
        specialization: null,
        availability: []
      }));
      expect(toast.success).toHaveBeenCalledWith("Registration successful! Please log in.");
    });

    // Navigate after delay
    jest.advanceTimersByTime(5000);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("submits form with valid data for engineer and navigates", async () => {
    apiClientUser.post.mockResolvedValue({ data: { success: true } });
    renderSignupComponent();

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/enter name/i), { target: { name: "name", value: "Engineer User" } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { name: "email", value: "engineer@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter phone/i), { target: { name: "phone", value: "9876543210" } });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), { target: { name: "address", value: "456 Eng St" } });
    fireEvent.change(screen.getByPlaceholderText(/enter pincode/i), { target: { name: "pincode", value: "654321" } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { name: "password", value: "EngineerPass1!" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityQuestion/i), { target: { name: "securityQuestion", value: "First pet?" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityAnswer/i), { target: { name: "securityAnswer", value: "Rex" } });
    
    // Select engineer role
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "engineer" } });
    
    // Add engineer-specific fields
    fireEvent.change(screen.getByLabelText(/specialization/i), { target: { name: "specialization", value: "Installation" } });
    fireEvent.click(screen.getByLabelText(/monday/i));
    fireEvent.click(screen.getByLabelText(/wednesday/i));
    fireEvent.click(screen.getByLabelText(/friday/i));

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith("/users/newUser", expect.objectContaining({
        name: "Engineer User",
        email: "engineer@example.com",
        role: "engineer",
        specialization: "Installation",
        availability: ["Monday", "Wednesday", "Friday"]
      }));
      expect(toast.success).toHaveBeenCalledWith("Registration successful! Please log in.");
    });

    // Navigate after delay
    jest.advanceTimersByTime(5000);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("handles API error on signup", async () => {
    apiClientUser.post.mockRejectedValue({ 
      response: { data: { message: "Email already exists" } } 
    });
    
    renderSignupComponent();
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(/enter name/i), { target: { name: "name", value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { name: "email", value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter phone/i), { target: { name: "phone", value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), { target: { name: "address", value: "123 Test St" } });
    fireEvent.change(screen.getByPlaceholderText(/enter pincode/i), { target: { name: "pincode", value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { name: "password", value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityQuestion/i), { target: { name: "securityQuestion", value: "Question" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityAnswer/i), { target: { name: "securityAnswer", value: "Answer" } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "user" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already exists");
    });
    
    // Should not navigate
    jest.advanceTimersByTime(5000);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("handles API error with no response data", async () => {
    apiClientUser.post.mockRejectedValue({ message: "Network error" });
    
    renderSignupComponent();
    
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(/enter name/i), { target: { name: "name", value: "Test User" } });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), { target: { name: "email", value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter phone/i), { target: { name: "phone", value: "1234567890" } });
    fireEvent.change(screen.getByPlaceholderText(/enter address/i), { target: { name: "address", value: "123 Test St" } });
    fireEvent.change(screen.getByPlaceholderText(/enter pincode/i), { target: { name: "pincode", value: "123456" } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { name: "password", value: "Password123!" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityQuestion/i), { target: { name: "securityQuestion", value: "Question" } });
    fireEvent.change(screen.getByPlaceholderText(/enter securityAnswer/i), { target: { name: "securityAnswer", value: "Answer" } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { name: "role", value: "user" } });
    
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Signup failed. Please try again.");
    });
  });
});