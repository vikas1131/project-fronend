// components/TaskSearchBar.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTasksByCriteria } from '../../redux/Slice/AdminSlice'; // Create this thunk

const TaskSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const dispatch = useDispatch();

  const handleSearch = () => {
    // Dispatch the action with search criteria
    dispatch(fetchTasksByCriteria({ query: searchQuery, priority: priorityFilter }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks..."
        className="p-2 border rounded-md w-full md:w-1/2"
      />
      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="p-2 border rounded-md"
      >
        <option value="all">All</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Search
      </button>
    </div>
  );
};

export default TaskSearchBar;
