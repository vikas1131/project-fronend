import React, { useEffect, useState,  useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HazardsTickets ,HazardsUpdateTickets, HazardsDeleteTickets} from '../../redux/Slice/EngineerSlice';
import { Link, useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from 'lodash';  // Lodash is a utility library that provides a debounce function



const EngineerHazards = () => {
  const { Hazards, loading, error } = useSelector((state) => state.engineer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [debouncedUpdate, setDebouncedUpdate] = useState([])

  const [updateFormData, setUpdateFormData] = useState({
    hazardType: '',
    description: '',
    riskLevel: '',
    address: '',
    pincode: '',
  });


  useEffect(() => {
    dispatch(HazardsTickets({})); // Fetch hazard tickets on mount
  }, [dispatch]);
  

  useEffect(() => {
    if (Hazards && Hazards.length > 0) {
      setFilteredTasks((prev) => {
        // Only update if Hazards changed
        if (JSON.stringify(prev) !== JSON.stringify(Hazards)) {
          return Hazards;
        }
        return prev;
      });
    }
  }, [Hazards]);
  // useEffect(() => {
  //   setFilteredTasks(Hazards);  // Show all hazards initially
  // }, [Hazards]);

  const handleDebouncedUpdate = useCallback(
    debounce((value) => {
      setFilteredTasks(
        Hazards.filter((task) =>
          task.hazardType.toLowerCase().includes(value.toLowerCase())
        )
      );
    }, 500),
    [Hazards]
  );
  
  const handleSearchChange = (e)=>{
    setSearchTerm(e.target.value);
    handleDebouncedUpdate(e.target.value);
  }
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    setUpdateFormData({
      _id:task._id,
      hazardType: task.hazardType,
      description: task.description,
      riskLevel: task.riskLevel,
      address: task.address,
      pincode: task.pincode,
    });
    setIsUpdateModalOpen(true);
    setIsModalOpen(false);
  };

 const handleDeleteClick = (task)=>{
  
   setIsUpdateModalOpen(false)
   console.log("deleted Hazards submitted:", task._id);
   dispatch(HazardsDeleteTickets(task._id))
   //navigate('/engineer/Hazards')
   toast.success("Hazards deleted successfully!");
 }
 
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setIsUpdateModalOpen(false);
    // console.log("update Hazards submitted:", updateFormData);
  dispatch(HazardsUpdateTickets(updateFormData))
    
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getHazardStyles = (level) =>{
    const styles = {
      low: 'bg-yellow-200',
      medium : 'bg-orange-200',
      high : 'bg-red-200'
    }
    return styles[level] || "bg-gray-200";
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md p-6 mb-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">Hazards Tasks</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white  px-2 py-1 md:p-2 rounded-lg transition-all ">
            <Link to="/engineer/RiseTickets">Add Hazards</Link>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
       
        <input
          type="text"
          placeholder="Search by hazard type"
        
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-15"
          />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => handleTaskClick(ticket)}
                className={`border p-4 rounded-lg cursor-pointer hover:shadow-md transition ${getHazardStyles(ticket.riskLevel)}`}
              >
                <h3 className="font-bold">Hazard : {ticket.hazardType}</h3>
                <p className='break-words whitespace-normal overflow-hidden text-ellipsis max-h-20'>Description : {ticket.description}</p>
                <p className="text-sm text-black-500"><span>Risk level : </span>{ticket.riskLevel}</p>
                <p className="text-sm text-black-500">Pincode : {ticket.pincode}</p>
              </div>
            ))
          ) : (
            <p> Hazards not founds </p>
          )}
        </div>
      </div>

      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto mt-20">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{selectedTask.hazardType}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Risk Level</h4>
                <span className={`px-3 py-1 rounded-full text-sm ${getHazardStyles(selectedTask.riskLevel)
                  // selectedTask.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  // selectedTask.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  // 'bg-green-100 text-green-800'
                }`}>
                  {selectedTask.riskLevel}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg max-h-[200px] overflow-auto break-words whitespace-normal">
                <h4 className="font-medium">Description</h4>
                <p>{selectedTask.description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">Address</h4>
                <p>{selectedTask.address}</p>
                <p>Pincode: {selectedTask.pincode}</p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => handleUpdateClick(selectedTask)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Update</button>
              <button onClick={()=>{handleDeleteClick(selectedTask); setIsModalOpen(false)}} className="bg-red-500 text-white px-4 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

{isUpdateModalOpen && selectedTask && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg w-full max-w-lg p-3">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">Update Hazard</h2>
        <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <form onSubmit={handleUpdateSubmit} className="mt-1 ">
        <label>Hazard Type</label>
        <input type="text" name="hazardType" value={updateFormData.hazardType} onChange={handleInputChange} className="w-full p-2 border rounded" required />

        <label>Description</label>
        <textarea name="description" value={updateFormData.description} onChange={handleInputChange} rows="2" className="w-full p-2 border rounded" required />

        <label>Risk Level</label>
        <select name="riskLevel" value={updateFormData.riskLevel} onChange={handleInputChange} className="w-full p-2 border rounded" required>
          <option value="">Select Risk Level</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Address</label>
        <input type="text" name="address" value={updateFormData.address} onChange={handleInputChange} className="w-full p-2 border rounded" required />

        <label>Pincode</label>
        <input type="text" name="pincode" value={updateFormData.pincode} onChange={handleInputChange} className="w-full p-2 border rounded" required />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
        </div>
      </form>
    </div>
  </div>
)}

       <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
};

export default EngineerHazards;




// Sure! Implementing a debounce method for your search bar can help improve performance by limiting the number of times the search function is called. Here's a step-by-step guide to implement debounce in your search bar:

// Install lodash (optional): Lodash is a utility library that provides a debounce function. If you don't have it installed, you can install it using:

// npm install lodash
// Import debounce from lodash: Import the debounce function in your component file:

// import { debounce } from 'lodash';
// Create a debounced function: Create a debounced version of your search function. You can do this inside your component:

// const debouncedSearch = debounce((value) => {
//   setFilteredTasks(Hazards.filter((task) => task.pincode.toLowerCase().includes(value.toLowerCase())));
// }, 300); // Adjust the delay as needed
// Update the search input handler: Update your search input handler to use the debounced function:

// const handleSearchChange = (e) => {
//   const value = e.target.value;
//   setSearchTerm(value);
//   debouncedSearch(value);
// };
// Modify the input element: Update the onChange event of your search input to use the new handler:

// <input
//   type="text"
//   placeholder="Search by hazard type"
//   value={searchTerm}
//   onChange={handleSearchChange}
//   className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-20"
// />
