import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPassword from './ForgotPwd';
import apiClientUser from '../../utils/apiClientUser';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../../utils/apiClientUser');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('ResetPassword Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  // Helper function to advance to step 2
  const advanceToStep2 = async () => {
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: true,
          securityQuestion: 'What is your favorite color?'
        }
      }
    });

    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/Enter Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const verifyButton = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => expect(screen.getByText(/Security Question/i)).toBeInTheDocument());
  };

  // Helper function to advance to step 3
  const advanceToStep3 = async () => {
    await advanceToStep2();
    
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: true,
          message: 'Security answer verified. Proceed to reset password.'
        }
      }
    });
    
    const securityAnswerInput = screen.getByLabelText(/Security Answer/i);
    fireEvent.change(securityAnswerInput, { target: { value: 'blue' } });
    
    const verifyAnswerButton = screen.getByRole('button', { name: /Verify Answer/i });
    fireEvent.click(verifyAnswerButton);
    
    await waitFor(() => expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument());
  };

  test('renders initial email input form', () => {
    render(<ResetPassword />);
    
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Email/i })).toBeInTheDocument();
  });

  test('handles email verification successfully', async () => {
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: true,
          securityQuestion: 'What is your favorite color?'
        }
      }
    });

    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/Enter Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const verifyButton = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith('/users/reset', { email: 'test@example.com' });
      expect(screen.getByText(/What is your favorite color/i)).toBeInTheDocument();
    });
  });

  test('handles email verification error', async () => {
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: false,
          message: 'Email not found'
        }
      }
    });

    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/Enter Email/i);
    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    
    const verifyButton = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email not found');
    });
  });

  test('handles network error during email verification', async () => {
    apiClientUser.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Network error'
        }
      }
    });

    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/Enter Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const verifyButton = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  test('handles security answer verification successfully', async () => {
    await advanceToStep2();
    
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: true,
          message: 'Security answer verified. Proceed to reset password.'
        }
      }
    });
    
    const securityAnswerInput = screen.getByLabelText(/Security Answer/i);
    fireEvent.change(securityAnswerInput, { target: { value: 'blue' } });
    
    const verifyAnswerButton = screen.getByRole('button', { name: /Verify Answer/i });
    fireEvent.click(verifyAnswerButton);
    
    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith('/users/reset', {
        email: 'test@example.com',
        securityAnswer: 'blue'
      });
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });
  });

  test('handles security answer verification error', async () => {
    await advanceToStep2();
    
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: false,
          message: 'Incorrect security answer'
        }
      }
    });
    
    const securityAnswerInput = screen.getByLabelText(/Security Answer/i);
    fireEvent.change(securityAnswerInput, { target: { value: 'wrong answer' } });
    
    const verifyAnswerButton = screen.getByRole('button', { name: /Verify Answer/i });
    fireEvent.click(verifyAnswerButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Incorrect security answer');
    });
  });

  test('handles network error during security answer verification', async () => {
    await advanceToStep2();
    
    apiClientUser.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Network error'
        }
      }
    });
    
    const securityAnswerInput = screen.getByLabelText(/Security Answer/i);
    fireEvent.change(securityAnswerInput, { target: { value: 'blue' } });
    
    const verifyAnswerButton = screen.getByRole('button', { name: /Verify Answer/i });
    fireEvent.click(verifyAnswerButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  test('shows error when passwords do not match', async () => {
    await advanceToStep3();
    
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);
    
    expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
    expect(apiClientUser.post).not.toHaveBeenCalledWith('/users/reset', {
      email: 'test@example.com',
      newPassword: 'password123'
    });
  });

  test('handles password reset successfully', async () => {
    jest.useFakeTimers();
    await advanceToStep3();
    
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: true,
          message: 'Password reset successfully'
        }
      }
    });
    
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith('/users/reset', {
        email: 'test@example.com',
        newPassword: 'newPassword123'
      });
      expect(toast.success).toHaveBeenCalledWith('Password reset successfully!');
    });
    
    jest.advanceTimersByTime(2000);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    jest.useRealTimers();
  });

  test('handles password reset error', async () => {
    await advanceToStep3();
    
    apiClientUser.post.mockResolvedValueOnce({
      data: {
        user: {
          success: false,
          message: 'Error resetting password'
        }
      }
    });
    
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error resetting password');
    });
  });

  test('handles network error during password reset', async () => {
    await advanceToStep3();
    
    apiClientUser.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Network error'
        }
      }
    });
    
    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    
    const resetButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  test('handles default error message when there is no response data', async () => {
    apiClientUser.post.mockRejectedValueOnce({});
    
    render(<ResetPassword />);
    
    const emailInput = screen.getByLabelText(/Enter Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const verifyButton = screen.getByRole('button', { name: /Verify Email/i });
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error verifying email');
    });
  });
});