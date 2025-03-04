// TaskSearchBar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskSearchBar from './TaskSearchBar';
import { useDispatch } from 'react-redux';
import { fetchTasksByCriteria } from '../../redux/Slice/AdminSlice';

// Mock the redux hooks and the thunk action
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../redux/Slice/AdminSlice', () => ({
  fetchTasksByCriteria: jest.fn(),
}));

describe('TaskSearchBar Component', () => {
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    // Make the thunk return a dummy action so we can track the dispatch call
    fetchTasksByCriteria.mockReturnValue({ type: 'admin/fetchTasksByCriteria' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders input, select, and button', () => {
    render(<TaskSearchBar />);
    
    expect(screen.getByPlaceholderText(/search tasks/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('updates input value when user types', () => {
    render(<TaskSearchBar />);
    
    const input = screen.getByPlaceholderText(/search tasks/i);
    fireEvent.change(input, { target: { value: 'Test Query' } });
    expect(input.value).toBe('Test Query');
  });

  it('updates select value when user selects an option', () => {
    render(<TaskSearchBar />);
    
    const select = screen.getByRole('combobox');
    // Check default value is "all"
    expect(select.value).toBe('all');

    fireEvent.change(select, { target: { value: 'high' } });
    expect(select.value).toBe('high');
  });

  it('dispatches fetchTasksByCriteria with correct parameters when search button is clicked', () => {
    render(<TaskSearchBar />);
    
    const input = screen.getByPlaceholderText(/search tasks/i);
    const select = screen.getByRole('combobox');
    const button = screen.getByRole('button', { name: /search/i });
    
    // Update the search query and filter values
    fireEvent.change(input, { target: { value: 'query' } });
    fireEvent.change(select, { target: { value: 'medium' } });
    
    // Click the search button to trigger handleSearch
    fireEvent.click(button);
    
    // Verify that fetchTasksByCriteria is called with the correct parameters
    expect(fetchTasksByCriteria).toHaveBeenCalledWith({
      query: 'query',
      priority: 'medium',
    });
    
    // Verify that dispatch is called with the action returned by fetchTasksByCriteria
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'admin/fetchTasksByCriteria' });
  });
});