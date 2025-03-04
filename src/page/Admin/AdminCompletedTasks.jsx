import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllTasks } from "../../redux/Slice/AdminSlice";
import AdminNavbar from "./NavBar";
import AdminTaskCard from "./AdminTaskCard";


const AdminCompletedTasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllTasks()); // Fetch tasks on mount
  }, [dispatch]);

  if (loading) return <div className="text-center text-gray-500">Loading tasks...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  const completedTasks = tasks.filter(task => task.status === "completed");

  if (completedTasks.length === 0) return <p className="text-center text-gray-500">No completed tasks available.</p>;

  return (
    <div className="space-y-6 p-4">
      <AdminNavbar />
      {completedTasks.map((task) => (
        <AdminTaskCard key={task._id || task.id} task={task} />
      ))}
    </div>
  );
};

export default AdminCompletedTasks;
