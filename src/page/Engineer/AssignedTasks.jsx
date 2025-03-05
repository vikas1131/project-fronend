import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEngineerTasks, updateTaskStatus } from '../../redux/Slice/EngineerSlice';
import {sendNotification} from '../../redux/Slice/notificationSlice';
import TaskCard from './TaskCard';
import Loading from "../../compoents/Loadingpage";
// import Navbar from '../user/Navbar';

const AssignedTasks = ({ isExpanded }) => { // Accepts isExpanded from Sidebar

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    
    const { tasks = [], loading, error } = useSelector((state) => state.engineer);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [localTasks, setLocalTasks] = useState([]); // Local state to update UI instantly

    useEffect(() => {
        // if (user?.email) {
            const email=sessionStorage.getItem('email')
            console.log('inside atjsx -', email);
        //     dispatch(fetchEngineerTasks(user.email));
        // }
        dispatch(fetchEngineerTasks(email))
    }, [dispatch]);

    useEffect(() => {
        console.log("tasks:", tasks);
        if( tasks && Array.isArray(tasks)){
            setLocalTasks(tasks.filter((task) =>task.accepted === true)); // Sync local state when tasks update
        }
        else{
            setLocalTasks([]); // Clear local state when tasks update
        }
        
    }, [tasks]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setNewStatus(task.status);
        setIsModalOpen(true);
    };

    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };

    const handleUpdateStatus = () => {
        const email = sessionStorage.getItem('email');
        if (selectedTask && newStatus) {
            dispatch(updateTaskStatus({ taskId: selectedTask._id, status: newStatus }));
    
        // Send notification to task's owner when status is deferred
        console.log('user update status: ', user)
        console.log( "sdassadasd",{ 
            taskID: selectedTask._id,  // Ensure this field exists in your task object
            messageTOSend: `Task with ID: ${selectedTask._id} has been deferred by ${email}`, 
            isRead: false 
        }) 
            if (newStatus === "deferred" || newStatus === "failed") {
                const notificationPayload = {
                    // Ensure this exists
                    email: "admin@gmail.com",
                    message: `Task with ID "${selectedTask._id}" has been "${newStatus}" by "${email}"`,
                    isRead: false,
                };
                dispatch(sendNotification(notificationPayload))
                   .then((response) => {
                       console.log("Notification sent:", response);
                   })
                   .catch((error) => {
                        console.error("Error sending notification:", error);
                   });
                
            }
    
            // Update local state for instant UI change
            setLocalTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === selectedTask._id ? { ...task, status: newStatus } : task
                )
            );

            setIsModalOpen(false);
        }
    };

    if (loading) return <Loading />;        
    if (error) return <div>{error.message}</div>;

    return (
        <div className={`transition-all duration-300 ease-in-out p-4 
            ${isExpanded ? 'ml-[100px] lg:ml-[100px] xl:ml-[100px]' : 'ml-[10px] lg:ml-[40px] xl:ml-[40px]'}`}
        >
            {/* <Navbar /> */}
            <h1 className=' font-bold bg-white rounded-md  justify-start text-2xl  w-full h-50  p-3 mb-6'> My Tickets  </h1>

            {/* Responsive Grid Layout */}
            {localTasks.length === 0 ?(
                <div className="text-center text-xl text-gray-500">No tasks assigned to you</div>
            ):
            (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {localTasks.map((task) => (
                    <div
                        key={task._id}
                        className="w-full max-w-md bg-white rounded-lg shadow hover:shadow-lg 
                        transition-shadow cursor-pointer border h-full"
                        onClick={() => handleTaskClick(task)}
                    >
                        <TaskCard task={task} showPriority={true} assignEngineer={false}/>
                    </div>
                ))}
            </div>
        )}   

            {/* Modal */}
            {isModalOpen && selectedTask && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ cursor: 'grab' }} // Makes modal draggable
                    draggable // Enables dragging
                >
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div
                        className="relative bg-white rounded-lg w-full max-w-2xl m-4 p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-bold text-center mb-4">
                            {selectedTask.serviceType}
                        </h2>

                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-gray-500 text-sm mb-2">
                            <strong>Created On:</strong> {new Date(selectedTask.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-sm mb-2">
                            <strong>Updated On:</strong> {new Date(selectedTask.updatedAt).toLocaleDateString()}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full ${getStatusStyle(selectedTask.status)}`}>
                                {selectedTask.status}
                            </span>
                            <button className={`px-3 py-1 text-white font-medium flex items-center space-x-1 rounded-lg ${getPriorityStyle(selectedTask.priority)}`}>
                                <span>{selectedTask.priority}</span>
                                <span className="text-lg">▲</span>
                            </button>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="font-medium mb-2">Description</h4>
                            <p className="text-gray-600">{selectedTask.description}</p>
                        </div>

                        <div className="mb-4">
                            <label htmlFor='task-status' className="font-medium">Change Task Status:</label>
                            <select
                            id="task-status"
                                value={newStatus}
                                onChange={handleStatusChange}
                                className="block w-full mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="open">Open</option>
                                <option value="in-progress">In Progress</option>
                                <option value="deferred">Deferred</option>
                                <option value="failed">Failed</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <button
                            onClick={handleUpdateStatus}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Update Status
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* Utility functions for status & priority styles */
const getStatusStyle = (status) => {
    switch (status) {
        case 'open': return 'bg-yellow-200 text-yellow-700';
        case 'in-progress': return 'bg-blue-200 text-blue-700';
        case 'deferred': return 'bg-gray-300 text-gray-800';
        case 'completed': return 'bg-green-200 text-green-700';
        case 'failed': return 'bg-red-200 text-red-700';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const getPriorityStyle = (priority) => {
    switch (priority) {
        case 'high': return 'bg-red-500';
        case 'medium': return 'bg-orange-500';
        case 'low': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
};

// const taskListStyles = {
//     display: 'flex',
//     // flexWrap: 'wrap',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: '20px',
//     width: '80%',
//     flexDirection: 'column',
//     margin: '0 auto',
    
//   };

export default AssignedTasks;
