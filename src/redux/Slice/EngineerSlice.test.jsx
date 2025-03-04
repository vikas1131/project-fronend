// EngineerSlice.full.test.jsx
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import axios from 'axios';
import engineerReducer, {
  fetchProfile,
  fetchEngineerTasks,
  fetchAcceptTask,
  fetchRejectTask,
  fetchUpdateEngineerProfile,
  fetchEngineerProfiledata,
  updateTaskStatus,
  HazardsTickets,
  HazardsUpdateTickets,
  HazardsDeleteTickets,
} from './EngineerSlice';

import apiClientEngineer from '../../utils/apiClientEngineer';
import apiClientUser from '../../utils/apiClientUser';
import apiClientNH from '../../utils/apiClientNH';

// MOCK external modules with interceptors for apiClientEngineer
jest.mock('../../utils/apiClientEngineer', () => ({
  interceptors: {
    request: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
  patch: jest.fn(),
}));

jest.mock('../../utils/apiClientUser', () => ({
  get: jest.fn(),
}));

jest.mock('../../utils/apiClientNH', () => ({
  get: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('axios');

// Helper: create a test store with middleware callback
function setupStore(preloadedState) {
  const rootReducer = combineReducers({ engineer: engineerReducer });
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState,
  });
}

// Define the initial state as in your slice
const initialState = {
  tasks: [],
  updateProfile: [],
  profiledata: {},
  Hazards: [],
  loading: false,
  error: null,
};

describe('EngineerSlice - Full Coverage', () => {
  let store;
  beforeEach(() => {
    store = setupStore({ engineer: initialState });
    jest.clearAllMocks();
  });

  // --- Reducer tests ---
  describe('Reducer behavior', () => {
    it('should return the initial state for unknown actions', () => {
      const action = { type: 'unknown/action' };
      const state = engineerReducer(initialState, action);
      expect(state).toEqual(initialState);
    });
  });

  // --- Async thunk tests ---
  describe('fetchProfile thunk', () => {
    it('dispatches fulfilled when apiClientUser.get succeeds', async () => {
      const profile = { email: 'eng@example.com', name: 'Engineer' };
      apiClientUser.get.mockResolvedValueOnce({ data: { profile: { user: profile } } });
      const result = await store.dispatch(fetchProfile({ userEmail: 'eng@example.com', role: 'engineer' }));
      expect(result.type).toBe('tickets/fetchProfile/fulfilled');
      const state = store.getState().engineer;
      expect(state.updateProfile).toEqual(profile);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when apiClientUser.get fails', async () => {
      const errorMsg = 'Profile fetch failed';
      apiClientUser.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchProfile({ userEmail: 'eng@example.com', role: 'engineer' }));
      expect(result.type).toBe('tickets/fetchProfile/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchEngineerTasks thunk', () => {
    it('dispatches fulfilled with an array payload', async () => {
      const tasks = [{ _id: '1', name: 'Task1' }];
      apiClientEngineer.get.mockResolvedValueOnce({ data: { tasks } });
      const result = await store.dispatch(fetchEngineerTasks('eng@example.com'));
      expect(result.type).toBe('engineer/fetchEngineerTasks/fulfilled');
      const state = store.getState().engineer;
      expect(state.tasks).toEqual(tasks);
      expect(state.loading).toBe(false);
    });

    it('dispatches fulfilled with a message payload when no data returned', async () => {
      const messagePayload = { message: 'No tasks available you.' };
      apiClientEngineer.get.mockResolvedValueOnce({ data: null });
      const result = await store.dispatch(fetchEngineerTasks('eng@example.com'));
      expect(result.type).toBe('engineer/fetchEngineerTasks/fulfilled');
      const state = store.getState().engineer;
      expect(state.tasks).toEqual([]);
      expect(state.error).toBe('No tasks available you.');
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when apiClientEngineer.get fails', async () => {
      const errorMsg = 'Failed to fetch engineer tasks';
      apiClientEngineer.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchEngineerTasks('eng@example.com'));
      expect(result.type).toBe('engineer/fetchEngineerTasks/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchAcceptTask thunk', () => {
    const prevState = {
      ...initialState,
      tasks: [
        { _id: '1', status: 'pending' },
        { _id: '2', status: 'pending' },
      ],
      loading: true,
    };

    it('dispatches fulfilled when patch succeeds', async () => {
      const updatedTask = { _id: '1', status: 'accepted' };
      apiClientEngineer.patch.mockResolvedValueOnce({ data: { ticket: updatedTask } });
      // Use a custom store with preloaded tasks
      store = setupStore({ engineer: { ...initialState, tasks: prevState.tasks, loading: true } });
      const result = await store.dispatch(fetchAcceptTask({ taskId: '1', email: 'eng@example.com' }));
      expect(result.type).toBe('engineer/fetchAcceptTask/fulfilled');
      const state = store.getState().engineer;
      expect(state.tasks).toContainEqual(updatedTask);
      expect(state.tasks).toContainEqual({ _id: '2', status: 'pending' });
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when patch fails', async () => {
      const errorMsg = 'Failed to accept task';
      apiClientEngineer.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      store = setupStore({ engineer: { ...initialState, tasks: [{ _id: '1', status: 'pending' }], loading: true } });
      const result = await store.dispatch(fetchAcceptTask({ taskId: '1', email: 'eng@example.com' }));
      expect(result.type).toBe('engineer/fetchAcceptTask/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchRejectTask thunk', () => {
    const prevState = {
      ...initialState,
      tasks: [
        { _id: '1', status: 'pending' },
        { _id: '2', status: 'pending' },
      ],
      loading: true,
    };

    it('dispatches fulfilled when patch succeeds', async () => {
      store = setupStore({ engineer: { ...initialState, tasks: prevState.tasks, loading: true } });
      const result = await store.dispatch(fetchRejectTask({ taskId: '1', email: 'eng@example.com' }));
      expect(result.type).toBe('engineer/fetchRejectTask/fulfilled');
      const state = store.getState().engineer;
      expect(state.tasks).toEqual([{ _id: '2', status: 'pending' }]);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when patch fails', async () => {
      const errorMsg = 'Failed to reject task';
      apiClientEngineer.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      store = setupStore({ engineer: { ...initialState, tasks: [{ _id: '1', status: 'pending' }], loading: true } });
      const result = await store.dispatch(fetchRejectTask({ taskId: '1', email: 'eng@example.com' }));
      expect(result.type).toBe('engineer/fetchRejectTask/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchUpdateEngineerProfile thunk', () => {
    it('dispatches fulfilled when patch succeeds', async () => {
      const updatedProfile = { email: 'eng@example.com', name: 'Updated Engineer' };
      apiClientEngineer.patch.mockResolvedValueOnce({ data: updatedProfile });
      const result = await store.dispatch(fetchUpdateEngineerProfile({ email: 'eng@example.com', updatedData: updatedProfile }));
      expect(result.type).toBe('engineer/fetchUpdateEngineerProfile/fulfilled');
      const state = store.getState().engineer;
      expect(state.updateProfile).toEqual(updatedProfile);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when patch fails', async () => {
      const errorMsg = 'Failed to update engineer profile';
      apiClientEngineer.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchUpdateEngineerProfile({ email: 'eng@example.com', updatedData: { name: 'Fail' } }));
      expect(result.type).toBe('engineer/fetchUpdateEngineerProfile/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchEngineerProfiledata thunk', () => {
    it('dispatches fulfilled when axios.patch succeeds', async () => {
      const profileData = { email: 'eng@example.com', name: 'Engineer Data' };
      axios.patch.mockResolvedValueOnce({ data: profileData });
      const result = await store.dispatch(fetchEngineerProfiledata({ name: 'Engineer Data' }));
      expect(result.type).toBe('engineer/fetchEngineerProfiledata/fulfilled');
      const state = store.getState().engineer;
      expect(state.updateProfile).toEqual(profileData);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when axios.patch fails', async () => {
      const errorMsg = 'Failed to update engineer profile';
      axios.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchEngineerProfiledata({ name: 'Fail' }));
      expect(result.type).toBe('engineer/fetchEngineerProfiledata/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('updateTaskStatus thunk', () => {
    it('updates task status when task exists and status is not deferred', async () => {
      const task = { _id: '1', status: 'pending' };
      store = setupStore({ engineer: { ...initialState, tasks: [task] } });
      const responseData = { taskId: '1', status: 'completed', engineerEmail: 'eng@example.com' };
      apiClientEngineer.patch.mockResolvedValueOnce({ data: responseData });
      const result = await store.dispatch(updateTaskStatus({ taskId: '1', status: 'completed' }));
      expect(result.type).toBe('engineer/updateTaskStatus/fulfilled');
      const state = store.getState().engineer;
      expect(state.tasks).toEqual([{ _id: '1', status: 'completed' }]);
    });

    it('dispatches extra action when status is "deferred"', async () => {
      // Test the branch that dispatches fetchEngineerTasks when status is deferred.
      const responseData = { taskId: '1', status: 'deferred', engineerEmail: 'eng@example.com' };
      apiClientEngineer.patch.mockResolvedValueOnce({ data: responseData });
      // Instead of using the store, call the thunk directly with a mocked thunkAPI.
      const mockDispatch = jest.fn();
      const thunkAPI = { dispatch: mockDispatch, getState: () => ({}), rejectWithValue: jest.fn() };
      const result = await updateTaskStatus({ taskId: '1', status: 'deferred' })(thunkAPI);
      // Check that the result equals the response data
      expect(result).toEqual(responseData);
      // Verify that dispatch was called at least once (with fetchEngineerTasks)
      expect(mockDispatch).toHaveBeenCalled();
    });

    it('dispatches rejected when patch fails', async () => {
      const errorMsg = 'Update failed';
      apiClientEngineer.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(updateTaskStatus({ taskId: '1', status: 'completed' }));
      expect(result.type).toBe('engineer/updateTaskStatus/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
    });
  });

  describe('HazardsTickets thunk', () => {
    it('dispatches fulfilled when apiClientNH.get succeeds', async () => {
      const hazards = [{ _id: 'h1', title: 'Hazard1' }];
      apiClientNH.get.mockResolvedValueOnce({ data: { hazards } });
      const result = await store.dispatch(HazardsTickets({}));
      expect(result.type).toBe('engineer/fetchHazardsTickets/fulfilled');
      const state = store.getState().engineer;
      expect(state.Hazards).toEqual(hazards);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when apiClientNH.get fails', async () => {
      const errorMsg = 'Failed to fetch hazards';
      apiClientNH.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(HazardsTickets({}));
      expect(result.type).toBe('engineer/fetchHazardsTickets/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('HazardsUpdateTickets thunk', () => {
    it('dispatches fulfilled when patch and subsequent get succeed', async () => {
      const updatedHazards = [{ _id: 'h2', title: 'Updated Hazard' }];
      apiClientNH.patch.mockResolvedValueOnce({ data: { some: 'data' } });
      apiClientNH.get.mockResolvedValueOnce({ data: { hazards: updatedHazards } });
      const result = await store.dispatch(HazardsUpdateTickets({ _id: 'h2', title: 'Updated Hazard' }));
      expect(result.type).toBe('engineer/HazardsUpdateTickets/fulfilled');
      const state = store.getState().engineer;
      expect(state.Hazards).toEqual(updatedHazards);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when patch fails', async () => {
      const errorMsg = 'Failed to HazardsUpdateTickets';
      apiClientNH.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(HazardsUpdateTickets({ _id: 'h2', title: 'Fail' }));
      expect(result.type).toBe('engineer/HazardsUpdateTickets/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe('HazardsDeleteTickets thunk', () => {
    it('dispatches fulfilled when delete and subsequent get succeed', async () => {
      const remainingHazards = [{ _id: 'h3', title: 'Remaining Hazard' }];
      apiClientNH.delete.mockResolvedValueOnce({ data: { some: 'data' } });
      apiClientNH.get.mockResolvedValueOnce({ data: { hazards: remainingHazards } });
      const result = await store.dispatch(HazardsDeleteTickets('h3'));
      expect(result.type).toBe('engineer/HazardsDeleteTickets/fulfilled');
      const state = store.getState().engineer;
      expect(state.Hazards).toEqual(remainingHazards);
      expect(state.loading).toBe(false);
    });

    it('dispatches rejected when delete fails', async () => {
      const errorMsg = 'Failed to HazardsUpdateTickets';
      apiClientNH.delete.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(HazardsDeleteTickets('h3'));
      expect(result.type).toBe('engineer/HazardsDeleteTickets/rejected');
      const state = store.getState().engineer;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });
});