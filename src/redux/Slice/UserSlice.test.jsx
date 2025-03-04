import reducer, {
  fetchTickets,
  fetchProfile,
  fetchUpdateProfile,
} from './UserSlice';
import { configureStore } from '@reduxjs/toolkit';
import apiClientUser from '../../utils/apiClientUser';
import apiClientEngineer from '../../utils/apiClientEngineer';

// Mock the API client modules
jest.mock('../../utils/apiClientUser', () => ({
  get: jest.fn(),
  patch: jest.fn(),
}));
jest.mock('../../utils/apiClientEngineer', () => ({
  get: jest.fn(),
}));

describe('UserSlice Reducer', () => {
  const initialState = {
    tasks: [],
    profile: {},
    updateProfile: {},
    loading: false,
    error: null,
  };

  describe('fetchTickets reducer actions', () => {
    it('should set loading true on pending', () => {
      const action = { type: fetchTickets.pending.type };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update tasks on fulfilled', () => {
      const tasks = ['task1', 'task2'];
      const action = { type: fetchTickets.fulfilled.type, payload: tasks };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.tasks).toEqual(tasks);
      expect(state.loading).toBe(false);
    });

    it('should set error on rejected', () => {
      const error = 'Tickets error';
      const action = { type: fetchTickets.rejected.type, payload: error };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.error).toEqual(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchProfile reducer actions', () => {
    it('should set loading true on pending', () => {
      const action = { type: fetchProfile.pending.type };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update profile on fulfilled', () => {
      const profileData = { name: 'Jane Doe', age: 30 };
      const action = { type: fetchProfile.fulfilled.type, payload: profileData };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.profile).toEqual(profileData);
      expect(state.loading).toBe(false);
    });

    it('should set error on rejected', () => {
      const error = 'Profile error';
      const action = { type: fetchProfile.rejected.type, payload: error };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.error).toEqual(error);
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchUpdateProfile reducer actions', () => {
    it('should set loading true on pending', () => {
      const action = { type: fetchUpdateProfile.pending.type };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update updateProfile on fulfilled', () => {
      const updatedProfile = { name: 'John Smith', age: 40 };
      const action = { type: fetchUpdateProfile.fulfilled.type, payload: updatedProfile };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.updateProfile).toEqual(updatedProfile);
      expect(state.loading).toBe(false);
    });

    it('should set error on rejected', () => {
      const error = 'Update profile error';
      const action = { type: fetchUpdateProfile.rejected.type, payload: error };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.error).toEqual(error);
      expect(state.loading).toBe(false);
    });
  });
});

describe('UserSlice Async Thunks', () => {
  let store;
  const preloadedState = {
    tasks: [],
    profile: {},
    updateProfile: {},
    loading: false,
    error: null,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: reducer,
      // getDefaultMiddleware already includes thunk, so we don't need to add it manually
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
      preloadedState,
    });
    jest.clearAllMocks();
  });

  describe('fetchTickets thunk', () => {
    it('dispatches fulfilled action on success', async () => {
      const tasks = ['task1', 'task2'];
      apiClientEngineer.get.mockResolvedValueOnce({ data: tasks });
      const result = await store.dispatch(
        fetchTickets({ userEmail: 'test@example.com', role: 'admin' })
      );
      expect(result.type).toBe('tickets/fetchTickets/fulfilled');
      expect(result.payload).toEqual(tasks);
      const state = store.getState();
      expect(state.tasks).toEqual(tasks);
      expect(state.loading).toBe(false);
      expect(apiClientEngineer.get).toHaveBeenCalledWith(
        `/tasks/admin/test@example.com`
      );
    });

    it('dispatches rejected action on failure', async () => {
      const errorMessage = 'Network Error';
      apiClientEngineer.get.mockRejectedValueOnce(new Error(errorMessage));
      const result = await store.dispatch(
        fetchTickets({ userEmail: 'test@example.com', role: 'admin' })
      );
      expect(result.type).toBe('tickets/fetchTickets/rejected');
      const state = store.getState();
      expect(state.error).toBeDefined();
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchProfile thunk', () => {
    it('dispatches fulfilled action on success', async () => {
      const profileData = { name: 'Jane Doe', age: 30 };
      apiClientUser.get.mockResolvedValueOnce({ data: profileData });
      const result = await store.dispatch(
        fetchProfile({ userEmail: 'test@example.com', role: 'user' })
      );
      expect(result.type).toBe('tickets/fetchProfile/fulfilled');
      expect(result.payload).toEqual(profileData);
      const state = store.getState();
      expect(state.profile).toEqual(profileData);
      expect(state.loading).toBe(false);
      expect(apiClientUser.get).toHaveBeenCalledWith(
        `/users/profile/user/test@example.com`
      );
    });

    it('dispatches rejected action on failure', async () => {
      const errorMessage = 'Profile fetch error';
      apiClientUser.get.mockRejectedValueOnce(new Error(errorMessage));
      const result = await store.dispatch(
        fetchProfile({ userEmail: 'test@example.com', role: 'user' })
      );
      expect(result.type).toBe('tickets/fetchProfile/rejected');
      const state = store.getState();
      expect(state.error).toBeDefined();
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchUpdateProfile thunk', () => {
    it('dispatches fulfilled action on success with full parameters', async () => {
      const updatedProfile = { name: 'John Smith', age: 40 };
      apiClientUser.patch.mockResolvedValueOnce({ data: updatedProfile });
      const result = await store.dispatch(
        fetchUpdateProfile({
          userEmail: 'test@example.com',
          role: 'user',
          updatedata: updatedProfile,
        })
      );
      expect(result.type).toBe('tickets/updateProfile/fulfilled');
      expect(result.payload).toEqual(updatedProfile);
      const state = store.getState();
      expect(state.updateProfile).toEqual(updatedProfile);
      expect(state.loading).toBe(false);
      expect(apiClientUser.patch).toHaveBeenCalledWith(
        `/users/updateProfile/user/test@example.com`,
        updatedProfile
      );
    });

    it('dispatches fulfilled action on success with default parameters (only updated data provided)', async () => {
      const updatedData = { name: 'OnlyData' };
      apiClientUser.patch.mockResolvedValueOnce({ data: updatedData });
      const result = await store.dispatch(fetchUpdateProfile(updatedData));
      expect(result.type).toBe('tickets/updateProfile/fulfilled');
      expect(result.payload).toEqual(updatedData);
      const state = store.getState();
      expect(state.updateProfile).toEqual(updatedData);
      expect(state.loading).toBe(false);
      expect(apiClientUser.patch).toHaveBeenCalledWith(
        `/users/updateProfile//`,
        updatedData
      );
    });

    it('dispatches rejected action on failure', async () => {
      const errorMessage = 'Update failed';
      apiClientUser.patch.mockRejectedValueOnce(new Error(errorMessage));
      const result = await store.dispatch(
        fetchUpdateProfile({
          userEmail: 'test@example.com',
          role: 'user',
          updatedata: { name: 'Fail' },
        })
      );
      expect(result.type).toBe('tickets/updateProfile/rejected');
      const state = store.getState();
      expect(state.error).toBeDefined();
      expect(state.loading).toBe(false);
    });
  });
});