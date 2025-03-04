import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./Sidebar";
import AdminNavbar from "./../../compoents/Navbar";


const AdminLayout = () => {
 const [sidebarvisble, SetSidebarvisble] = useState(false);

  const toggleSidebar = () => {
    SetSidebarvisble(!sidebarvisble);
  };
  return (
    // <ThemeContextProvider>
      <div className="relative mt-12">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        {/* Sidebar is fixed and should be placed below the navbar */}
        <AdminSidebar  isopen = { sidebarvisble}  onSidebarClose={() => SetSidebarvisble(false)}/>
        {/* Main content area: add top margin to offset fixed navbar  mt-16 md:ml-20 lg:ml-64 px-4 py-6 transition-all duration-300*/}

        <div className="mt-7 lg:ml-20 ms:ml-0 transition-all duration-300 ">
          <Outlet />
        </div>
      </div>
  
  );
};

export default AdminLayout;
