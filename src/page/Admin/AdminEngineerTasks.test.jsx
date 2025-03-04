import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminEngineerTasks from './AdminEngineerTasks';

// Mock child components
jest.mock('./NavBar', () => () => <div data-testid="admin-navbar">Mock NavBar</div>);

jest.mock('./AdminTaskCard', () => ({ task }) => <div data-testid="admin-task-card">{task.title}</div>);

// Mock Redux dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('AdminEngineerTasks Component', () => {
  const createMockStore = (initialState) => createStore(() => initialState);

  const renderWithProviders = (component, store, route) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Provider store={store}>
          <Routes>
            <Route path="/admin/engineer-tasks/:email" element={component} />
          </Routes>
        </Provider>
      </MemoryRouter>
    );
  };

  test('renders loading state correctly', () => {
    const store = createMockStore({
      admin: { tasks: [], loading: true, error: null },
    });

    renderWithProviders(<AdminEngineerTasks />, store, '/admin/engineer-tasks/test@example.com');

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const store = createMockStore({
      admin: { tasks: [], loading: false, error: 'Failed to fetch tasks' },
    });

    renderWithProviders(<AdminEngineerTasks />, store, '/admin/engineer-tasks/test@example.com');

    expect(screen.getByText('Error: Failed to fetch tasks')).toBeInTheDocument();
  });

  test('renders empty state when no tasks assigned', () => {
    const store = createMockStore({
      admin: { tasks: [], loading: false, error: null },
    });

    renderWithProviders(<AdminEngineerTasks />, store, '/admin/engineer-tasks/test@example.com');

    expect(screen.getByText('No tasks assigned.')).toBeInTheDocument();
  });

  test('renders assigned tasks correctly', () => {
    const store = createMockStore({
      admin: {
        tasks: [
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
        ],
        loading: false,
        error: null,
      },
    });

    renderWithProviders(<AdminEngineerTasks />, store, '/admin/engineer-tasks/test@example.com');

    expect(screen.getByTestId('admin-navbar')).toBeInTheDocument();
    const taskCards = screen.getAllByTestId('admin-task-card');
    expect(taskCards).toHaveLength(2);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  test('dispatches fetchEngineerTasks on mount', () => {
    const mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);

    const store = createMockStore({
      admin: { tasks: [], loading: false, error: null },
    });

    renderWithProviders(<AdminEngineerTasks />, store, '/admin/engineer-tasks/test@example.com');

    expect(mockDispatch).toHaveBeenCalled();
  });
});
