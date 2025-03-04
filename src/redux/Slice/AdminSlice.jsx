import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

import apiClientAdmin from "../../utils/apiClientAdmin"


// Fetch all tasks
export const fetchAllTasks = createAsyncThunk('admin/tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClientAdmin.get('/admin/tasks'); 
    return response.data.tasks;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch tasks");
  }
});

// Fetch all users
export const fetchAllUsers = createAsyncThunk('admin/users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClientAdmin.get('/admin/users'); 
    return response.data.users;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch users");
  }
});

export const fetchAllApprovedEngineers = createAsyncThunk("admin/fetchAllApprovedEngineers",async (_, { rejectWithValue }) => {
  try {
      console.log("inside fetchallapprovedengineers")
      const response = await apiClientAdmin.get("/admin/engineers"); 

      //console.log("fetchAllApprovedEngineers", response.data.users);
      return response.data.users;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch engineers");
    }
  }
);

export const fetchAllEngineers = createAsyncThunk("admin/fetchAllEngineers", async(_, {rejectWithValue}) => {
  try{
    const response = await apiClientAdmin.get("/admin/approval/engineers");
    // if (!Array.isArray(response.data.approvalEngineers)) {
    //   throw new Error("Invalid data format");
    // }
    //console.log("fetchAllEngineers", response.data);
    return response.data.engineers; //this approvalEngineers is from backend API
  }catch(error){
    return rejectWithValue(error.response?.data || "Failed to fetch engineers");
  }
});

export const approveEngineer = createAsyncThunk(
  "admin/approveEngineer",
  async ({ engineerEmail, approve }, { rejectWithValue }) => {
    try {
      const response = await apiClientAdmin.patch(`/admin/approve-engineer/${engineerEmail}`, {
        email: engineerEmail,
        approve,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update engineer approval");
    }
  }
);

export const fetchDeferredTasks = createAsyncThunk(
  "admin/deferredTasks/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClientAdmin.get("/admin/status/deferred"); 
      console.log(response.data);
      return response.data.tickets;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch deferred tasks");
    }
  }
);

// Fetch available engineers
export const fetchAvailableEngineers = createAsyncThunk(
  'tasks/fetchAvailableEngineers',
  async () => {
    try {
      const response = await apiClientAdmin.get('/api/engineers/available');
      return response.data.engineers; // array of engineers
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message); 
    }
  }
);

// Reassign ticket to an engineer
export const reassignTicket = createAsyncThunk(
  'tasks/reassignTicket',
  async ({ ticketId, engineerId }) => {
    try {
      const response = await apiClientAdmin.patch(`/api/reassign/${ticketId}/${engineerId}`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data; // reassigned ticket
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message); // Handle error
    }
  }
);

export const fetchEngineerTasks = createAsyncThunk(
  "admin/fetchEngineerTasks",
  async (engineerEmail, { rejectWithValue }) => {
    try {
      console.log("engineerEmail", engineerEmail);
      const response = await apiClientAdmin.get(`/tasks/engineer/${engineerEmail}`); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching tasks");
    }
  }
);


const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    tasks: [],
    engineerTasks:[],
    completedTasks: [],
    deferredTasks: [],
    users: [],
    engineers: [],
    approvedEngineers: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => { state.loading = true; })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllApprovedEngineers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllApprovedEngineers.fulfilled, (state, action) => {
        state.approvedEngineers = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllApprovedEngineers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeferredTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDeferredTasks.fulfilled, (state, action) => {
        state.deferredTasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeferredTasks.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchEngineerTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEngineerTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.engineerTasks = action.payload;
      })
      .addCase(fetchEngineerTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Error fetching tasks.";
      })
      .addCase(fetchAvailableEngineers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableEngineers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableEngineers = action.payload;
      })
      .addCase(fetchAvailableEngineers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAllEngineers.pending, (state) =>{
        state.loading=true;
        state.error = null;
      })
      .addCase(fetchAllEngineers.fulfilled, (state, action) =>{
        state.engineers=Array.isArray(action.payload) ? action.payload : [];
        state.loading=false;
      })
      .addCase(fetchAllEngineers.rejected, (state, action) =>{
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(approveEngineer.pending, (state) =>{
        state.loading =true;
        state.error = null;
      })
      .addCase(approveEngineer.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEngineer = action.payload.engineer;
    
        if (!updatedEngineer) return; // Ensure there's an engineer to update
    
        // Update engineers list
        state.engineers = state.engineers.map((engineer) =>
            engineer.email === updatedEngineer.email ? updatedEngineer : engineer
        );
    
        // Ensure approvedEngineers list exists
        if (!state.approvedEngineers) {
            state.approvedEngineers = [];
        }
    
        // Add to approved list if not already there
        const engineerExists = state.approvedEngineers.some(
            (e) => e.email === updatedEngineer.email
        );
        if (!engineerExists) {
            state.approvedEngineers.push(updatedEngineer);
        }
    })
    
      
      .addCase(approveEngineer.rejected, (state, action) =>{
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
