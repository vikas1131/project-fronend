import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Logout from './logout';
import apiClient from './apiClient';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('./apiClient', () => ({
  post: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('Logout Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    // Set up sessionStorage and localStorage with test values
    ['token', 'role', 'email'].forEach(key => {
      sessionStorage.setItem(key, `test-${key}`);
      localStorage.setItem(key, `test-${key}`);
    });
    
    // Mock console.error to prevent test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    console.error.mockRestore();
  });

  test('logs out successfully on component mount', async () => {
    // Setup API response
    apiClient.post.mockResolvedValueOnce({});
    
    // Render component
    render(<Logout />);
    
    // Verify API call
    expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Check that storage items were removed
      ['token', 'role', 'email'].forEach(key => {
        expect(sessionStorage.getItem(key)).toBeNull();
        expect(localStorage.getItem(key)).toBeNull();
      });
      
      // Verify toast was called
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully!');
    });
    
    // Advance timers to trigger setTimeout
    jest.advanceTimersByTime(1000);
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles logout failure', async () => {
    // Setup API rejection
    const mockError = new Error('Network error');
    mockError.response = { data: 'Server error' };
    apiClient.post.mockRejectedValueOnce(mockError);
    
    // Render component
    render(<Logout />);
    
    // Verify API call
    expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Verify error toast was called
      expect(toast.error).toHaveBeenCalledWith('Failed to logout. Please try again.');
      
      // Verify console.error was called with the error
      expect(console.error).toHaveBeenCalledWith('Logout failed:', 'Server error');
    });
  });

  test('handles logout error without response data', async () => {
    // Setup API rejection with no response property
    const mockError = new Error('Generic error');
    apiClient.post.mockRejectedValueOnce(mockError);
    
    // Render component
    render(<Logout />);
    
    // Verify API call
    expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    
    // Wait for async operations to complete
    await waitFor(() => {
      // Verify error toast was called
      expect(toast.error).toHaveBeenCalledWith('Failed to logout. Please try again.');
      
      // Verify console.error was called with the error message
      expect(console.error).toHaveBeenCalledWith('Logout failed:', 'Generic error');
    });
  });

  test('renders toast container correctly', () => {
    // Setup API response
    apiClient.post.mockResolvedValueOnce({});
    
    // Render component
    const { getByTestId } = render(<Logout />);
    
    // Verify toast container is rendered
    expect(getByTestId('toast-container')).toBeInTheDocument();
  });
  
  test('useCallback memoization works correctly with dependencies', async () => {
    // This test verifies the useCallback hook works as expected
    apiClient.post.mockResolvedValueOnce({});
    
    // Render with initial mockNavigate value
    const { rerender } = render(<Logout />);
    
    // First wait for the initial render to complete its async operations
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    });
    
    // Advance timers to trigger the initial setTimeout
    jest.advanceTimersByTime(1000);
    
    // Clear mocks to prepare for rerender test
    jest.clearAllMocks();
    apiClient.post.mockResolvedValueOnce({});
    
    // Change the navigate mock to simulate dependency change
    const newMockNavigate = jest.fn();
    require('react-router-dom').useNavigate.mockReturnValue(newMockNavigate);
    
    // Re-render to trigger useEffect with new dependency
    rerender(<Logout />);
    
    // Wait for the second render's async operations
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/users/logout');
    });
    
    // Advance timers for the second render's setTimeout
    jest.advanceTimersByTime(1000);
    
    // Verify the new navigate function was used
    expect(newMockNavigate).toHaveBeenCalledWith('/login');
  });
});