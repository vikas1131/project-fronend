import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  };
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionStorage.setItem('email', 'john.doe@example.com');
  });

  const renderSidebar = (props = {}) => {
    return render(
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    );
  };

  test('renders the sidebar with the correct first name', () => {
    renderSidebar();
    const nameElement = screen.getByText(/john/i);
    expect(nameElement).toBeInTheDocument();
  });

  test('reads isSidebarExpanded from localStorage if present', () => {
    localStorage.setItem('isSidebarExpanded', 'false');
    renderSidebar();
    expect(JSON.parse(localStorage.getItem('isSidebarExpanded'))).toBe(false);
  });

  test('toggles sidebar when toggle button is clicked (desktop)', () => {
    localStorage.setItem('isSidebarExpanded', 'true');
    renderSidebar();
    const toggleButton = screen.getByRole('button', { name: /toggle/i });
    fireEvent.click(toggleButton);
    expect(JSON.parse(localStorage.getItem('isSidebarExpanded'))).toBe(false);
  });

  test('displays menu items and allows navigation', () => {
    renderSidebar({ activePath: '/User' });
    const dashboardBtn = screen.getByText('Dashboard');
    expect(dashboardBtn).toBeInTheDocument();
    expect(dashboardBtn.closest('button')).toHaveClass('bg-blue-600 text-white');
    fireEvent.click(screen.getByText('MyTicket'));
  });

  test('sidebar collapses on mobile when a menu item is clicked', () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    renderSidebar({ isopen: true });
    const firstMenuItem = screen.getByText('Dashboard');
    fireEvent.click(firstMenuItem);
    expect(screen.getByTestId('sidebar-container')).toHaveClass('-translate-x-full');
  });

  test('sidebar hides on mobile when toggled off', () => {
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    renderSidebar({ isopen: false });
    expect(screen.getByTestId('sidebar-container')).toHaveClass('-translate-x-full');
  });

  test('menu items highlight correctly when activePath matches', () => {
    renderSidebar({ activePath: '/User/tickets' });
    const activeMenuItem = screen.getByText('MyTicket');
    expect(activeMenuItem.closest('button')).toHaveClass('bg-blue-600 text-white');
  });
});
