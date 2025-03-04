import React, { useEffect, useState } from "react";

const TaskCard = ({ task, onAccept, onReject }) => {
  const [showButtons, setShowButtons] = useState(false);
  
  useEffect(() => {
    // Check the current path and set showButtons accordingly
    const currentPath = window.location.pathname;
    if (currentPath.includes("/engineer/task/acceptance")) {
      setShowButtons(true);
    } else if (currentPath.includes("/engineer/assignedTasks")) {
      setShowButtons(false);
    }
  }, []);

  return (
    <div className="group relative bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-lg 
    hover:shadow-xl transition-shadow duration-300 border border-gray-200 
    hover:border-blue-200 flex flex-col h-full">

      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Service Type : {task.serviceType}</h3>
          <br />
          <span className={`text-sm ${getStatusStyle(task.status)}`}>
            Status: {task.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">Description : {task.description}</p>
        <p className="text-gray-600 text-sm">Address : {task.address}</p>
        <p className="text-gray-600 text-sm">Pincode : {task.pincode}</p>

        {/* Priority Indicator */}
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></span>
          <span className="text-sm text-gray-500">Priority: {task.priority}</span>
        </div>

        {/* Customer Info - Add if available */}
        {task.customer && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Customer Info</h4>
            <p className="text-sm text-gray-600">{task.customer.name || 'Name not available'}</p>
            <p className="text-sm text-gray-600">{task.customer.contact || 'Contact not available'}</p>
          </div>
        )}

        {/* Due Date and Assignee */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-500">
              Created: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm text-gray-500">
              Updated: {new Date(task.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons - Conditionally rendered based on the path */}
        {showButtons && (
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onAccept(task._id)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium transition-transform hover:scale-105 hover:shadow-md flex items-center justify-center w-5/12"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Accept
            </button>
            <button
              onClick={() => onReject(task._id)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium transition-transform hover:scale-105 hover:shadow-md flex items-center justify-center w-5/12"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for styling
const getStatusStyle = (status) => {
  if (!status) return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full";
  
  switch (status.toLowerCase()) {
    case "completed":
      return "text-green-600 bg-green-100 px-2 py-1 rounded-full";
    case "in-progress":
      return "text-blue-600 bg-blue-100 px-2 py-1 rounded-full";
    case "open":
      return "text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full";
      case "failed":
      return "text-red-600 bg-red-100 px-2 py-1 rounded-full";

    default:
      return "text-gray-600 bg-gray-100 px-2 py-1 rounded-full";
  }
};

const getPriorityColor = (priority) => {
  if (!priority) return "bg-gray-400";
  
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-orange-500";
    case "low":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
};

export default TaskCard;