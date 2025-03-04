import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EngineerLayout from './EngineerDashboard';

// Create mock functions to track component props
const mockSidebarComponent = jest.fn();
const mockNavbarComponent = jest.fn();

jest.mock('./Sidebar', () => (props) => {
  mockSidebarComponent(props);
  return (
    <div 
      data-testid="sidebar" 
      style={{ display: props.isopen ? "block" : "none" }}
    >
      <button data-testid="close-sidebar" onClick={props.onSidebarClose}>
        Close Sidebar
      </button>
    </div>
  );
});

jest.mock('./Navbar', () => (props) => {
  mockNavbarComponent(props);
  return (
    <div data-testid="navbar">
      <button 
        data-testid="toggle-sidebar" 
        onClick={props.toggleSidebar} // Fixed prop name
      >
        Toggle Sidebar
      </button>
    </div>
  );
});

// Mock the Outlet component from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>
}));

describe('EngineerLayout Component', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    mockSidebarComponent.mockClear();
    mockNavbarComponent.mockClear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <EngineerLayout />
      </BrowserRouter>
    );
  };

  test('renders the layout with navbar, sidebar, and outlet', () => {
    renderComponent();
    
    // Check if navbar is rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    
    // Check initial sidebar state (should be false/hidden)
    expect(screen.getByTestId('sidebar')).toHaveStyle("display: none");
    
    // Check if outlet is rendered
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  test('toggles sidebar visibility when navbar toggle button is clicked', () => {
    renderComponent();
    
    const toggleButton = screen.getByTestId('toggle-sidebar');
    const sidebar = screen.getByTestId('sidebar');

    // Initial state check
    expect(sidebar).toHaveStyle("display: none");

    // Click toggle button to open sidebar
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: block");

    // Click toggle button again to close sidebar
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: none");
  });

  test('closes sidebar when the close button in sidebar is clicked', () => {
    renderComponent();
    
    const toggleButton = screen.getByTestId('toggle-sidebar');
    const closeSidebarButton = screen.getByTestId('close-sidebar');
    const sidebar = screen.getByTestId('sidebar');

    // Open sidebar first
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: block");

    // Close sidebar using sidebar's close button
    act(() => {
      fireEvent.click(closeSidebarButton);
    });
    expect(sidebar).toHaveStyle("display: none");
  });

  test('layout has proper structure with sidebar and content area', () => {
    const { container } = renderComponent();
    
    // Check if the main container has proper components
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    
    // Verify the layout structure
    const layoutElements = container.querySelectorAll('div');
    expect(layoutElements.length).toBeGreaterThan(3);
  });

  test('sidebar state persists correctly through multiple toggles', () => {
    renderComponent();
    
    const toggleButton = screen.getByTestId('toggle-sidebar');
    const closeSidebarButton = screen.getByTestId('close-sidebar');
    const sidebar = screen.getByTestId('sidebar');

    // Initial state should be hidden
    expect(sidebar).toHaveStyle("display: none");

    // Toggle on
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: block");

    // Toggle off
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: none");

    // Toggle on again
    act(() => {
      fireEvent.click(toggleButton);
    });
    expect(sidebar).toHaveStyle("display: block");

    // Close with sidebar button
    act(() => {
      fireEvent.click(closeSidebarButton);
    });
    expect(sidebar).toHaveStyle("display: none");
  });
});
