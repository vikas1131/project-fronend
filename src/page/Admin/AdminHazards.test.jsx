import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import AdminHazards from './AdminHazards';
import { HazardsTickets, HazardsUpdateTickets, HazardsDeleteTickets } from '../../redux/Slice/EngineerSlice';
import { toast } from 'react-toastify';

// --- Dummy reducer for store creation ---
const dummyReducer = (state = {}) => state;
const createMockStore = (initialState) => createStore(dummyReducer, initialState);

// --- Mock react-toastify ---
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// --- Mock react-redux's hooks ---
jest.mock('react-redux', () => {
  const ActualReactRedux = jest.requireActual('react-redux');
  return {
    ...ActualReactRedux,
    useDispatch: jest.fn(),
    useSelector: jest.fn(),
  };
});

// --- Mock EngineerSlice actions ---
jest.mock('../../redux/Slice/EngineerSlice', () => ({
  HazardsTickets: jest.fn(),
  HazardsUpdateTickets: jest.fn(),
  HazardsDeleteTickets: jest.fn(),
}));

describe('AdminHazards Component', () => {
  let store;
  let dispatchMock;
  const mockHazards = [
    {
      _id: '1',
      hazardType: 'Electrical',
      description: 'Exposed wiring near water source',
      riskLevel: 'high',
      address: '123 Main St',
      pincode: '12345',
    },
    {
      _id: '2',
      hazardType: 'Chemical',
      description: 'Improper storage of flammable materials',
      riskLevel: 'medium',
      address: '456 Oak Ave',
      pincode: '67890',
    },
    {
      _id: '3',
      hazardType: 'Structural',
      description: 'Weak support beams',
      riskLevel: 'low',
      address: '789 Pine Rd',
      pincode: '54321',
    },
  ];
  const initialState = {
    engineer: {
      Hazards: mockHazards,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    dispatchMock = jest.fn();
    // Set up useDispatch and useSelector mocks.
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((selector) => selector(initialState));
    // Clear our action mocks.
    HazardsTickets.mockClear();
    HazardsUpdateTickets.mockClear();
    HazardsDeleteTickets.mockClear();
    toast.success.mockClear();
    // Create a dummy store (even though useSelector is mocked).
    store = createMockStore(initialState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('dispatches HazardsTickets on mount', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    expect(HazardsTickets).toHaveBeenCalledWith({});
  });

  test('renders hazard cards correctly', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('Hazards Tasks')).toBeInTheDocument();
    expect(screen.getByText('Harzard : Electrical')).toBeInTheDocument();
    expect(screen.getByText('Harzard : Chemical')).toBeInTheDocument();
    expect(screen.getByText('Harzard : Structural')).toBeInTheDocument();
  });

  test('search functionality filters hazards correctly', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    const searchInput = screen.getByPlaceholderText('Search by hazard type');
    // Our filtering uses task.pincode; type a value that matches only Electrical hazard.
    fireEvent.change(searchInput, { target: { value: '12345' } });
    expect(screen.getByText('Harzard : Electrical')).toBeInTheDocument();
    expect(screen.queryByText('Harzard : Chemical')).not.toBeInTheDocument();
    expect(screen.queryByText('Harzard : Structural')).not.toBeInTheDocument();
  });

  test('clicking on hazard card opens modal with details', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    const hazardCard = screen.getByText('Harzard : Electrical').closest('div');
    fireEvent.click(hazardCard);
    // Modal should now show details of the selected hazard.
    expect(screen.getByText('Exposed wiring near water source')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Pincode: 12345')).toBeInTheDocument();
  });

  test('update button in modal opens update form with pre-populated data', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    // Open modal by clicking a hazard card.
    const hazardCard = screen.getByText('Harzard : Electrical').closest('div');
    fireEvent.click(hazardCard);
    // Click update button inside modal.
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    // Update modal should be visible and pre-filled.
    expect(screen.getByText('Update Hazard')).toBeInTheDocument();
    const hazardTypeInput = screen.getByPlaceholderText('Hazard Type');
    expect(hazardTypeInput.value).toBe('Electrical');
  });

  test('submitting update form dispatches HazardsUpdateTickets', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    // Open modal and then update modal.
    const hazardCard = screen.getByText('Harzard : Electrical').closest('div');
    fireEvent.click(hazardCard);
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    // Modify one field.
    const hazardTypeInput = screen.getByPlaceholderText('Hazard Type');
    fireEvent.change(hazardTypeInput, { target: { value: 'Updated Electrical' } });
    // Submit the update form.
    const submitButton = screen.getByRole('button', { name: 'Update' });
    fireEvent.click(submitButton);
    expect(HazardsUpdateTickets).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: '1',
        hazardType: 'Updated Electrical',
        description: 'Exposed wiring near water source',
        riskLevel: 'high',
        address: '123 Main St',
        pincode: '12345',
      })
    );
  });

  test('delete button dispatches HazardsDeleteTickets and shows toast', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    // Open modal.
    const hazardCard = screen.getByText('Harzard : Electrical').closest('div');
    fireEvent.click(hazardCard);
    // Click the delete button.
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(HazardsDeleteTickets).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith("Hazards deleted successfully!");
  });

  test('handles input changes in update form', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    // Open modal and then update modal.
    const hazardCard = screen.getByText('Harzard : Electrical').closest('div');
    fireEvent.click(hazardCard);
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    // Change various form fields.
    const hazardTypeInput = screen.getByPlaceholderText('Hazard Type');
    const descriptionInput = screen.getByPlaceholderText('Description');
    const riskLevelSelect = screen.getByDisplayValue('Select Risk Level');
    const addressInput = screen.getByPlaceholderText('Address');
    const pincodeInput = screen.getByPlaceholderText('Pincode');
    fireEvent.change(hazardTypeInput, { target: { value: 'New Hazard' } });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    fireEvent.change(riskLevelSelect, { target: { value: 'medium' } });
    fireEvent.change(addressInput, { target: { value: 'New address' } });
    fireEvent.change(pincodeInput, { target: { value: '00000' } });
    expect(hazardTypeInput.value).toBe('New Hazard');
    expect(descriptionInput.value).toBe('New description');
    expect(riskLevelSelect.value).toBe('medium');
    expect(addressInput.value).toBe('New address');
    expect(pincodeInput.value).toBe('00000');
  });

  test('renders toast container and add hazards button links correctly', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    const addButton = screen.getByText('Add Hazards');
    expect(addButton.closest('a')).toHaveAttribute('href', '/admin/hazardsTickets');
  });

  test('handles getHazardStyles for unknown risk level', () => {
    // Create a hazard with an unknown risk level.
    const unknownHazard = {
      _id: '4',
      hazardType: 'Unknown',
      description: 'Unknown risk level',
      riskLevel: 'unknown',
      address: 'No address',
      pincode: '00000',
    };
    const customState = {
      engineer: {
        Hazards: [unknownHazard],
        loading: false,
        error: null,
      },
    };
    useSelector.mockImplementation((selector) => selector(customState));
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    const hazardCard = screen.getByText('Harzard : Unknown').closest('div');
    expect(hazardCard.className).toContain('bg-gray-200');
  });

  test('renders "Hazards not founds" when no hazards available', () => {
    const customState = {
      engineer: {
        Hazards: [],
        loading: false,
        error: null,
      },
    };
    useSelector.mockImplementation((selector) => selector(customState));
    render(
      <MemoryRouter>
        <Provider store={store}>
          <AdminHazards />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('Hazards not founds')).toBeInTheDocument();
  });
});