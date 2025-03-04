import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

describe('AdminSidebar Component', () => {
  let mockNavigate;
  let mockLocation;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockLocation = { pathname: '/admin' };
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
  });

  test('renders sidebar with default expanded state', () => {
    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  test('toggles sidebar on button click', () => {
    const store = createMockStore({});
    renderWithProviders(<AdminSidebar />, store);

    const toggleButton = screen.getByTestId('toggle-sidebar');

    // Initially, sidebar should be expanded
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(toggleButton);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

  test('navigates to the correct page on menu item click', () => {
    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  test('highlights active menu item', () => {
    render(
      <MemoryRouter>
        <AdminSidebar />
      </MemoryRouter>
    );

    const activeItem = screen.getByText('Dashboard');
    expect(activeItem).toHaveClass('bg-blue-500');
  });
});
