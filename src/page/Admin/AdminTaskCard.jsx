import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, User } from "lucide-react";
import apiClient from "../../utils/apiClientAdmin";
import { fetchAllTasks } from "../../redux/Slice/AdminSlice";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";

const AdminTaskCard = ({ task = {} }) => {
 

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Button, SetButton] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (showAssigneeDropdown) {
      fetchEligibleEngineers();
    }
    if (location.pathname === "/admin/deferred") {
      SetButton(true);
    }
  }, [showAssigneeDropdown, location]);

  const fetchEligibleEngineers = async () => {
    setLoading(true);
    try {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const currentDay = days[new Date().getDay()];
      
      // Updated API endpoint to get eligible engineers for this specific ticket
      const response = await apiClient.get(
        `/admin/engineers/eligible/${task._id}/${currentDay}`
      );

      console.log("eligible response data:", response.data);
      
      if (!response.data) {
        throw new Error("Failed to fetch engineers");
      }

      if (response.data.success) {
        setAvailableEngineers(response.data.engineers);
        
        // If no eligible engineers are available
        if (response.data.engineers.length === 0) {
          toast.warning(`No eligible engineers available with ${task.serviceType} specialization for today`);
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch eligible engineers");
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch eligible engineers");
      console.error("Error fetching engineers:", err);
      toast.error("Failed to fetch eligible engineers");
    } finally {
      setLoading(false);
    }
  };

  const handleReassignEngineer = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!task || !task._id) {
        throw new Error("Invalid task information");
      }

      if (!email) {
        throw new Error("Invalid engineer ID");
      }

      // Make the API call
      const response = await apiClient.patch(
        `/admin/reassign/${task._id}/${email}`
      );
      
      if (!response || !response.data || !response.data.success) {
        const errorMessage = response?.data?.message || "Failed to reassign engineer";
        throw new Error(errorMessage);
      }
      
      const selectedEngineer = availableEngineers.find(
        (eng) => eng.email === email
      );

      if (!selectedEngineer) {
        throw new Error(
          "Selected engineer not found in available engineers list"
        );
      }

      // Close the dropdown
      setShowAssigneeDropdown(false);
      
      // Show success toast message
      toast.success(`Task reassigned to ${selectedEngineer.name} successfully!`);
      
      // Update the tasks list after reassignment
      dispatch(fetchAllTasks());
    } catch (err) {
      console.error("Error reassigning engineer:", err);
      setError(err.message || "Failed to reassign engineer");
      toast.error(err.message || "Failed to reassign engineer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow ml-30 mt-10 md:ml-0">
      {/* Card Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {task.serviceType.replace(/^\w/, (c) => c.toUpperCase())}
          </h3>
          <span className={getStatusStyle(task.status)}>{task.status}</span>
          <span className={getPriorityStyle(task.priority)}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        <p className="text-gray-600 ">Description : {task.description}</p>
        <p className="text-gray-600 ">Address : {task.address}</p>
        <p className="text-gray-600 ">Pincode : {task.pincode}</p>
        

        {/* Current Assignee */}
        <div className="flex items-center justify-between">
          <div className="flex-col items-center space-x-2">
            <p className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>
                Current Engineer: {task.engineerEmail || "Unassigned"}
              </span>
            </p>
            <br />
            <div className="flex lg:items-center lg:space-x-20 space-y-1 lg:space-y-0">
              <p className="text-gray-600">
                Created At: {new Date(task.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Updated At: {new Date(task.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {Button && (
            <div  className="lg:ml-auto lg:mt-0 mt-">

            <button
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              className="px-1 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mt-4 lg:mt-0"
              disabled={loading}
            >
              {loading ? "Processing..." : "Reassign"}
            </button></div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* Engineer Dropdown */}
        {showAssigneeDropdown && (
          <div className="mt-2 border rounded-lg shadow-lg">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {availableEngineers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No eligible engineers available with {task.serviceType} specialization
                  </div>
                ) : (
                  availableEngineers.map((engineer) => (
                    <div
                      key={engineer._id}
                      onClick={() =>
                        !loading && handleReassignEngineer(engineer.email)
                      }
                      className={`p-3 hover:bg-gray-50 cursor-pointer border-b flex items-center justify-between ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {engineer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{engineer.name}</div>
                          <div className="text-sm text-gray-500">
                            Current Load: {engineer.currentTasks} tasks
                          </div>
                          <div className="text-sm text-gray-500">
                            Specialization: {engineer.specialization}
                          </div>
                          <div className="text-sm text-gray-500">
                            Address: {engineer.address}
                          </div>
                          <div className="text-sm text-gray-500">
                            Pincode: {engineer.pincode}
                          </div>
                          <div className="text-sm text-gray-500">
                            Email: {engineer.email}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-green-500">Available</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

const getStatusStyle = (status) => {
  const styles = {
    completed: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    deferred: "bg-gray-100 text-gray-800",
    failed: "bg-red-100 text-red-800",
    open: "bg-yellow-100 text-yellow-800"
  };
  return `px-3 py-1 rounded-full text-sm ${
    styles[status?.toLowerCase()] || styles.pending
  }`;
};

const getPriorityStyle = (priority) => {
  const styles = {
    high: "bg-red-100 text-red-800", // High priority - Red
    medium: "bg-orange-100 text-orange-800", // Medium priority - Orange
    low: "bg-yellow-100 text-yellow-800", // Low priority - Yellow
  };

  return `px-3 py-1 rounded-full text-sm ${
    styles[priority?.toLowerCase()] || styles.low
  }`;
};

export default AdminTaskCard;