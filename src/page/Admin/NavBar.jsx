import React, { useState } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";


const AdminNavbar = ({}) => {


  return (
    <nav className="fixed top-0 left-0 w-full h-16   sm:justify-between justify-end bg-white border-b border-gray-300 px-4 flex items-center z-50">
       <h1 className="text-2xl font-bold bg-gradient-to-r justify-start from-blue-600 to-blue-400 
              bg-clip-text text-transparent hidden sm:block md:block">
              Telecom Services
        </h1>
      {/* Left side - Logout, Theme Toggle, Profile */}
      <div className="flex items-center space-x-4">
        <Link to="/logout">
          <LogOut className="text-gray-700 hover:text-blue-500 transition-colors" />
        </Link>
      


        <div className="flex items-center space-x-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-700">Admin Name</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-500"></div>
        </div>
      </div>


    </nav>
  );
};

export default AdminNavbar;
