import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import EngineerHazards from './Hazards';
import { HazardsTickets, HazardsUpdateTickets, HazardsDeleteTickets } from '../../redux/Slice/EngineerSlice';
import '@testing-library/jest-dom';

// Mock the redux modules
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
  useSelector: jest.fn()
}));

// Mock the react-toastify module
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock redux actions
jest.mock('../../redux/Slice/EngineerSlice', () => ({
  HazardsTickets: jest.fn(),
  HazardsUpdateTickets: jest.fn(),
  HazardsDeleteTickets: jest.fn(),
}));

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Create a simple mock store
const mockStore = {
  getState: jest.fn(),
  subscribe: jest.fn(),
  dispatch: jest.fn()
};

// Set up mock data
const mockHazards = [
  {
    _id: '1',
    hazardType: 'Electrical',
    description: 'Exposed wiring in the basement',
    riskLevel: 'high',
    address: '123 Main St',
    pincode: '12345',
  },
  {
    _id: '2',
    hazardType: 'Gas Leak',
    description: 'Potential gas leak in the kitchen area',
    riskLevel: 'medium',
    address: '456 Oak Ave',
    pincode: '67890',
  },
  {
    _id: '3',
    hazardType: 'Water Damage',
    description: 'Ceiling water damage',
    riskLevel: 'low',
    address: '789 Pine Rd',
    pincode: '54321',
  },
];

describe('EngineerHazards Component', () => {
  beforeEach(() => {
    // Set up the useSelector mock to return our mock data
    require('react-redux').useSelector.mockImplementation((selector) => {
      return {
        Hazards: mockHazards,
        loading: false,
        error: null
      };
    });
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Test 1: Component renders correctly with hazards
  test('renders hazards list correctly', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Hazards Tasks')).toBeInTheDocument();
    expect(screen.getByText(/Hazard : Electrical/i)).toBeInTheDocument();
    expect(screen.getByText(/Hazard : Gas Leak/i)).toBeInTheDocument();
    expect(screen.getByText(/Hazard : Water Damage/i)).toBeInTheDocument();
    expect(HazardsTickets).toHaveBeenCalled();
  });

  // Test 2: Search functionality works correctly
  test('search filter works correctly', async () => {
    // Change the useSelector implementation for this specific test
    require('react-redux').useSelector.mockImplementation((selector) => {
      return {
        Hazards: mockHazards,
        loading: false,
        error: null
      };
    });
    
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Search by hazard type');
    fireEvent.change(searchInput, { target: { value: 'Electrical' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText(/Hazard : Electrical/i)).toBeInTheDocument();
      expect(screen.queryByText(/Hazard : Gas Leak/i)).not.toBeInTheDocument();
    }, { timeout: 600 });
  });

  // Test 3: Modal opens when hazard is clicked
  test('details modal opens when hazard is clicked', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    
    expect(screen.getByText('Risk Level')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Pincode: 12345')).toBeInTheDocument();
  });

  // Test 4: Update modal opens correctly
  test('update modal opens when update button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Update'));
    
    expect(screen.getByText('Update Hazard')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hazard Type')).toHaveValue('Electrical');
    expect(screen.getByPlaceholderText('Description')).toHaveValue('Exposed wiring in the basement');
  });

  // Test 5: Update functionality works correctly
  test('update form submits correctly', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Update'));
    
    const hazardTypeInput = screen.getByPlaceholderText('Hazard Type');
    fireEvent.change(hazardTypeInput, { target: { value: 'Updated Electrical Hazard' } });
    
    fireEvent.click(screen.getByText('Update'));
    
    expect(HazardsUpdateTickets).toHaveBeenCalled();
  });

  // Test 6: Delete functionality works correctly
  test('delete button works correctly', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Delete'));
    
    expect(HazardsDeleteTickets).toHaveBeenCalled();
  });

  // Test 7: Modal closes when close button is clicked
  test('modal closes when close button is clicked', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    expect(screen.getByText('Risk Level')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Risk Level')).not.toBeInTheDocument();
  });

  // Test 8: Update modal closes when cancel is clicked
  test('update modal closes when cancel is clicked', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Update'));
    expect(screen.getByText('Update Hazard')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Update Hazard')).not.toBeInTheDocument();
  });

  // Test 9: Correct styles are applied based on risk level
  test('applies correct styles based on risk level', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    // Find the hazard elements by text and then get their parent div
    const highRiskHazard = screen.getByText(/Hazard : Electrical/i).closest('div');
    const mediumRiskHazard = screen.getByText(/Hazard : Gas Leak/i).closest('div');
    const lowRiskHazard = screen.getByText(/Hazard : Water Damage/i).closest('div');
    
    expect(highRiskHazard).toHaveClass('bg-red-200');
    expect(mediumRiskHazard).toHaveClass('bg-orange-200');
    expect(lowRiskHazard).toHaveClass('bg-yellow-200');
  });

  // Test 10: Displays "Hazards not found" when no hazards match search
  test('displays "Hazards not found" when no hazards match search', async () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    const searchInput = screen.getByPlaceholderText('Search by hazard type');
    fireEvent.change(searchInput, { target: { value: 'NonExistentHazard' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText('Hazards not founds')).toBeInTheDocument();
    }, { timeout: 600 });
  });

  // Test 11: "Add Hazards" button navigates to correct route
  test('"Add Hazards" button has the correct link', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    const addButton = screen.getByText('Add Hazards');
    expect(addButton.closest('a')).toHaveAttribute('href', '/engineer/RiseTickets');
  });

  // Test 12: Test for correct handling of empty hazards list
  test('handles empty hazards list correctly', () => {
    // Override the useSelector mock to return empty hazards array
    require('react-redux').useSelector.mockImplementation((selector) => {
      return {
        Hazards: [],
        loading: false,
        error: null
      };
    });
    
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText('Hazards not founds')).toBeInTheDocument();
  });

  // Test 13: Test the correct rendering of the toast container
  test('renders toast container correctly', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  // Test 14: Form validation - all fields are required
  test('form validation requires all fields', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Update'));
    
    const hazardTypeInput = screen.getByPlaceholderText('Hazard Type');
    const descriptionInput = screen.getByPlaceholderText('Description');
    const addressInput = screen.getByPlaceholderText('Address');
    const pincodeInput = screen.getByPlaceholderText('Pincode');
    
    // Check that the inputs have the required attribute
    expect(hazardTypeInput).toHaveAttribute('required');
    expect(descriptionInput).toHaveAttribute('required');
    expect(addressInput).toHaveAttribute('required');
    expect(pincodeInput).toHaveAttribute('required');
  });

  // Test 15: Risk level options in the update form
  test('risk level select has correct options', () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EngineerHazards />
        </BrowserRouter>
      </Provider>
    );
    
    fireEvent.click(screen.getByText(/Hazard : Electrical/i));
    fireEvent.click(screen.getByText('Update'));
    
    expect(screen.getByText('Select Risk Level')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});