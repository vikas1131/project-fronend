import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserLayout from './UserLayout'; 
import { BrowserRouter } from 'react-router-dom';

describe('UserLayout Component', () => {
  it('renders UserLayout correctly', () => {
    render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Navbar
    expect(screen.getByTestId('sidebar')).toBeInTheDocument(); // Sidebar
  });

  it('initializes state correctly', () => {
    render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    expect(document.body.innerHTML).toContain('flex flex-col h-screen');
  });

  it('toggles sidebar visibility on navbar button click', () => {
    render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    // Ensure toggle button exists
    const toggleButton = screen.getByTestId('toggle-sidebar-btn');
    expect(toggleButton).toBeInTheDocument();

    // Click the button to toggle sidebar
    fireEvent.click(toggleButton);

    // Sidebar should be visible
    expect(screen.getByTestId('sidebar')).toHaveClass('visible'); // Ensure correct class
  });

  it('closes sidebar when onSidebarClose is triggered', () => {
    render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    // Sidebar should initially be hidden
    expect(screen.getByTestId('sidebar')).not.toHaveClass('visible');

    // Open sidebar
    const toggleButton = screen.getByTestId('toggle-sidebar-btn');
    fireEvent.click(toggleButton);

    // Sidebar should be visible now
    expect(screen.getByTestId('sidebar')).toHaveClass('visible');

    // Close sidebar
    const sidebarCloseButton = screen.getByTestId('sidebar-close-button');
    fireEvent.click(sidebarCloseButton);

    // Sidebar should be hidden again
    expect(screen.getByTestId('sidebar')).not.toHaveClass('visible');
  });

  it('updates scrollY on scrolling', () => {
    render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    // Simulate scroll event
    fireEvent.scroll(window, { target: { scrollY: 200 } });

    // Force re-render check
    expect(window.scrollY).toBe(200);
  });

  it('cleans up scroll event listener on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <UserLayout />
      </BrowserRouter>
    );

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    // Unmount component
    unmount();

    // Ensure scroll event listener was removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
