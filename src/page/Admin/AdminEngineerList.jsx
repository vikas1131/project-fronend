import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApprovedEngineers } from "../../redux/Slice/AdminSlice";
import { useNavigate } from "react-router-dom"; 
import AdminNavbar from "./NavBar";
import Loading from "../../compoents/Loadingpage";
import _ from "lodash"; // Import lodash
import { Search } from "lucide-react";

const AdminEngineerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // New state for debounced value
  const [searchTerm, setSearchTerm] = useState(""); 
  const [SpecialistFilter, SetSpecialistFilter] = useState("");
  const { approvedEngineers = [], loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllApprovedEngineers());
   
  }, [dispatch]);

 
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handle); // clear timeout on search term
  }, [searchTerm]);

  if (loading) return <div className="text-center text-gray-500"><Loading/></div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (approvedEngineers.length === 0) return <p className="text-center text-gray-500">No engineers available.</p>;

  // Filter engineers based on search term and specialization
  const filteredEngineer = approvedEngineers.filter(engineer => {
    const matchEngineerName = engineer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesSpecialist = SpecialistFilter ? engineer.specialization.toLowerCase() === SpecialistFilter.toLowerCase() : true;
    return matchesSpecialist && matchEngineerName;
  });

  return (
    <div className="p-4 mt-8 bg-gray 100">
      
      <h1 className="font-bold bg-white rounded-md text-2xl w-full p-3 mb-6">Approved Engineers</h1>

      <div className="relative mb-6">
        
        <input
          type="text"
          placeholder="Search engineers by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Updates instantly, but filtering is debounced
          className="w-full px-5 ml-4 py-2 pl-12 pr-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search
          size={24}
          className="absolute ml-4 left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
      </div>

      <div className="relative mb-6">
        <select
          value={SpecialistFilter}
          onChange={(e) => SetSpecialistFilter(e.target.value)}
          className="w-40 px-4 py-2 ml-4 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Specialization</option>
          <option value="fault">Faults</option>
          <option value="installation">Installation</option>
        </select>
      </div>

      <div className="p-4 mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {filteredEngineer.map((engineer) => (
          <div
            key={engineer._id}
            className="bg-white p-4 shadow-md rounded-lg cursor-pointer hover:shadow-lg"
            // onClick={() => navigate(`/admin/engineer/${engineer.email}`)} 
          >
            <h2 className="text-lg font-semibold">{engineer.name}</h2><hr /><br />
            <p className="text-gray-500">Email: {engineer.email}</p>
            <p className="text-gray-500">Phone: {engineer.phone}</p>
            <p className="text-gray-500">Specialization: {engineer.specialization}</p>
            <p className="text-gray-500">Current Tasks: {engineer.currentTasks}</p>
            <p className="text-gray-500">Address: {engineer.address}</p>
            <p className="text-gray-500">Pincode: {engineer.pincode}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEngineerList;