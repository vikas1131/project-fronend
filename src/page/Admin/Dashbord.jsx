
import React, { useEffect, useState } from "react";
import Dashbord from "./../../compoents/Dashbord";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTasks, fetchAllApprovedEngineers, fetchAllEngineers } from "../../redux/Slice/AdminSlice";
import { fetchNotifications } from "./../../redux/Slice/notificationSlice"

const AdminDashboard = ({ debouncedSearchTerm = "", statusFilter = "", priorityFilter = "" }) => {
  
  const { tasks, loading,error,approvedEngineers,engineers } = useSelector((state) => state.admin);
  
   console.log("hdjhfasd1122323s", approvedEngineers)
  

  

    const dispatch = useDispatch();
  useEffect(() => {
       dispatch(fetchNotifications())
       dispatch(fetchAllTasks());
       dispatch(fetchAllApprovedEngineers());
       dispatch(fetchAllEngineers()); // Fetch all tasks on mount
     }, [dispatch]);

  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    const serviceType = task?.serviceType?.toLowerCase() || "";
    const status = task?.status?.toLowerCase() || "";
    const priority = task?.priority?.toLowerCase() || "";
  
    const matchesSearchTerm = serviceType.includes(debouncedSearchTerm.toLowerCase());
    const matchesStatusFilter = statusFilter ? status === statusFilter.toLowerCase() : true;
    const matchesPriorityFilter = priorityFilter ? priority === priorityFilter.toLowerCase() : true;
  
    return matchesSearchTerm && matchesStatusFilter && matchesPriorityFilter;
  }) : [];

  //const filteredEngineers=Array.isArray(approvedEngineers)? approvedEngineers:[]
  

  // Ticket status counts
  const ticketStatusCounts = {
    open: 0,
    "in-progress": 0,
    completed: 0,
    failed: 0,
    deferred: 0,
  };

  // Task priority counts
  const taskPriorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  if (!loading && Array.isArray(filteredTasks)) {
    filteredTasks.forEach((task) => {
      const status = task?.status?.toLowerCase();
      const priority = task?.priority?.toLowerCase();

      if (status && ticketStatusCounts[status] !== undefined) {
        ticketStatusCounts[status] += 1;
      }
      if (priority && taskPriorityCounts[priority] !== undefined) {
        taskPriorityCounts[priority] += 1;
      }
    });
  }

  const ticketStatusData = {
    labels: Object.keys(ticketStatusCounts),
    datasets: [
      {
        label: "Ticket Status",
        data: Object.values(ticketStatusCounts),
        backgroundColor: ["#FFCE56", "#36A2EB", "#4CAF50", "#FF0000", "#808080"],
        borderWidth: 2,
      },
    ],
  };

  const taskPriorityData = {
    labels: Object.keys(taskPriorityCounts),
    datasets: [
      {
        label: "Task Priority",
        data: Object.values(taskPriorityCounts),
        backgroundColor: ["#FFCE56", "#FFA500", "#FF0000"],
        borderWidth: 2,
      },
    ],
  };
  const adminData = {
    openTickets: tasks?.filter(task => task.status === "open"),
    resolvedTickets: tasks?.filter(task => task.status === "completed"),
    approvedEngineers:approvedEngineers,
    allEngineers:engineers,
  };
  return <Dashbord ticketStatusData={ticketStatusData} taskPriorityData={taskPriorityData} loading={loading} data={adminData} />;
};

export default AdminDashboard;

