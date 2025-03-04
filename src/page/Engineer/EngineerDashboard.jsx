import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar"; // Assuming Navbar is a top navigation bar.
import  { useState } from 'react';

const EngineerLayout = () => {

  const [sidebarvisble, SetSidebarvisble] = useState(false);

  const toggleSidebar = () => {
    SetSidebarvisble(!sidebarvisble);
  };

  return (
    <div className="flex flex-col h-screen">

      {/* This makes the layout take full screen */}
      {/* Top Navbar */}
      <Navbar  toggleSidebar={toggleSidebar}  onToggle={(state) => SetSidebarvisble(state)}/>
      <div className="flex flex-1 ">
        {" "}
        {/* Flex container for sidebar and content */}
        {/* Sidebar */}
        <Sidebar isopen = { sidebarvisble}  onSidebarClose={() => SetSidebarvisble(false)} />
        {/* Main Content Area */}
        <div className="flex-1 mt-10  md:ml-20 transition-all duration-300 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white p-6">
          {/* Child routes will be rendered here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default EngineerLayout;
