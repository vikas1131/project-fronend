import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

import Navbar from './Navbar';



const UserLayout = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [sidebarvisble, SetSidebarvisble] = useState(false);

  const  toggleSidebar = () => {
    SetSidebarvisble(!sidebarvisble);
  }

  // Handle scroll event
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
 
      <div className="flex flex-col h-screen">
        {/* Fixed Navbar */}
        <Navbar  toggleSidebar={ toggleSidebar}/>
       

        {/* Main Content Area */}
        <div className="flex flex-1 mt-14 relative">
          {/* Fixed Sidebar */}
          <Sidebar 
          isopen = { sidebarvisble}
          onSidebarClose= {() => SetSidebarvisble(false)}
            isExpanded={isSidebarExpanded} 
            setIsExpanded={setIsSidebarExpanded} 
          />

          {/* Scrollable Content Area */}
          <div
            className={`
              flex-1 overflow-y-auto p-4 transition-all duration-300
             dark:bg-gray-900
              ${isSidebarExpanded ? 'ml-[50px]' : 'ml-[20px]'}  /* Adjust these values to match your Sidebar widths */
                lg:ml-14 /* On medium/small screens, remove the margin to overlay content */
            `}
          > 
            <Outlet />
          </div>
        </div>
      </div>

  );
};

export default UserLayout;
//mt-10 ml-50 md:ml-20 transition-all duration-300 change width transition here transition