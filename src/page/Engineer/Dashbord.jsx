// // Example usage in a parent component:
// import React from 'react';
// import Dashboard from "./../../compoents/Dashbord"
// const EngineerDashboard = () => {
//   const metrics = {
//     activeEngineers: 140,
//     activeEngineersTrend: 5,
//     activeEngineersStatus: 'success',
//     completedTasks: 82,
//     completedTasksTrend: 12,
//     completedTasksStatus: 'success',
//     pendingTasks: 20,
//     pendingTasksTrend: -2,
//     pendingTasksStatus: 'warning',
//     totalTasks: 102,
//     totalTasksTrend: 8,
//     totalTasksStatus: 'neutral'
//   };

//   // Sample data for charts
//   const taskProgress = [
//     { name: 'Jan', value: 45 },
//     { name: 'Feb', value: 52 },
//     { name: 'Mar', value: 48 },
//     { name: 'Apr', value: 61 },
//     { name: 'May', value: 58 },
//     { name: 'Jun', value: 65 }
//   ];

//   const teamPerformance = [
//     { name: 'Team A', value: 85 },
//     { name: 'Team B', value: 72 },
//     { name: 'Team C', value: 91 },
//     { name: 'Team D', value: 67 }
//   ];

//   return (
//     <Dashboard
//     role="engineer"
    
     
     
//     />
//   );
// };
// export default EngineerDashboard;
import React, { useEffect, useState } from "react";
import { useDispatch,useSelector } from "react-redux";
import Dashbord from "./../../compoents/Dashbord";
import apiClientEngineer from "../../utils/apiClientEngineer";
import apiClientNH from "../../utils/apiClientNH";
import {fetchEngineerTasks,HazardsTickets} from "../../redux/Slice/EngineerSlice"
const EngineerDashboard = ({ debouncedSearchTerm="", statusFilter="", priorityFilter="" }) => {
  
  const email=sessionStorage.getItem("email")
 

  const { tasks, loading, error,Hazards } = useSelector((state) => state.engineer);
  
   const dispatch = useDispatch();

   useEffect(() => {
    const fetchEngineerTasksData = async () => {
      try {
        const response = await apiClientEngineer.get(`/tasks/engineer/${email}`);
        dispatch(fetchEngineerTasks.fulfilled(response.data.tasks));
      } catch (error) {
        console.error("Error fetching engineer tasks:", error);
        dispatch(fetchEngineerTasks.rejected(error.response?.data || "Failed to fetch engineer tasks"));
      }
    };

    const fetchHazardsTicketsData = async () => {
      try {
        const response = await apiClientNH.get(`/hazards/getAllHazards`);
        dispatch(HazardsTickets.fulfilled(response.data.hazards));
      } catch (error) {
        console.error("Error fetching hazard tickets:", error);
        dispatch(HazardsTickets.rejected(error.response?.data || "Failed to fetch hazard tickets"));
      }
    };

    fetchEngineerTasksData();
    fetchHazardsTicketsData();
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
  const engineerData = {
    allTasks: tasks.filter(task => task.status === "open"),
    pendingResponse: tasks.filter(task => task.status === "pending response"),
    inprogressTasks:tasks.filter(task=>task.status==="in-progress"),
    resolvedTickets: tasks.filter(task => task.status === "completed"),
    allHazards:Hazards,
  };
  return <Dashbord role="engineer" ticketStatusData={ticketStatusData} taskPriorityData={taskPriorityData} loading={loading} error={error} data={engineerData} />;
};

export default EngineerDashboard;
