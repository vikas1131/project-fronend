import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      toast.error("Please log in to access this page."); // Display error toast message
      setTimeout(() => navigate("/login"),200 );
      //navigate("/login"); // Redirect to login if no token
    } else if (!allowedRoles.includes(role)) {
      toast.error("Please log in to access this page."); // Display
      setTimeout(() => navigate("/unauthorized"),1000 );

      // Redirect if role is not allowed
    }
  }, [navigate, location, allowedRoles]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {children}
    </>
  );
};

export default ProtectedRoute;

