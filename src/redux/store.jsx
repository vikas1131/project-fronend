import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './Slice/taskSlice';
import ticketReducer from './Slice/UserSlice';
import engineerReducer from './Slice/EngineerSlice';
import  RaiseTickets from "./Slice/raiseticke"
import adminReducer from "./Slice/AdminSlice";
import authReducer from "./Slice/authSlice"
import notification from "./Slice/notificationSlice"

const store = configureStore({
  reducer: {
    tasks: taskReducer,
    tickets: ticketReducer,
    engineer: engineerReducer,
    RaiseTicket :  RaiseTickets,
    admin: adminReducer,
    auth: authReducer,
    notifications: notification,  // Add notification slice here for global notifications
     
  },
});

export default store;
