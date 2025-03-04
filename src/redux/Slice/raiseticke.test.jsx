import reducer, {
  submitTicket,
  HazardsTicket
} from './raiseticke';

import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import apiClientUser from '../../utils/apiClientUser';
import { combineReducers } from 'redux';

// ─────────────────────────────────────────────────────────────────────────────
// 1) MOCK EXTERNAL MODULES (axios, apiClientUser)
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('axios');
jest.mock('../../utils/apiClientUser', () => ({
  post: jest.fn()
}));

// ─────────────────────────────────────────────────────────────────────────────
// Combine your slice reducer into a test store so we can dispatch the thunks
// ─────────────────────────────────────────────────────────────────────────────
const rootReducer = combineReducers({
  tickets: reducer
});

// Updated store setup: middleware is provided as a callback returning the default middleware.
function setupStore(preloadedState) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // thunk is included by default
    preloadedState
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  isLoading: false,
  data: [],
  HazardsRisetickes: [],
  isError: false,
  errorMessage: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// REDUCER TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('ticketSlice reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe('submitTicket action (reducer)', () => {
    it('should set isLoading true when pending', () => {
      const action = { type: submitTicket.pending.type };
      const state = reducer(initialState, action);
      expect(state.isLoading).toBe(true);
    });

    it('should add the submitted ticket to data and set isLoading to false when fulfilled', () => {
      const ticket = { id: 1, description: 'Test Ticket' };
      const action = { type: submitTicket.fulfilled.type, payload: ticket };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.data).toEqual([ticket]);
    });

    it('should handle rejected action when error has a response', () => {
      const errorMsg = "Failed to submit ticket";
      const action = { type: submitTicket.rejected.type, payload: errorMsg };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.errorMessage).toBe(errorMsg);
    });

    it('should handle rejected action when error has no response', () => {
      const action = { type: submitTicket.rejected.type, payload: undefined };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.errorMessage).toBeUndefined();
    });
  });

  describe('HazardsTicket action (reducer)', () => {
    it('should set isLoading true when pending', () => {
      const action = { type: HazardsTicket.pending.type };
      const state = reducer(initialState, action);
      expect(state.isLoading).toBe(true);
    });

    it('should add the hazard ticket to HazardsRisetickes and set isLoading to false when fulfilled', () => {
      const hazardTicket = { id: 2, hazard: 'Test Hazard' };
      const action = { type: HazardsTicket.fulfilled.type, payload: hazardTicket };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.HazardsRisetickes).toEqual([hazardTicket]);
    });

    it('should handle rejected action when error has a response', () => {
      const errorMsg = "Failed to submit hazard ticket";
      const action = { type: HazardsTicket.rejected.type, payload: errorMsg };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.errorMessage).toBe(errorMsg);
    });

    it('should handle rejected action when error has no response', () => {
      const action = { type: HazardsTicket.rejected.type, payload: undefined };
      const state = reducer({ ...initialState, isLoading: true }, action);
      expect(state.isLoading).toBe(false);
      expect(state.isError).toBe(true);
      expect(state.errorMessage).toBeUndefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// THUNK TESTS
// ─────────────────────────────────────────────────────────────────────────────
describe('ticketSlice Thunk logic', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = setupStore({ tickets: initialState });
  });

  describe('submitTicket thunk', () => {
    it('dispatches fulfilled when apiClientUser.post succeeds', async () => {
      const mockResponse = { id: 123, description: 'Mocked ticket' };
      apiClientUser.post.mockResolvedValueOnce({ data: mockResponse });

      const ticketData = {
        email: 'test@example.com',
        description: 'Testing ticket'
      };

      const result = await store.dispatch(submitTicket(ticketData));
      expect(result.type).toBe('tickets/submitTicket/fulfilled');
      expect(result.payload).toEqual(mockResponse);

      expect(apiClientUser.post).toHaveBeenCalledWith(
        '/users/raiseTicket/test@example.com',
        { description: 'Testing ticket' }
      );

      const finalState = store.getState().tickets;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.data).toEqual([mockResponse]);
    });

    it('dispatches rejected when apiClientUser.post throws error', async () => {
      const mockError = new Error('Network Error');
      apiClientUser.post.mockRejectedValueOnce(mockError);

      const ticketData = {
        email: 'fail@example.com',
        description: 'This will fail'
      };

      const result = await store.dispatch(submitTicket(ticketData));
      expect(result.type).toBe('tickets/submitTicket/rejected');
      expect(result.payload).toEqual(mockError);

      const finalState = store.getState().tickets;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isError).toBe(true);
      expect(finalState.errorMessage).toEqual(mockError);
    });
  });

  describe('HazardsTicket thunk', () => {
    it('dispatches fulfilled when axios.post succeeds', async () => {
      const mockHazardResponse = { id: 999, hazard: 'Mock Hazard' };
      axios.post.mockResolvedValueOnce({ data: mockHazardResponse });

      const hazardData = { hazard: 'Some hazard data' };

      const result = await store.dispatch(HazardsTicket(hazardData));
      expect(result.type).toBe('tickets/HazardsTicket/fulfilled');
      expect(result.payload).toEqual(mockHazardResponse);

      expect(axios.post).toHaveBeenCalledWith(
        'https://34.230.191.102:8000/api/hazards/addNewHazard',
        hazardData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const finalState = store.getState().tickets;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.HazardsRisetickes).toEqual([mockHazardResponse]);
    });

    it('dispatches rejected when axios.post fails with response', async () => {
      const mockAxiosError = {
        response: {
          data: 'Something went wrong on hazards creation'
        }
      };
      axios.post.mockRejectedValueOnce(mockAxiosError);

      const hazardData = { hazard: 'Will fail' };

      const result = await store.dispatch(HazardsTicket(hazardData));
      expect(result.type).toBe('tickets/HazardsTicket/rejected');
      expect(result.payload).toBe('Something went wrong on hazards creation');

      const finalState = store.getState().tickets;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isError).toBe(true);
      expect(finalState.errorMessage).toBe('Something went wrong on hazards creation');
    });

    it('dispatches rejected with default error if no response', async () => {
      const mockAxiosError = new Error('No server response');
      axios.post.mockRejectedValueOnce(mockAxiosError);

      const hazardData = { hazard: 'No server response case' };

      const result = await store.dispatch(HazardsTicket(hazardData));
      expect(result.type).toBe('tickets/HazardsTicket/rejected');
      expect(result.payload).toBe('Failed to submit ticket');

      const finalState = store.getState().tickets;
      expect(finalState.isLoading).toBe(false);
      expect(finalState.isError).toBe(true);
      expect(finalState.errorMessage).toBe('Failed to submit ticket');
    });
  });
});