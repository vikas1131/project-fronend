import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // For additional jest matchers
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { MemoryRouter } from 'react-router-dom';

describe('Navbar component tests', () => {
  let toggleSidebarMock;
  let consoleLogSpy;

  beforeEach(() => {
    // Mock the sidebar toggle function
    toggleSidebarMock = jest.fn();

    // Mock console.log to track calls
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Restore original console.log
    consoleLogSpy.mockRestore();
  });

  test('renders Telecom Services text and logs username from sessionStorage', () => {
    // By default, sessionStorage is empty => userName = ""
    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebarMock} />
      </BrowserRouter>
    );

    // Check the header text
    expect(screen.getByText(/telecom services/i)).toBeInTheDocument();

    // Check console.log for " userName: "
    expect(consoleLogSpy).toHaveBeenCalledWith(' userName: ');
  });

  test('shows "Guest" when no user is in sessionStorage', () => {
    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebarMock} />
      </BrowserRouter>
    );

    // Guest should appear if no email in sessionStorage
    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  test('shows user name when user is in sessionStorage', () => {
    sessionStorage.setItem('email', 'testuser@example.com');

    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebarMock} />
      </BrowserRouter>
    );

    // The userName is derived by splitting at '@' -> "testuser"
    expect(screen.getByText('testuser')).toBeInTheDocument();
    // Check console.log for the stored user
    expect(consoleLogSpy).toHaveBeenCalledWith(' userName: testuser@example.com');
  });

  

  test('toggles profile dropdown when the user icon is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebarMock} />
      </BrowserRouter>
    );

    // Initially, "Logout" should not be in the document
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();

    // Click the profile button
    const profileButton = screen.getByText('Guest');
    fireEvent.click(profileButton);

    // Now the dropdown with "Logout" should appear
    expect(screen.getByText(/logout/i)).toBeInTheDocument();

    // Clicking profile button again should hide the dropdown
    fireEvent.click(profileButton);
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  test('clicking logout triggers console log and has correct link', () => {
    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebarMock} />
      </BrowserRouter>
    );

    // Open the dropdown
    const profileButton = screen.getByText('Guest');
    fireEvent.click(profileButton);

    // The logout button is present now
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    // Check console log
    expect(consoleLogSpy).toHaveBeenCalledWith('Logout clicked');

    // Verify the link points to /logout
    const logoutLink = screen.getByRole('link', { name: /logout/i });
    expect(logoutLink).toHaveAttribute('href', '/logout');
  });
});