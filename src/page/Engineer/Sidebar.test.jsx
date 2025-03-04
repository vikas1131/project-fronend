import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="dashboard-icon">DashboardIcon</div>,
  ClipboardList: () => <div data-testid="tasks-icon">TasksIcon</div>,
  AlertTriangle: () => <div data-testid="alert-icon">AlertIcon</div>,
  ShieldAlert: () => <div data-testid="hazards-icon">HazardsIcon</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRightIcon</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeftIcon</div>,
  User: () => <div data-testid="user-icon">UserIcon</div>
}));

// Mock react-icons/md
jest.mock('react-icons/md', () => ({
  MdOutlinePendingActions: () => <div data-testid="pending-icon">PendingIcon</div>
}));

describe('Sidebar Component', () => {
  const onSidebarClose = jest.fn();
  const originalInnerWidth = window.innerWidth;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('testuser@example.com')
      }
    });
    
    // Mock addEventListener and removeEventListener to handle resize events
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    
    // Reset window width to desktop default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    // Mock the resize event dispatch
    window.addEventListener.mockImplementation((event, handler) => {
      if (event === 'resize') {
        handler();
      }
    });
  });

  afterAll(() => {
    // Restore original window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  const setWindowWidth = (width) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    });
    
    // Call all resize handlers
    window.addEventListener.mock.calls.forEach(call => {
      if (call[0] === 'resize') {
        call[1]();
      }
    });
  };

  test('renders correctly with user name from session storage', () => {
    render(<Sidebar activePath="/" />);
    
    // Check if username's first letter is displayed
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('expands and collapses when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar activePath="/" />);
    
    // Find the toggle button (we need to find by role and make the selector more specific)
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(button => 
      button.classList.contains('absolute') || 
      button.querySelector('[data-testid="chevron-right-icon"]')
    );
    
    // Click to expand
    await user.click(toggleButton);
    
    // Check if expanded view shows the full username
    expect(await screen.findByText('TESTUSER')).toBeInTheDocument();
    
    // Click again to collapse
    await user.click(toggleButton);
    
    // Wait for collapse animation and check if we're back to initial state
    await waitFor(() => {
      expect(screen.queryByText('TESTUSER')).not.toBeInTheDocument();
    });
  });

  test('highlights the active menu item', async () => {
    render(<Sidebar activePath="/engineer/hazards" />);
    
    // Find all buttons to expand the sidebar first
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(button => 
      button.classList.contains('absolute') || 
      button.querySelector('[data-testid="chevron-right-icon"]')
    );
    
    // Programmatically expand the sidebar to see menu item texts
    await userEvent.click(toggleButton);
    
    // Wait for the sidebar to expand
    await screen.findByText('Hazards');
    
    // Find all navigation menu items
    const menuButtons = screen.getAllByRole('button').filter(
      button => !button.classList.contains('absolute')
    );
    
    // Find the Hazards button (it should have active styles)
    const hazardsButton = menuButtons.find(button => button.textContent.includes('Hazards'));
    
    // Find a non-active button for comparison
    const dashboardButton = menuButtons.find(button => button.textContent.includes('Dashboard'));
    
    // Check if the correct button has active styling
    expect(hazardsButton).toHaveClass('bg-blue-600');
    expect(dashboardButton).not.toHaveClass('bg-blue-600');
  });

  test('navigates when menu item is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar activePath="/" />);
    
    // Expand the sidebar
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons.find(button => 
      button.classList.contains('absolute') || 
      button.querySelector('[data-testid="chevron-right-icon"]')
    );
    await user.click(toggleButton);
    
    // Wait for sidebar to expand
    await screen.findByText('Tasks');
    
    // Click on the Tasks menu item
    await user.click(screen.getByText('Tasks'));
    
    // Check if navigate was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/engineer/assignedTasks');
  });

  test('handles mobile view correctly', () => {
    // Set window width to mobile size
    setWindowWidth(500);
    
    // Render in closed mobile state
    const { rerender } = render(<Sidebar activePath="/" isopen={false} onSidebarClose={onSidebarClose} />);
    
    // Get the sidebar element
    const sidebarElement = screen.getByRole('navigation').parentElement;
    
    // Check it has the hidden class
    expect(sidebarElement).toHaveClass('-translate-x-full');
    
    // Rerender with isopen=true
    rerender(<Sidebar activePath="/" isopen={true} onSidebarClose={onSidebarClose} />);
    
    // Get the updated sidebar element
    const updatedSidebarElement = screen.getByRole('navigation').parentElement;
    
    // Check it has the visible class
    expect(updatedSidebarElement).toHaveClass('translate-x-0');
  });

  test('calls onSidebarClose when a menu item is clicked on mobile', async () => {
    const user = userEvent.setup();
    
    // Set window width to mobile size
    setWindowWidth(500);
    
    render(<Sidebar activePath="/" isopen={true} onSidebarClose={onSidebarClose} />);
    
    // On mobile, menu items should be visible when isopen=true
    const dashboardButton = screen.getAllByRole('button')
      .find(button => button.textContent.includes('Dashboard'));
    
    // Click on the Dashboard button
    await user.click(dashboardButton);
    
    // Check if onSidebarClose was called
    expect(onSidebarClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/engineer');
  });

  test('handles missing email in session storage', () => {
    // Mock sessionStorage to return null
    window.sessionStorage.getItem.mockReturnValueOnce(null);
    
    // Should render without crashing
    render(<Sidebar activePath="/" />);
    
    // Component should be in the document
    const sidebarElement = screen.getByRole('navigation').parentElement;
    expect(sidebarElement).toBeInTheDocument();
  });

  test('cleanup function removes resize event listener', () => {
    const { unmount } = render(<Sidebar activePath="/" />);
    
    // Unmount the component
    unmount();
    
    // Check if removeEventListener was called with 'resize'
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  test('displays all menu items correctly when expanded', async () => {
    const user = userEvent.setup();
    render(<Sidebar activePath="/" />);
    
    // Expand the sidebar
    const toggleButton = screen.getAllByRole('button').find(button => 
      button.classList.contains('absolute')
    );
    await user.click(toggleButton);
    
    // Check all menu item labels
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Hazards')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Task Acceptance')).toBeInTheDocument();
  });
});