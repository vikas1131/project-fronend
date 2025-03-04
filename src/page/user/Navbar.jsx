import React, { useState} from 'react';
import {  Menu, LogOut ,User } from "lucide-react";

import { Link } from 'react-router-dom';


const Navbar = ({ toggleSidebar}) => {
 
   const [isProfileOpen, setIsProfileOpen] = useState(false);
   const userName = sessionStorage.getItem("email") || "";
   console.log(" userName: " + userName);

   const Name = userName ? userName?.split("@")[0] : "Guest";


  return (
    <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left side - Mobile menu and Search */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 
              bg-clip-text text-transparent hidden sm:block md:block">
              Telecom Services
        </h1>
        
        <button className="md:hidden  flex gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" onClick={toggleSidebar}>
          <Menu size={24} />
          
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 
              bg-clip-text text-transparent sm:hidden">
    TS
</h1>
      </div>

      {/* Right side - Notifications, Theme Toggle, Profile */}
     
  
        {/* Profile Section */}
          {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
       

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Name}
            </span>
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg dark:bg-gray-700">
            
              <button
                onClick={() => console.log('Logout clicked')}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span><Link to="/logout">Logout</Link></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;