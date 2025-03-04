import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Dashbord from "./Dashbord";
import ThemeContextProvider from "../ContextAPI/ContextAPI";
import Footer from "./Footer"
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function AdminDashboard() {
  return (
    <>
      <ThemeContextProvider>
        {/* <Route path="/" element={<Home></Home>}/> */}
        <div className="flex">
          <Sidebar />
          <div className="grow ml-16 md:ml-64 h-full lg:h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white ">
            <Navbar />
            <Dashbord />
          </div>
        </div>
      </ThemeContextProvider>
    </>
  );
}
export default AdminDashboard;

