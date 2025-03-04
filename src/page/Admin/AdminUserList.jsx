import React, { useEffect, useState , useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../redux/Slice/AdminSlice";

import { debounce } from "lodash";

const AdminUserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

   useEffect(() => (setFilteredUsers(users)),[users])
   
  
  const debouncedSearch = useCallback(debounce((searchTerm) => {
    console.log(users, " User information: " )
    setFilteredUsers(
      users.filter((user) =>
        user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
      )
    );
  }, 900), [users]);

  const handledebounce = (e) => {
    debouncedSearch(e.target.value);
    setSearchTerm(e.target.value);
  }



  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
     
      
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">All Users</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handledebounce}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUsers?.length > 0 ? (
            filteredUsers?.map((user) => (
              <div key={user.email} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-800 truncate">
                        {user.name}
                      </h2>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Role</span>
                      <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        {user.role || "User"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        {user.status || "Active"}
                      </span>
                    </div>
                    <span className=" w-full py-2 bg-gray hover:bg-white-200 text-black-900 rounded-md transition-colors duration-300">
                    Address: {user.address} <br/> Phone: {user.phone}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserList;