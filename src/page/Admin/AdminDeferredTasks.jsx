import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminTaskCard from "./AdminTaskCard";
import Loading from "../../compoents/Loadingpage";
import { fetchAllTasks } from "../../redux/Slice/AdminSlice";

const AdminDeferredTasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllTasks()); // Fetch all tasks on mount
  }, [dispatch]);

  if (loading) {
    return <div className="text-center text-gray-500"><Loading /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // Filter tasks to show only deferred, unassigned, or failed tasks
  const filteredTasks = tasks?.filter(task => 
    task.status.toLowerCase() === 'deferred' || 
    task.engineerEmail === null || 
    task.status.toLowerCase() === "failed"
  ) || [];

  return (
    <div>
      <h1 className='font-bold bg-white rounded-md justify-start text-2xl w-full ml-0 p-3 mb-2 shadow-sm'>
        <span className="text-black-600">Deferred / Failed Tasks</span>
      </h1>
      <div className="space-y-6 p-4">
        {filteredTasks.length > 0 ? (
          <div className="flex flex-wrap gap-16 ml-0 mt-0">
            {filteredTasks.map((task) => (
              <AdminTaskCard key={task._id || task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="col-span-full flex items-center justify-center p-10 bg-white rounded-lg shadow border">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No deferred/ failed tickets found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDeferredTasks;