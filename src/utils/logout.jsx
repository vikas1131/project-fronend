import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiClientUser from "./apiClientUser";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      // await apiClientUser.post("/users/logout");

      // Clear both sessionStorage & localStorage
      ["token", "role", "email"].forEach((item) => {
        sessionStorage.removeItem(item);
        localStorage.removeItem(item);
      });

      setTimeout(() => navigate("/login"), 1000); // Small delay to show toast
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
      toast.error("Failed to logout. Please try again.");
    }
  }, [navigate]);

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  return <ToastContainer position="top-right" autoClose={3000} />;
};

export default Logout;



