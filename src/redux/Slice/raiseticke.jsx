import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import apiClientUser from '../../utils/apiClientUser';
import apiClientNH from '../../utils/apiClientNH';

export const submitTicket = createAsyncThunk(
  'tickets/submitTicket',
  async (ticketData) => { 
    const { email, ...rest } = ticketData; // Extract email separately
    //console.log("ticketData inside submitTicket", ticketData);
    try {
      const response = await apiClientUser.post(
        `/users/raiseTicket/${email}`, 
        rest, // Send the rest of the ticket data
      );
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting ticket:", error);
      return error;
    }
  }
);


export const HazardsTicket = createAsyncThunk(
  'tickets/HazardsTicket',
  async (ticketData, { rejectWithValue }) => {
    try {
      console.log("ticket Data", ticketData);
      const response = await apiClientNH.post(
        '/hazards/addNewHazard',
        ticketData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("Response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error submitting Hazard:", error);
      return rejectWithValue(
        error.response?.data || 'Failed to add hazard'
      );
    }
  }
);

// Redux slice for tickets
const ticketSlice = createSlice({
  name: "tickets",
  initialState: {
    isLoading: false,
    data: [],
    HazardsRisetickes:[],
    isError: false,
    errorMessage: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data.push(action.payload); // Add the ticket to the data array
      })
      .addCase(submitTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(HazardsTicket.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(HazardsTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.HazardsRisetickes.push(action.payload); // Add the ticket to the data array
      })
      .addCase(HazardsTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export default ticketSlice.reducer;
