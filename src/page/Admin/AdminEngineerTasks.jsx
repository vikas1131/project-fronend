import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEngineerTasks } from "../../redux/Slice/AdminSlice"; 
import { useParams } from "react-router-dom";

import AdminTaskCard from "./AdminTaskCard"; 

const AdminEngineerTasks = () => {
  const { email } = useParams(); 
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    if(email){
      dispatch(fetchEngineerTasks(email)); 
    }
  }, [dispatch, email]);

  if (loading) return <div className="text-center text-gray-500">Loading tasks...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!tasks || tasks.length === 0) return <p className="text-center text-gray-500">No tasks assigned.</p>;

  return (
    <div className="space-y-6 p-4">
      
      <h2 className="text-xl font-bold text-center">Tasks Assigned to Engineer</h2>
      {tasks.map((task) => (
        <AdminTaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default AdminEngineerTasks;
