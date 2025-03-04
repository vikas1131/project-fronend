import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';

// Mock child components
jest.mock('./Sidebar', () => {
  return function MockSidebar({ isopen, onSidebarClose }) {
    return (
      <div data-testid="admin-sidebar" data-isopen={isopen}>
        <button 
          data-testid="close-sidebar-button"
          onClick={onSidebarClose}
        >
          Close Sidebar
        </button>
      </div>
    );
  };
});

jest.mock('./../../compoents/Navbar', () => {
  return function MockNavbar({ toggleSidebar }) {
    return (
      <div data-testid="admin-navbar">
        <button 
          data-testid="toggle-sidebar-button"
          onClick={toggleSidebar}
        >
          Toggle Sidebar
        </button>
      </div>
    );
  };
});

// Mock Outlet component from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet-content">Mock Outlet Content</div>
}));

describe('AdminLayout Component', () => {
  // Helper function to render with MemoryRouter
  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  test('renders AdminLayout component correctly', () => {
    renderWithRouter(<AdminLayout />);
    
    // Check if all main components are rendered
    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  test('sidebar is initially closed', () => {
    renderWithRouter(<AdminLayout />);
    
    // Check initial state of sidebar
    const sidebar = screen.getByTestId('admin-sidebar');
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
  });

  test('toggles sidebar when toggle button is clicked', () => {
    renderWithRouter(<AdminLayout />);
    
    const toggleButton = screen.getByTestId('toggle-sidebar-button');
    const sidebar = screen.getByTestId('admin-sidebar');
    
    // Initial state
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
    
    // Click toggle button
    fireEvent.click(toggleButton);
    
    // Sidebar should now be open
    expect(sidebar).toHaveAttribute('data-isopen', 'true');
    
    // Click toggle button again
    fireEvent.click(toggleButton);
    
    // Sidebar should now be closed
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
  });

  test('closes sidebar when close button is clicked', () => {
    renderWithRouter(<AdminLayout />);
    
    const toggleButton = screen.getByTestId('toggle-sidebar-button');
    const sidebar = screen.getByTestId('admin-sidebar');
    const closeButton = screen.getByTestId('close-sidebar-button');
    
    // Open sidebar first
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveAttribute('data-isopen', 'true');
    
    // Click close button
    fireEvent.click(closeButton);
    
    // Sidebar should now be closed
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
  });

  test('main content has correct styling based on sidebar state', () => {
    renderWithRouter(<AdminLayout />);
    
    // Get main content div (parent of outlet)
    const mainContent = screen.getByTestId('outlet-content').parentElement;
    
    // Check initial classes
    expect(mainContent).toHaveClass('mt-7');
    expect(mainContent).toHaveClass('lg:ml-20');
    expect(mainContent).toHaveClass('ms:ml-0');
    expect(mainContent).toHaveClass('transition-all');
    expect(mainContent).toHaveClass('duration-300');
  });

  test('component handles multiple sidebar toggles correctly', () => {
    renderWithRouter(<AdminLayout />);
    
    const toggleButton = screen.getByTestId('toggle-sidebar-button');
    const sidebar = screen.getByTestId('admin-sidebar');
    
    // Toggle multiple times
    fireEvent.click(toggleButton); // Open
    expect(sidebar).toHaveAttribute('data-isopen', 'true');
    
    fireEvent.click(toggleButton); // Close
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
    
    fireEvent.click(toggleButton); // Open
    expect(sidebar).toHaveAttribute('data-isopen', 'true');
    
    fireEvent.click(toggleButton); // Close
    expect(sidebar).toHaveAttribute('data-isopen', 'false');
  });
});