import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import AdminEngineerList from './AdminEngineerList';
import { waitFor } from '@testing-library/react';

// Mock child components
jest.mock('./NavBar', () => () => <div data-testid="admin-navbar">Mock NavBar</div>);
jest.mock('../../compoents/Loadingpage', () => () => <div data-testid="loading">Loading...</div>);

// Mock useDispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

describe('AdminEngineerList Component', () => {
  const createMockStore = (initialState) => createStore(() => initialState);

  const renderWithProviders = (component, store) => {
    return render(
      <MemoryRouter>
        <Provider store={store}>{component}</Provider>
      </MemoryRouter>
    );
  };

  test('renders loading state correctly', () => {
    const store = createMockStore({
      admin: { approvedEngineers: [], loading: true, error: null },
    });
    renderWithProviders(<AdminEngineerList />, store);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const store = createMockStore({
      admin: { approvedEngineers: [], loading: false, error: 'Failed to load' },
    });
    renderWithProviders(<AdminEngineerList />, store);
    expect(screen.getByText('Error: Failed to load')).toBeInTheDocument();
  });

  test('renders empty state correctly', () => {
    const store = createMockStore({
      admin: { approvedEngineers: [], loading: false, error: null },
    });
    renderWithProviders(<AdminEngineerList />, store);
    expect(screen.getByText('No engineers available.')).toBeInTheDocument();
  });

  test('renders engineers correctly', () => {
    const store = createMockStore({
      admin: {
        approvedEngineers: [
          { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', specialization: 'fault' },
          { _id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '0987654321', specialization: 'installation' },
        ],
        loading: false,
        error: null,
      },
    });
    renderWithProviders(<AdminEngineerList />, store);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  test('filters engineers by name', async () => {
  const store = createMockStore({
    admin: {
      approvedEngineers: [
        { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', specialization: 'fault' },
        { _id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '0987654321', specialization: 'installation' },
      ],
      loading: false,
      error: null,
    },
  });

  renderWithProviders(<AdminEngineerList />, store);

  const searchInput = screen.getByPlaceholderText('Search engineers by name...');
  fireEvent.change(searchInput, { target: { value: 'John' } });

  // Wait for the debounce effect to update the UI
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  });
  });
    
  test('dispatches fetchAllApprovedEngineers on mount', () => {
    const mockDispatch = jest.fn();
    jest.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
    const store = createMockStore({
      admin: { approvedEngineers: [], loading: false, error: null },
    });
    renderWithProviders(<AdminEngineerList />, store);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
