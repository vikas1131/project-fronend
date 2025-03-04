import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import AdminEngineerApproval from './AdminEngineerApproval';
import { fetchAllEngineers, fetchAllApprovedEngineers, approveEngineer } from '../../redux/Slice/AdminSlice';

// --- Mock the Loading component ---
jest.mock('../../compoents/Loadingpage', () => {
  return function MockLoading() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// --- Mock the AdminSlice actions ---
jest.mock('../../redux/Slice/AdminSlice', () => ({
  fetchAllEngineers: jest.fn(() => ({ type: 'FETCH_ALL_ENGINEERS' })),
  fetchAllApprovedEngineers: jest.fn(() => ({ type: 'FETCH_ALL_APPROVED_ENGINEERS' })),
  approveEngineer: jest.fn((payload) => ({ type: 'APPROVE_ENGINEER', payload })),
}));

// --- Helper functions for creating a mock Redux store ---
const createMockStore = (initialState) => {
  return createStore(() => initialState);
};

const renderWithProviders = (component, store) => {
  return render(
    <MemoryRouter>
      <Provider store={store}>
        {component}
      </Provider>
    </MemoryRouter>
  );
};

describe('AdminEngineerApproval Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    const store = createMockStore({
      admin: {
        engineers: [],
        loading: true,
        error: null,
      },
    });
    renderWithProviders(<AdminEngineerApproval />, store);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const errorMessage = 'Failed to load engineers';
    const store = createMockStore({
      admin: {
        engineers: [],
        loading: false,
        error: errorMessage,
      },
    });
    renderWithProviders(<AdminEngineerApproval />, store);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders no engineers available when list is empty', () => {
    const store = createMockStore({
      admin: {
        engineers: [],
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<AdminEngineerApproval />, store);
    expect(screen.getByText('No engineers available.')).toBeInTheDocument();
  });

  test('renders engineers correctly with proper button states', () => {
    const engineers = [
      {
        _id: '1',
        name: 'Engineer One',
        email: 'one@example.com',
        phone: '1234567890',
        specialization: 'Frontend',
        isEngineer: false, // pending approval: Approve enabled, Disapprove disabled
      },
      {
        _id: '2',
        name: 'Engineer Two',
        email: 'two@example.com',
        phone: '0987654321',
        specialization: 'Backend',
        isEngineer: true, // already approved: Approve disabled, Disapprove enabled
      },
    ];
    const store = createMockStore({
      admin: {
        engineers,
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<AdminEngineerApproval />, store);

    // Check that the details are rendered
    expect(screen.getByText('Engineer One')).toBeInTheDocument();
    expect(screen.getByText('Email: one@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: 1234567890')).toBeInTheDocument();
    expect(screen.getByText('Specialization: Frontend')).toBeInTheDocument();

    expect(screen.getByText('Engineer Two')).toBeInTheDocument();
    expect(screen.getByText('Email: two@example.com')).toBeInTheDocument();
    expect(screen.getByText('Phone: 0987654321')).toBeInTheDocument();
    expect(screen.getByText('Specialization: Backend')).toBeInTheDocument();

    // Check button states using accessible role and name
    const approveBtns = screen.getAllByRole('button', { name: 'Approve' });
    const disapproveBtns = screen.getAllByRole('button', { name: 'Disapprove' });

    // For Engineer One (pending approval)
    expect(approveBtns[0]).not.toBeDisabled();
    expect(disapproveBtns[0]).toBeDisabled();

    // For Engineer Two (already approved)
    expect(approveBtns[1]).toBeDisabled();
    expect(disapproveBtns[1]).not.toBeDisabled();
  });

  test('dispatches fetchAllEngineers on mount', () => {
    const store = createMockStore({
      admin: {
        engineers: [],
        loading: false,
        error: null,
      },
    });
    // Override dispatch so we can track calls
    store.dispatch = jest.fn(() => ({}));
    renderWithProviders(<AdminEngineerApproval />, store);
    // The useEffect should dispatch fetchAllEngineers immediately on mount
    expect(store.dispatch).toHaveBeenCalledWith(fetchAllEngineers());
  });

  describe('handleApproval function', () => {
    let store;
    const engineers = [
      {
        _id: '1',
        name: 'Engineer One',
        email: 'one@example.com',
        phone: '1234567890',
        specialization: 'Frontend',
        isEngineer: false, // pending approval → Approve button enabled
      },
      {
        _id: '2',
        name: 'Engineer Two',
        email: 'two@example.com',
        phone: '0987654321',
        specialization: 'Backend',
        isEngineer: true, // approved → Disapprove button enabled
      },
    ];

    beforeEach(() => {
      jest.useFakeTimers();
      store = createMockStore({
        admin: {
          engineers,
          loading: false,
          error: null,
        },
      });
      // Override dispatch so that when the approve action is dispatched, it returns a promise
      store.dispatch = jest.fn((action) => {
        if (action.type === 'APPROVE_ENGINEER') {
          return Promise.resolve(action);
        }
        return action;
      });
      renderWithProviders(<AdminEngineerApproval />, store);
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('handles approval (approve) correctly', async () => {
      // For Engineer One: Approve button should be enabled
      const approveBtns = screen.getAllByRole('button', { name: 'Approve' });
      await act(async () => {
        fireEvent.click(approveBtns[0]);
      });
      // Expect that dispatch was called with the approveEngineer action
      expect(store.dispatch).toHaveBeenCalledWith(
        approveEngineer({ engineerEmail: 'one@example.com', approve: true })
      );
      // Advance timers by 500ms to simulate the setTimeout in handleApproval
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      // After the timeout, the component should dispatch both fetchAllApprovedEngineers and fetchAllEngineers
      expect(store.dispatch).toHaveBeenCalledWith(fetchAllApprovedEngineers());
      expect(store.dispatch).toHaveBeenCalledWith(fetchAllEngineers());
    });

    test('handles approval (disapprove) correctly', async () => {
      // For Engineer Two: Disapprove button should be enabled
      const disapproveBtns = screen.getAllByRole('button', { name: 'Disapprove' });
      await act(async () => {
        fireEvent.click(disapproveBtns[1]);
      });
      // Expect that dispatch was called with the approveEngineer action (with approve false)
      expect(store.dispatch).toHaveBeenCalledWith(
        approveEngineer({ engineerEmail: 'two@example.com', approve: false })
      );
      // Advance timers by 500ms to simulate the setTimeout in handleApproval
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      // After the timeout, the component should dispatch both fetchAllApprovedEngineers and fetchAllEngineers
      expect(store.dispatch).toHaveBeenCalledWith(fetchAllApprovedEngineers());
      expect(store.dispatch).toHaveBeenCalledWith(fetchAllEngineers());
    });
  });
});