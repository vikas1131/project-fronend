import React, { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import Dashbord from "./../../compoents/Dashbord";
import { fetchTickets } from "../../redux/Slice/UserSlice";
import apiClientEngineer from "../../utils/apiClientEngineer";

const UserDashboard = ({ debouncedSearchTerm = "", statusFilter = "", priorityFilter = "" }) => {
  const email=sessionStorage.getItem("email")
 
  const { tasks, loading, error } = useSelector((state) => state.tickets);
  const dispatch = useDispatch();

   useEffect(() => {
    const fetchTicketsData = async () => {
      try {
        const response = await apiClientEngineer.get(`/tasks/user/${email}`);
        console.log(response);
        dispatch(fetchTickets.fulfilled(response.data.tasks));
      } catch (error) {
        console.error("Error fetching engineer tasks:", error);
        dispatch(fetchTickets.rejected(error.response?.data || "Failed to fetch engineer tasks"));
      }
    };
    fetchTicketsData();
  }, [dispatch, email]);

     const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
      const serviceType = task?.serviceType?.toLowerCase() || "";
      const status = task?.status?.toLowerCase() || "";
      const priority = task?.priority?.toLowerCase() || "";
    
      const matchesSearchTerm = serviceType.includes(debouncedSearchTerm.toLowerCase());
      const matchesStatusFilter = statusFilter ? status === statusFilter.toLowerCase() : true;
      const matchesPriorityFilter = priorityFilter ? priority === priorityFilter.toLowerCase() : true;
    
      return matchesSearchTerm && matchesStatusFilter && matchesPriorityFilter;
    }) : [];

  const ticketStatusCounts = {
    open: 0,
    "in-progress": 0,
    completed: 0,
    failed: 0,
    deferred: 0,
  };

  const taskPriorityCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  console.log("filteredTasks", filteredTasks);

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
  
  const userData = {
    completedTasks: tasks.filter(task => task.status === "completed"),
    pendingTasks: tasks.filter(task => task.status === "pending"),
    totalTasks: tasks.filter(task => task.status === "open"),
    failedTasks: tasks.filter(task => task.status==="failed"),
    inprogressTasks: tasks.filter(task => task.status==="in-progress"),

  };
  
  return <Dashbord role="user" ticketStatusData={ticketStatusData} taskPriorityData={taskPriorityData} loading={loading} error={error} data={userData}/>;
};

export default UserDashboard;