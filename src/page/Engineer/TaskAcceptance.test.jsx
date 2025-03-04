import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TaskAcceptance from './TaskAcceptance';
import { fetchEngineerTasks, fetchAcceptTask, fetchRejectTask } from '../../redux/Slice/EngineerSlice';

// Mock the dependencies
jest.mock('../../redux/Slice/EngineerSlice', () => ({
  fetchEngineerTasks: jest.fn(),
  fetchAcceptTask: jest.fn(),
  fetchRejectTask: jest.fn(),
}));

jest.mock('../../compoents/Loadingpage', () => () => <div data-testid="loading">Loading...</div>);
jest.mock('./TaskCard', () => ({ task, onAccept, onReject }) => (
  <div data-testid={`task-card-${task._id}`} className="task-card">
    <h3>{task.title}</h3>
    <button onClick={() => onAccept(task._id)} data-testid={`accept-${task._id}`}>Accept</button>
    <button onClick={() => onReject(task._id)} data-testid={`reject-${task._id}`}>Reject</button>
  </div>
));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn().mockReturnValue('test@example.com'),
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Create a simple mock reducer
const mockReducer = (state = {}, action) => state;

describe('TaskAcceptance Component', () => {
  let store;
  const mockTasks = [
    { _id: '1', title: 'Task 1', description: 'Description 1', accepted: false },
    { _id: '2', title: 'Task 2', description: 'Description 2', accepted: false },
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create store with Redux Toolkit's configureStore instead of redux-mock-store
    store = configureStore({
      reducer: mockReducer,
      preloadedState: {
        auth: {
          user: { email: 'test@example.com', name: 'Test User' }
        },
        engineer: {
          tasks: mockTasks,
          loading: false,
          error: null
        }
      }
    });

    // Add dispatch spy
    jest.spyOn(store, 'dispatch');

    // Setup default mock implementations
    fetchEngineerTasks.mockReturnValue({ type: 'engineer/fetchTasks' });
    fetchAcceptTask.mockReturnValue({ type: 'engineer/acceptTask' });
    fetchRejectTask.mockReturnValue({ type: 'engineer/rejectTask' });
  });

  test('renders loading state correctly', () => {
    store = configureStore({
      reducer: mockReducer,
      preloadedState: {
        auth: { user: { email: 'test@example.com' } },
        engineer: { tasks: [], loading: true, error: null }
      }
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('renders expanded state correctly', () => {
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={true} />
      </Provider>
    );
    
    const container = screen.getByText('Pending').closest('div');
    expect(container).toHaveClass('ml-[100px]');
  });

  test('renders collapsed state correctly', () => {
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    const container = screen.getByText('Pending').closest('div');
    expect(container).toHaveClass('ml-[40px]');
  });

  test('fetches tasks on component mount', () => {
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('renders task cards correctly', () => {
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
  });

  test('displays "no tasks" message when no tasks are available', () => {
    store = configureStore({
      reducer: mockReducer,
      preloadedState: {
        auth: { user: { email: 'test@example.com' } },
        engineer: { tasks: [], loading: false, error: null }
      }
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(screen.getByText('No pending tasks found')).toBeInTheDocument();
  });

  test('handles accept task correctly', () => {
    // Setup unwrap mock for the component
    store.dispatch.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true })
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    // Reset to count only calls after rendering
    store.dispatch.mockClear();
    fetchEngineerTasks.mockClear();
    
    fireEvent.click(screen.getByTestId('accept-1'));
    
    expect(fetchAcceptTask).toHaveBeenCalledWith({ 
      taskId: '1', 
      email: 'test@example.com' 
    });
    expect(store.dispatch).toHaveBeenCalled();
    expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
  });

  test('handles reject task correctly', async () => {
    // Setup unwrap mock for the component
    store.dispatch.mockReturnValue({
      unwrap: () => Promise.resolve({ success: true })
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    // Reset to count only calls after rendering
    store.dispatch.mockClear();
    fetchEngineerTasks.mockClear();
    
    fireEvent.click(screen.getByTestId('reject-1'));
    
    expect(fetchRejectTask).toHaveBeenCalledWith({ 
      taskId: '1', 
      email: 'test@example.com' 
    });
    
    await waitFor(() => {
      expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
    });
  });

  test('handles error during accept task', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    store.dispatch.mockImplementation(() => {
      throw new Error('Accept error');
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    // Reset mocks to only count calls after rendering
    store.dispatch.mockClear();
    fetchEngineerTasks.mockClear();
    
    fireEvent.click(screen.getByTestId('accept-1'));
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error accepting task:', expect.any(Error));
    expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
    
    consoleErrorSpy.mockRestore();
  });

  test('handles failed task rejection', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup store.dispatch to return a failed unwrap
    store.dispatch.mockReturnValue({
      unwrap: () => Promise.resolve({ success: false, message: 'Rejection failed' })
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    // Reset mocks to only count calls after rendering
    store.dispatch.mockClear();
    fetchEngineerTasks.mockClear();
    
    fireEvent.click(screen.getByTestId('reject-1'));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Task rejection failed:', 'Rejection failed');
      expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles error during reject task', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Setup store.dispatch to return a rejected unwrap
    store.dispatch.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Reject error'))
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    // Reset mocks to only count calls after rendering
    store.dispatch.mockClear();
    fetchEngineerTasks.mockClear();
    
    fireEvent.click(screen.getByTestId('reject-1'));
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error rejecting task:', expect.any(Error));
      expect(fetchEngineerTasks).toHaveBeenCalledWith('test@example.com');
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('handles non-array tasks data correctly', () => {
    store = configureStore({
      reducer: mockReducer,
      preloadedState: {
        auth: { user: { email: 'test@example.com' } },
        engineer: { tasks: 'invalid data', loading: false, error: null }
      }
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(screen.getByText('No pending tasks found')).toBeInTheDocument();
  });

  test('filters out accepted tasks', () => {
    store = configureStore({
      reducer: mockReducer,
      preloadedState: {
        auth: { user: { email: 'test@example.com' } },
        engineer: { 
          tasks: [
            { _id: '1', title: 'Task 1', accepted: false },
            { _id: '2', title: 'Task 2', accepted: true }, // This should be filtered out
            { _id: '3', title: 'Task 3', accepted: false }
          ], 
          loading: false, 
          error: null 
        }
      }
    });
    
    render(
      <Provider store={store}>
        <TaskAcceptance isExpanded={false} />
      </Provider>
    );
    
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
    expect(screen.queryByTestId('task-card-2')).not.toBeInTheDocument();
  });
});