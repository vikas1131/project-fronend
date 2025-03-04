import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskCard from './TaskCard';

// Mock the window.location
const mockLocation = {
  pathname: '',
};

// Save the original implementation
const originalLocation = window.location;

// Mock data for testing
const mockTask = {
  _id: '123',
  serviceType: 'Plumbing',
  status: 'open',
  description: 'Fix the leaky faucet',
  address: '123 Main St',
  pincode: '12345',
  priority: 'high',
  customer: {
    name: 'John Doe',
    contact: '555-1234'
  },
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-02T00:00:00.000Z'
};

// Mock functions
const mockOnAccept = jest.fn();
const mockOnReject = jest.fn();

describe('TaskCard Component', () => {
  beforeAll(() => {
    // Define window.location
    delete window.location;
    window.location = { ...mockLocation };
  });

  afterAll(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders the task card with all task details', () => {
    window.location.pathname = '/engineer/assignedTasks';
    
    render(
      <TaskCard 
        task={mockTask} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Check if all the task details are rendered
    expect(screen.getByText(/Service Type : Plumbing/i)).toBeInTheDocument();
    expect(screen.getByText(/Status: open/i)).toBeInTheDocument();
    expect(screen.getByText(/Description : Fix the leaky faucet/i)).toBeInTheDocument();
    expect(screen.getByText(/Address : 123 Main St/i)).toBeInTheDocument();
    expect(screen.getByText(/Pincode : 12345/i)).toBeInTheDocument();
    expect(screen.getByText(/Priority: high/i)).toBeInTheDocument();
    
    // Check if customer info is rendered
    expect(screen.getByText(/Customer Info/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/555-1234/i)).toBeInTheDocument();
    
    // Check if dates are rendered
    expect(screen.getByText(/Created: 1\/1\/2023/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated: 1\/2\/2023/i)).toBeInTheDocument();
  });

  test('does not show action buttons on assignedTasks page', () => {
    window.location.pathname = '/engineer/assignedTasks';
    
    render(
      <TaskCard 
        task={mockTask} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Check that accept/reject buttons are not rendered
    expect(screen.queryByText(/Accept/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reject/i)).not.toBeInTheDocument();
  });

  test('shows action buttons on task acceptance page', () => {
    window.location.pathname = '/engineer/task/acceptance';
    
    render(
      <TaskCard 
        task={mockTask} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Check if accept/reject buttons are rendered
    expect(screen.getByText(/Accept/i)).toBeInTheDocument();
    expect(screen.getByText(/Reject/i)).toBeInTheDocument();
  });

  test('calls onAccept when accept button is clicked', () => {
    window.location.pathname = '/engineer/task/acceptance';
    
    render(
      <TaskCard 
        task={mockTask} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Click the accept button
    fireEvent.click(screen.getByText(/Accept/i));
    
    // Check if onAccept was called with the task id
    expect(mockOnAccept).toHaveBeenCalledWith('123');
  });

  test('calls onReject when reject button is clicked', () => {
    window.location.pathname = '/engineer/task/acceptance';
    
    render(
      <TaskCard 
        task={mockTask} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Click the reject button
    fireEvent.click(screen.getByText(/Reject/i));
    
    // Check if onReject was called with the task id
    expect(mockOnReject).toHaveBeenCalledWith('123');
  });

  test('handles task without customer information', () => {
    const taskWithoutCustomer = { ...mockTask, customer: null };
    
    render(
      <TaskCard 
        task={taskWithoutCustomer} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Check that customer info section is not rendered
    expect(screen.queryByText(/Customer Info/i)).not.toBeInTheDocument();
  });

  test('displays correct status styling for different statuses', () => {
    const statuses = [
      { status: 'completed', expectedClass: 'text-green-600 bg-green-100 px-2 py-1 rounded-full' },
      { status: 'in-progress', expectedClass: 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full' },
      { status: 'open', expectedClass: 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full' },
      { status: 'failed', expectedClass: 'text-red-600 bg-red-100 px-2 py-1 rounded-full' },
      { status: 'unknown', expectedClass: 'text-gray-600 bg-gray-100 px-2 py-1 rounded-full' }
    ];

    statuses.forEach(({ status, expectedClass }) => {
      const { unmount } = render(
        <TaskCard 
          task={{ ...mockTask, status }} 
          onAccept={mockOnAccept} 
          onReject={mockOnReject} 
        />
      );
      
      const statusElement = screen.getByText(`Status: ${status}`);
      expect(statusElement).toHaveClass(expectedClass);
      
      unmount();
    });
  });

  test('displays correct priority colors for different priorities', () => {
    const priorities = [
      { priority: 'high', expectedClass: 'bg-red-500' },
      { priority: 'medium', expectedClass: 'bg-yellow-500' },
      { priority: 'low', expectedClass: 'bg-green-500' },
      { priority: 'unknown', expectedClass: 'bg-gray-400' }
    ];

    priorities.forEach(({ priority, expectedClass }) => {
      const { unmount, container } = render(
        <TaskCard 
          task={{ ...mockTask, priority }} 
          onAccept={mockOnAccept} 
          onReject={mockOnReject} 
        />
      );
      
      // Find the priority indicator dot (the small circle element before the priority text)
      const priorityIndicator = container.querySelector('.flex.items-center.gap-2 .rounded-full');
      expect(priorityIndicator).toHaveClass(expectedClass);
      
      unmount();
    });
  });

  test('handles null or undefined status and priority', () => {
    const taskWithNulls = { 
      ...mockTask, 
      status: null, 
      priority: null 
    };
    
    const { container } = render(
      <TaskCard 
        task={taskWithNulls} 
        onAccept={mockOnAccept} 
        onReject={mockOnReject} 
      />
    );
    
    // Check default styling for null status
    const statusElement = screen.getByText('Status:');
    expect(statusElement).toHaveClass('text-gray-600 bg-gray-100 px-2 py-1 rounded-full');
    
    // Check default styling for null priority - target the specific priority indicator dot
    const priorityIndicator = container.querySelector('.flex.items-center.gap-2 .rounded-full');
    expect(priorityIndicator).toHaveClass('bg-gray-400');
  });
});