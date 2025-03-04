import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './Login';
import apiClientUser from '../../utils/apiClientUser';
import { toast } from 'react-toastify';

// Mock modules
jest.mock('../../utils/apiClientUser');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

describe('Login Component', () => {
  const mockNavigate = jest.fn();
  const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

  beforeEach(() => {
    require('react-router-dom').useNavigate.mockImplementation(() => mockNavigate);
    jest.clearAllMocks();
  });

  test('renders login form with all elements', () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
  });

  test('shows email validation error for invalid input', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    const emailInput = screen.getByLabelText('Email');
    
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  test('disables submit button when email has error', async () => {
    render(
      <Router>
        <Login />
      </Router>
    );
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  test('handles successful login and redirects', async () => {
    const mockResponse = {
      data: {
        success: true,
        user: {
          token: 'fake-token',
          email: 'test@example.com',
          role: 'user',
        },
      },
    };
    apiClientUser.post.mockResolvedValue(mockResponse);

    render(
      <Router>
        <Login />
      </Router>
    );
    
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'valid@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Password'), { 
      target: { value: 'ValidPass123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(apiClientUser.post).toHaveBeenCalledWith('/users/checkUser', {
        email: 'valid@example.com',
        password: 'ValidPass123',
      });
      expect(mockSetItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(mockSetItem).toHaveBeenCalledWith('email', 'test@example.com');
      expect(mockSetItem).toHaveBeenCalledWith('role', 'user');
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
      expect(mockNavigate).toHaveBeenCalledWith('/user');
    });
  });

  test('shows error toast on API error', async () => {
    apiClientUser.post.mockRejectedValue(new Error('API error'));

    render(
      <Router>
        <Login />
      </Router>
    );

    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'valid@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Password'), { 
      target: { value: 'ValidPass123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.');
    });
  });
});