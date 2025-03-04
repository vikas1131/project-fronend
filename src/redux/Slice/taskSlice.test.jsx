import reducer, { fetchTasks } from './taskSlice';

describe('taskSlice reducer', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null,
  };

  describe('fetchTasks', () => {
    it('should set loading true and clear errors when pending', () => {
      const action = { type: fetchTasks.pending.type };
      const state = reducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update tasks and set loading to false when fulfilled', () => {
      // Example tasks payload
      const tasks = [
        { id: 1, title: 'Task One' },
        { id: 2, title: 'Task Two' },
      ];
      const action = { type: fetchTasks.fulfilled.type, payload: tasks };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.tasks).toEqual(tasks);
      expect(state.loading).toBe(false);
    });

    it('should set error and loading to false when rejected', () => {
      const errorMessage = 'Error fetching tasks';
      const action = { type: fetchTasks.rejected.type, error: { message: errorMessage } };
      const state = reducer({ ...initialState, loading: true }, action);
      expect(state.error).toEqual(errorMessage);
      expect(state.loading).toBe(false);
    });
  });
});