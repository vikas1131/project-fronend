// src/components/Dashboard.test.jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashbord';
import { FaIcon } from 'react-icons/fa';

jest.mock('react-icons/fa', () => ({
  FaIcon: () => <div data-testid="fa-icon" />,
}));

describe('Dashboard', () => {
  test('renders Dashboard component', () => {
    render(<Dashboard />);
    const dashboardElement = screen.getByTestId('dashboard');
    expect(dashboardElement).toBeInTheDocument();
  });

  test('renders FaIcon', () => {
    render(<Dashboard />);
    const iconElement = screen.getByTestId('fa-icon');
    expect(iconElement).toBeInTheDocument();
  });
});