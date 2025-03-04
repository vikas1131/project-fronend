// AdminSlice.full.test.jsx
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import axios from "axios";
import adminReducer, {
  fetchAllTasks,
  fetchAllUsers,
  fetchAllApprovedEngineers,
  fetchAllEngineers,
  approveEngineer,
  fetchDeferredTasks,
  fetchAvailableEngineers,
  reassignTicket,
  fetchEngineerTasks,
} from "./AdminSlice";
import apiClientAdmin from "../../utils/apiClientAdmin";

// --- MOCK EXTERNAL MODULES ---
jest.mock("../../utils/apiClientAdmin", () => ({
  get: jest.fn(),
  patch: jest.fn(),
}));
jest.mock("axios");

// --- Helper: Setup Test Store ---
function setupStore(preloadedState) {
  const rootReducer = combineReducers({ admin: adminReducer });
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    preloadedState,
  });
}

const initialState = {
  tasks: [],
  engineerTasks: [],
  completedTasks: [],
  deferredTasks: [],
  users: [],
  engineers: [],
  approvedEngineers: [],
  availableEngineers: [],
  loading: false,
  error: null,
};

describe("AdminSlice - Full Coverage", () => {
  let store;
  beforeEach(() => {
    store = setupStore({ admin: initialState });
    jest.clearAllMocks();
  });

  // --- fetchAllTasks Thunk ---
  describe("fetchAllTasks thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const tasks = [{ id: 1 }, { id: 2 }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { tasks } });
      const result = await store.dispatch(fetchAllTasks());
      expect(result.type).toBe("admin/tasks/fetchAll/fulfilled");
      const state = store.getState().admin;
      expect(state.tasks).toEqual(tasks);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Failed to fetch tasks";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchAllTasks());
      expect(result.type).toBe("admin/tasks/fetchAll/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchAllUsers Thunk ---
  describe("fetchAllUsers thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const users = [{ id: 1 }, { id: 2 }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { users } });
      const result = await store.dispatch(fetchAllUsers());
      expect(result.type).toBe("admin/users/fetchAll/fulfilled");
      const state = store.getState().admin;
      expect(state.users).toEqual(users);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Failed to fetch users";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchAllUsers());
      expect(result.type).toBe("admin/users/fetchAll/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchAllApprovedEngineers Thunk ---
  describe("fetchAllApprovedEngineers thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const approvedEngineers = [{ email: "eng1@example.com" }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { users: approvedEngineers } });
      const result = await store.dispatch(fetchAllApprovedEngineers());
      expect(result.type).toBe("admin/fetchAllApprovedEngineers/fulfilled");
      const state = store.getState().admin;
      expect(state.approvedEngineers).toEqual(approvedEngineers);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Failed to fetch engineers";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchAllApprovedEngineers());
      expect(result.type).toBe("admin/fetchAllApprovedEngineers/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchDeferredTasks Thunk ---
  describe("fetchDeferredTasks thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const tickets = [{ id: 3 }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { tickets } });
      const result = await store.dispatch(fetchDeferredTasks());
      expect(result.type).toBe("admin/deferredTasks/fetchAll/fulfilled");
      const state = store.getState().admin;
      expect(state.deferredTasks).toEqual(tickets);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Failed to fetch deferred tasks";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchDeferredTasks());
      expect(result.type).toBe("admin/deferredTasks/fetchAll/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchEngineerTasks Thunk ---
  describe("fetchEngineerTasks thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const data = { tasks: [{ id: 4 }] };
      apiClientAdmin.get.mockResolvedValueOnce({ data });
      const result = await store.dispatch(fetchEngineerTasks("eng@example.com"));
      expect(result.type).toBe("admin/fetchEngineerTasks/fulfilled");
      const state = store.getState().admin;
      expect(state.engineerTasks).toEqual(data);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Error fetching tasks";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchEngineerTasks("eng@example.com"));
      expect(result.type).toBe("admin/fetchEngineerTasks/rejected");
      const state = store.getState().admin;
      // In the reducer, error is set to action.payload?.message or a default string.
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchAvailableEngineers Thunk ---
  describe("fetchAvailableEngineers thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds", async () => {
      const engineers = [{ id: 5 }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { engineers } });
      const result = await store.dispatch(fetchAvailableEngineers());
      expect(result.type).toBe("tasks/fetchAvailableEngineers/fulfilled");
      const state = store.getState().admin;
      expect(state.availableEngineers).toEqual(engineers);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Available engineers error";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      // Since fetchAvailableEngineers uses throw new Error on failure, we wrap in try/catch.
      try {
        await store.dispatch(fetchAvailableEngineers());
      } catch (e) {
        // Expected error thrown.
      }
      const state = store.getState().admin;
      // The reducer for fetchAvailableEngineers uses action.error.message.
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- fetchAllEngineers Thunk ---
  describe("fetchAllEngineers thunk", () => {
    it("dispatches fulfilled when apiClientAdmin.get succeeds with an array payload", async () => {
      const engineers = [{ id: 6 }];
      apiClientAdmin.get.mockResolvedValueOnce({ data: { engineers } });
      const result = await store.dispatch(fetchAllEngineers());
      expect(result.type).toBe("admin/fetchAllEngineers/fulfilled");
      const state = store.getState().admin;
      expect(state.engineers).toEqual(engineers);
      expect(state.loading).toBe(false);
    });

    it("dispatches fulfilled with empty array when payload is not an array", async () => {
      apiClientAdmin.get.mockResolvedValueOnce({ data: {} });
      const result = await store.dispatch(fetchAllEngineers());
      expect(result.type).toBe("admin/fetchAllEngineers/fulfilled");
      const state = store.getState().admin;
      expect(state.engineers).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when apiClientAdmin.get fails", async () => {
      const errorMsg = "Failed to fetch engineers";
      apiClientAdmin.get.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(fetchAllEngineers());
      expect(result.type).toBe("admin/fetchAllEngineers/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- approveEngineer Thunk ---
  describe("approveEngineer thunk", () => {
    it("dispatches fulfilled when patch succeeds", async () => {
      const updatedEngineer = { email: "eng@example.com", approved: true };
      apiClientAdmin.patch.mockResolvedValueOnce({ data: { engineer: updatedEngineer } });
      // Preload engineers array with an engineer to be updated.
      store = setupStore({
        admin: { ...initialState, engineers: [{ email: "eng@example.com" }], approvedEngineers: [] },
      });
      const result = await store.dispatch(
        approveEngineer({ engineerEmail: "eng@example.com", approve: true })
      );
      expect(result.type).toBe("admin/approveEngineer/fulfilled");
      const state = store.getState().admin;
      expect(state.engineers).toEqual([{ email: "eng@example.com", approved: true }]);
      expect(state.approvedEngineers).toEqual([{ email: "eng@example.com", approved: true }]);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when patch fails", async () => {
      const errorMsg = "Failed to update engineer approval";
      apiClientAdmin.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(
        approveEngineer({ engineerEmail: "eng@example.com", approve: true })
      );
      expect(result.type).toBe("admin/approveEngineer/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  // --- reassignTicket Thunk ---
  describe("reassignTicket thunk", () => {
    it("dispatches fulfilled when patch succeeds", async () => {
      const updatedTicket = { id: 10, assigned: true };
      apiClientAdmin.patch.mockResolvedValueOnce({ data: updatedTicket });
      // Preload tasks array
      store = setupStore({
        admin: { ...initialState, tasks: [{ id: 10 }, { id: 11 }] },
      });
      const result = await store.dispatch(
        reassignTicket({ ticketId: 10, engineerId: "eng123" })
      );
      expect(result.type).toBe("tasks/reassignTicket/fulfilled");
      const state = store.getState().admin;
      // Check that the updated ticket is in the tasks array
      expect(state.tasks).toContainEqual(updatedTicket);
      expect(state.loading).toBe(false);
    });

    it("dispatches rejected when patch fails", async () => {
      const errorMsg = "Reassign failed";
      apiClientAdmin.patch.mockRejectedValueOnce({ response: { data: errorMsg } });
      const result = await store.dispatch(
        reassignTicket({ ticketId: 10, engineerId: "eng123" })
      );
      expect(result.type).toBe("tasks/reassignTicket/rejected");
      const state = store.getState().admin;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });
});