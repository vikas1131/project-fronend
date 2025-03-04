// src/components/AdminCompletedTasks.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import AdminCompletedTasks from './AdminCompletedTasks';

// Mock the child components
jest.mock('./NavBar', () => {
  return function MockNavBar() {
    return <div data-testid="admin-navbar">Mock NavBar</div>;
  };
});

jest.mock('./AdminTaskCard', () => {
  return function MockTaskCard({ task }) {
    return <div data-testid="admin-task-card">{task.title}</div>;
  };
});

// Mock Redux dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('AdminCompletedTasks Component', () => {
  // Helper function to create a mock store
  const createMockStore = (initialState) => {
    return createStore(() => initialState);
  };

  // Helper function to render with providers
  const renderWithProviders = (component, store) => {
    return render(
      <MemoryRouter>
        <Provider store={store}>
          {component}
        </Provider>
      </MemoryRouter>
    );
  };

  test('renders loading state correctly', () => {
    const store = createMockStore({
      admin: {
        tasks: [],
        loading: true,
        error: null,
      }
    });

    renderWithProviders(<AdminCompletedTasks />, store);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const store = createMockStore({
      admin: {
        tasks: [],
        loading: false,
        error: 'Failed to fetch tasks',
      }
    });

    renderWithProviders(<AdminCompletedTasks />, store);

    expect(screen.getByText('Error: Failed to fetch tasks')).toBeInTheDocument();
  });

  test('renders empty state when no completed tasks', () => {
    const store = createMockStore({
      admin: {
        tasks: [{ id: '1', title: 'Task 1', status: 'pending' }],
        loading: false,
        error: null,
      }
    });

    renderWithProviders(<AdminCompletedTasks />, store);

    expect(screen.getByText('No completed tasks available.')).toBeInTheDocument();
  });

  test('renders completed tasks correctly', () => {
    const store = createMockStore({
      admin: {
        tasks: [
          { id: '1', title: 'Task 1', status: 'completed' },
          { id: '2', title: 'Task 2', status: 'pending' },
          { id: '3', title: 'Task 3', status: 'completed' }
        ],
        loading: false,
        error: null,
      }
    });

    renderWithProviders(<AdminCompletedTasks />, store);

    // Should render NavBar
    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();

    // Should render only completed tasks (2 in our mock data)
    const taskCards = screen.getAllByTestId('admin-task-card');
    expect(taskCards).toHaveLength(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  test('dispatches fetchAllTasks on mount', () => {
    const mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);

    const store = createMockStore({
      admin: {
        tasks: [],
        loading: false,
        error: null,
      }
    });

    renderWithProviders(<AdminCompletedTasks />, store);

    expect(mockDispatch).toHaveBeenCalled();
  });
});