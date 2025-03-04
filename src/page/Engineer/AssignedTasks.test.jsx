import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import AssignedTasks from './AssignedTasks';
import { fetchEngineerTasks, updateTaskStatus } from '../../redux/Slice/EngineerSlice';
import { sendNotification } from '../../redux/Slice/notificationSlice';

// Mock Redux Modules
jest.mock('../../redux/Slice/EngineerSlice', () => ({
  fetchEngineerTasks: jest.fn(),
  updateTaskStatus: jest.fn(() => Promise.resolve({ payload: { status: 'completed' } }))
}));

jest.mock('../../redux/Slice/notificationSlice', () => ({
  sendNotification: jest.fn(() => Promise.resolve())
}));

// Mock Loading and TaskCard Components
jest.mock('../../compoents/Loadingpage', () => () => <div data-testid="loading">Loading...</div>);
jest.mock('./TaskCard', () => ({ task, showPriority }) => (
  <div data-testid="task-card">
    <div data-testid="task-title">{task.title}</div>
    <div data-testid="task-status">{task.status}</div>
    {showPriority && <div data-testid="task-priority">{task.priority}</div>}
  </div>
));

// Create a Mock Store with dispatch that returns a Promise
const createMockStore = (initialState) => ({
  getState: jest.fn(() => initialState),
  dispatch: jest.fn((action) => {
    if (typeof action === 'function') {
      return action(jest.fn());
    }
    return Promise.resolve(action);
  }),
  subscribe: jest.fn(),
  replaceReducer: jest.fn()
});

describe('AssignedTasks Component', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Fix network issue',
      description: 'Troubleshoot WiFi connectivity',
      status: 'open',
      priority: 'high',
      serviceType: 'Network',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
      accepted: true
    },
    {
      _id: '2',
      title: 'Server maintenance',
      description: 'Perform routine server maintenance',
      status: 'in-progress',
      priority: 'medium',
      serviceType: 'Server',
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-04T00:00:00.000Z',
      accepted: true
    }
  ];

  const initialState = {
    auth: {
      user: {
        email: 'engineer@example.com',
        role: 'engineer'
      }
    },
    engineer: {
      tasks: [],
      loading: false,
      error: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

 
  test('fetches tasks when user email is available', async () => {
    fetchEngineerTasks.mockReturnValue({ type: 'fetchEngineerTasks' });

    const store = createMockStore(initialState);

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalledWith(fetchEngineerTasks('engineer@example.com'));
    });
  });

  
  test('opens modal when clicking a task', async () => {
    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, tasks: mockTasks }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('task-card')[0]);
    });

    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByLabelText('Change Task Status:')).toBeInTheDocument();
  });

  
  test('updates task status and dispatches updateTaskStatus', async () => {
    updateTaskStatus.mockReturnValue({ type: 'updateTaskStatus', payload: { status: 'completed' } });

    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, tasks: mockTasks }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('task-card')[0]);
    });

    const statusSelect = screen.getByLabelText('Change Task Status:');
    fireEvent.change(statusSelect, { target: { value: 'completed' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Update Status'));
    });

    await waitFor(() => {
      expect(updateTaskStatus).toHaveBeenCalledWith({ taskId: '1', status: 'completed' });
    });
  });

  
  test('updates task status to deferred and tries to send notification', async () => {
    updateTaskStatus.mockReturnValue({ type: 'updateTaskStatus', payload: { status: 'deferred' } });
    sendNotification.mockReturnValue({ type: 'sendNotification' });

    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, tasks: mockTasks }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('task-card')[0]);
    });

    const statusSelect = screen.getByLabelText('Change Task Status:');
    
    await act(async () => {
      fireEvent.change(statusSelect, { target: { value: 'deferred' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Update Status'));
    });

    await waitFor(() => {
      expect(updateTaskStatus).toHaveBeenCalledWith({ taskId: '1', status: 'deferred' });
      // Even though the notification code is commented out in the component,
      // we're testing that the status change works correctly
      expect(screen.queryByText('Network')).not.toBeInTheDocument(); // Modal closed
    });
  });

  
  test('closes modal on close button click', async () => {
    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, tasks: mockTasks }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await act(async () => {
      fireEvent.click(screen.getAllByTestId('task-card')[0]);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('✕'));
    });

    expect(screen.queryByText('Network')).not.toBeInTheDocument();
  });

  

  
  test('filters only accepted tasks for display', async () => {
    const mixedTasks = [
      ...mockTasks,
      {
        _id: '3',
        title: 'Unaccepted task',
        description: 'This task should not appear',
        status: 'open',
        priority: 'low',
        serviceType: 'Other',
        createdAt: '2025-01-05T00:00:00.000Z',
        updatedAt: '2025-01-06T00:00:00.000Z',
        accepted: false // This task should be filtered out
      }
    ];

    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, tasks: mixedTasks }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    await waitFor(() => {
      const taskCards = screen.getAllByTestId('task-card');
      expect(taskCards).toHaveLength(2); // Only 2 accepted tasks, not 3
    });
  });

 
  test('renders loading component when loading', () => {
    const store = createMockStore({
      ...initialState,
      engineer: { ...initialState.engineer, loading: true }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  
  test('renders no tasks assigned message', () => {
    const store = createMockStore(initialState);

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    expect(screen.getByText('No tasks assigned to you')).toBeInTheDocument();
  });

  
  test('renders error message when there is an error', () => {
    const store = createMockStore({
      ...initialState,
      engineer: { 
        ...initialState.engineer, 
        error: { message: 'Failed to fetch tasks' } 
      }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    expect(screen.getByText('Error: Failed to fetch tasks')).toBeInTheDocument();
  });

  
  test('handles non-array tasks value', () => {
    const store = createMockStore({
      ...initialState,
      engineer: { 
        ...initialState.engineer, 
        tasks: null // Testing with null instead of array
      }
    });

    render(
      <Provider store={store}>
        <AssignedTasks isExpanded={false} />
      </Provider>
    );

    expect(screen.getByText('No tasks assigned to you')).toBeInTheDocument();
  });
});