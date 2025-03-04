import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EngineerNavbar from './Navbar'; // Adjust the import path as needed

// Mock the dispatch function
const mockDispatch = jest.fn();

// Mock the notification component
jest.mock('./../../compoents/notification', () => () => (
  <div data-testid="notification-component">Notification Component</div>
));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn().mockReturnValue('testuser@example.com'),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Mock react-redux hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(callback => 
    callback({
      notifications: {
        notifications: [
          { id: 1, message: 'Test notification 1', isRead: false },
          { id: 2, message: 'Test notification 2', isRead: false },
          { id: 3, message: 'Test notification 3', isRead: true }
        ]
      }
    })
  )
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

describe('EngineerNavbar Component', () => {
  const toggleSidebar = jest.fn();
  const mockStore = configureStore([]);
  const store = mockStore({
    notifications: {
      notifications: [
        { id: 1, message: 'Test notification 1', isRead: false },
        { id: 2, message: 'Test notification 2', isRead: false },
        { id: 3, message: 'Test notification 3', isRead: true }
      ]
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the navbar with correct title', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Telecom Services')).toBeInTheDocument();
  });

  test('fetches notifications on component mount', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    expect(mockDispatch).toHaveBeenCalled();
  });

  test('displays correct unread notification count badge', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  test('displays username from session storage', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('toggles notification component when bell icon is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    // Find all buttons
    const buttons = screen.getAllByRole('button');
    
    // Find the bell button (it has an SVG child and contains the notification count)
    const bellButton = buttons.find(button => 
      button.querySelector('svg') && button.textContent.includes('2')
    );
    
    // Click the bell button
    fireEvent.click(bellButton);
    
    // Check that notification component is shown
    expect(screen.getByTestId('notification-component')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(bellButton);
    
    // Should no longer be visible
    expect(screen.queryByTestId('notification-component')).not.toBeInTheDocument();
  });

  test('toggles profile dropdown when profile is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    // Find the profile button
    const profileButton = screen.getByText('testuser').closest('button');
    
    // Click to show dropdown
    fireEvent.click(profileButton);
    
    // Check dropdown is visible
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(profileButton);
    
    // Should no longer be visible
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('calls toggleSidebar function when menu button is clicked', () => {
    // Set up a smaller viewport
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    // Find the menu button (should be the first button in mobile view)
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons[0]; // First button in mobile view
    
    // Click the menu button
    fireEvent.click(menuButton);
    
    // Check toggleSidebar was called
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
  
  test('renders Logout link correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EngineerNavbar toggleSidebar={toggleSidebar} />
        </BrowserRouter>
      </Provider>
    );
    
    // Find the profile button and click it
    const profileButton = screen.getByText('testuser').closest('button');
    fireEvent.click(profileButton);
    
    // Check logout link
    const logoutLink = screen.getByText('Logout');
    expect(logoutLink.closest('a')).toHaveAttribute('href', '/logout');
  });
});