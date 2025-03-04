import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEngineerTasks, fetchAcceptTask, fetchRejectTask } from '../../redux/Slice/EngineerSlice';
import TaskCard from './TaskCard';
import Loading from "../../compoents/Loadingpage";

const TaskAcceptance = ({ isExpanded }) => { 
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const { tasks, loading, error } = useSelector((state) => state.engineer);
    const [localTasks, setLocalTasks] = useState([]);
    const email = sessionStorage.getItem('email');

    useEffect(() => {
        if (user && user.email) {
            dispatch(fetchEngineerTasks(user.email));
        }
    }, [user?.email, dispatch]);

    useEffect(() => {
        if(Array.isArray(tasks)){
            setLocalTasks(tasks.filter(task => !task.accepted));
        } else {
            setLocalTasks([]); 
        }
    }, [tasks]);

    const handleAcceptTask = (taskId) => {
        try{
            console.log("Accepting taskId:", taskId, "Type:", typeof taskId);
            console.log("User email:", user.email);
            dispatch(fetchAcceptTask({ taskId, email: user.email }))
            setLocalTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, accepted: true } : task
                )
            );
        } catch(error) {
            console.error("Error accepting task:", error);
        } finally {
            dispatch(fetchEngineerTasks(email));
        }
    };

    const handleRejectTask = async (taskId) => {
        try {
            const taskIdString = String(taskId);
            console.log("Rejecting taskId:", taskIdString);

            const response = await dispatch(fetchRejectTask({ taskId: taskIdString, email: user.email })).unwrap();

            if (response && response.success) {
                setLocalTasks((prevTasks) => prevTasks.filter(task => String(task._id) !== taskId));
            } else {
                console.error("Task rejection failed:", response.message);
            }
        } catch (error) {
            console.error("Error rejecting task:", error);
        } finally {
            dispatch(fetchEngineerTasks(email));
        }
    };

    if (loading) return <Loading />;

    return (
        <div className={`transition-all duration-300 ease-in-out p-4 ${isExpanded ? 'ml-[100px]' : 'ml-[40px]'}`}>
            <h1 className='font-bold bg-white rounded-md justify-start text-2xl w-full p-3 mb-6 shadow-sm'>
                <span className="text-black-600">Upcoming Tasks</span>
            </h1>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {localTasks.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center p-10 bg-white rounded-lg shadow border">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">No pending tasks found</p>
                            <p className="text-gray-400 text-sm mt-1">New tasks will appear here when assigned</p>
                        </div>
                    </div>
                ) : (
                    localTasks.map((task) => (
                        <div key={task._id} className="w-full max-w-md">
                            <TaskCard 
                                task={task} 
                                onAccept={handleAcceptTask} 
                                onReject={handleRejectTask} 
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TaskAcceptance;