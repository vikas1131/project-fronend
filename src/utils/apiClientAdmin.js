import axios from "axios";
import API_ADMIN_URL from "../config/apiConfigAdmin";
// import https from "https";

const apiClient = axios.create({
  baseURL: API_ADMIN_URL,
    //withCredentials: true, // Ensures cookies are sent with requests
    headers: {
      "Content-Type": "application/json", // Ensure JSON format
  },

});

// Attach token dynamically
apiClient.interceptors.request.use((config) => {
  try{
    const token = sessionStorage.getItem("token");
    const email = sessionStorage.getItem("email");
    const role = sessionStorage.getItem("role");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (email) {
      config.headers["X-User-Email"] = email; // Pass user email in headers
  }
  else {
    delete config.headers["X-User-Email"];
  }
  if (role) {
      config.headers["X-User-Role"] = role; // Pass user role in headers
  }
  else {
    delete config.headers["X-User-Role"];
  }
  }catch(error){
    console.error("Error accessing sessionStorage:", error);
  }
    return config;
}, (error) =>{
  return Promise.reject(error);
});

let isRedirecting = false;

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            if (!isRedirecting) {
                isRedirecting = true;
                console.log("Session expired, logging out...");
                sessionStorage.clear();
                if (typeof window !== "undefined") {
                  window.location.href = "/login";
              }
                //window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);




export default apiClient;
