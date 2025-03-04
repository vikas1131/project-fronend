import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './protectedRoute';
import { ToastContainer, toast } from 'react-toastify';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({ pathname: '/dashboard' })),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('ProtectedRoute Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    
    // Clear session storage before each test
    sessionStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders children when user is authenticated and has allowed role', () => {
    // Setup
    sessionStorage.setItem('token', 'valid-token');
    sessionStorage.setItem('role', 'admin');
    
    // Render
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Assert
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  test('redirects to login when token is missing', async () => {
    // Render
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Assert
    expect(toast.error).toHaveBeenCalledWith('Please log in to access this page.');
    
    // Advance timers to trigger the setTimeout
    jest.advanceTimersByTime(1000);
    
    // Check navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('redirects to unauthorized when role is not allowed', async () => {
    // Setup
    sessionStorage.setItem('token', 'valid-token');
    sessionStorage.setItem('role', 'guest');
    
    // Render
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Assert
    expect(toast.error).toHaveBeenCalledWith('Please log in to access this page.');
    
    // Advance timers to trigger the setTimeout
    jest.advanceTimersByTime(1000);
    
    // Check navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });

  test('re-evaluates auth when location changes', async () => {
    // Setup initial state
    sessionStorage.setItem('token', 'valid-token');
    sessionStorage.setItem('role', 'admin');
    
    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Change location by updating the mock
    require('react-router-dom').useLocation.mockReturnValue({ pathname: '/settings' });
    
    // Simulate location change by re-rendering
    rerender(
      <MemoryRouter initialEntries={['/settings']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Assert content still renders (since user is still authenticated)
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('re-evaluates auth when allowedRoles changes', async () => {
    // Setup initial state
    sessionStorage.setItem('token', 'valid-token');
    sessionStorage.setItem('role', 'editor');
    
    const { rerender } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'editor']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Change allowed roles
    rerender(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute allowedRoles={['admin', 'user']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    // Assert error toast is shown and redirect happens
    expect(toast.error).toHaveBeenCalledWith('Please log in to access this page.');
    
    jest.advanceTimersByTime(1000);
    expect(mockNavigate).toHaveBeenCalledWith('/unauthorized');
  });
});