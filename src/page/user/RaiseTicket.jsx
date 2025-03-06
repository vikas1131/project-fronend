// TicketForm.jsx
import React, { useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import CustomCard from "./../../compoents/CustomCard";
import { submitTicket } from "../../redux/Slice/raiseticke";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./../../compoents/footers";
import {sendNotification} from '../../redux/Slice/notificationSlice';

const email = sessionStorage.getItem('email');

const token = sessionStorage.getItem('token');
console.log(email, token);

const TicketForm = () => {  
  const [ticketForm, setTicketForm] = useState({
    serviceType: "installation",
    address: "",
    description: "",
    pincode: "",
  });
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const Raisetickets = useSelector((state) => state.Raisetickets);
  const user = useSelector((state) => state.auth.user);

  const handleSubmit = async (e) => {
    const email = sessionStorage.getItem('email');
    e.preventDefault();
    console.log("djabfkalnsdlmfasdfasdf", email)
    if (!email) {
      toast.error("User email not found!");
      return;
  }
  setLoading(true);
  try {
    const response = await dispatch(submitTicket({ ...ticketForm, email }));
    console.log("ahdkjfkaldsf", response.payload.ticket);
    const ticketData = response?.payload?.ticket.ticket
    

    if (!ticketData) {
      throw new Error("Ticket data is missing in the response");
  }
    toast.success("Ticket submitted successfully!");
    
    // Reset form on success
    setTicketForm({
      serviceType: "installation",
      address: "",
      description: "",
      pincode: "",
      city:"Bengaluru", 
    });
    if (ticketData?.engineerEmail) {
      const notificationPayload = {
        // Ensure this exists
        email: ticketData?.engineerEmail,
        message: `Task ${ticketData._id} has been raised by ${ticketData.userEmail}`,
        isRead: false,
      };
      console.log("notificationPayload:", notificationPayload);
      await dispatch(sendNotification(notificationPayload))
        .then((response) => {
          console.log("Notification sent:", response);
        })
        .catch((error) => {
          console.error("Error sending notification:", error);
        });
    }      
  } catch (err) {
    console.error("Failed to submit ticket:", err);
    toast.error("Failed to submit ticket!");
  }
  finally{
    setLoading(false);
  }
};


  const inputStyles =
    "w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1 ";

  return (
    <div className="">
   <div className="mb-20">
   <CustomCard title="Raise New Ticket" icon={AlertTriangle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelStyles}>Service Type</label>
          <select
            className={inputStyles}
            value={ticketForm.serviceType}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, serviceType: e.target.value })
            }
            required
          >
            <option value="installation">New Installation</option>
            <option value="fault">Fault Report</option>
            {/* <option value="maintenance">Maintenance Request</option> */}
          </select>
        </div>
        <div>
          <label className={labelStyles}>Address</label>
          <input
            type="text"
            className={inputStyles}
            
            placeholder="Address"
            value={ticketForm.address}
            onChange={(e) =>
              setTicketForm({ ...ticketForm,  address: e.target.value })
            }
            required
          />

        </div>
        <div>
          <label className={labelStyles}>Description</label>
          <textarea
            className={inputStyles}
            rows={4}
            placeholder="Describe your issue or request in detail"
            value={ticketForm.description}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, description: e.target.value })
            }
            required
          />
        </div>
        <div>
        <label className={labelStyles}>City</label>
        <select
          className={inputStyles}
          value={ticketForm.city}
          onChange={(e) =>
            setTicketForm({ ...ticketForm, city: e.target.value })
          }
          required
        >
          <option value="Select">Select City</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Chennai">Chennai</option>
        </select>
        </div>


        <div>
          <label className={labelStyles}>Pincode</label>
          <input
            type="tel"
            className={inputStyles}
            placeholder="Enter pincode"
            value={ticketForm.pincode}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, pincode: e.target.value })
            }
            required
          />
        </div>

      

        <button
  type="submit"
  disabled={isLoading}
  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Submitting...
    </>
  ) : (
    <>
      <Send size={16} />
      Submit Ticket
    </>
  )}
</button>
      </form>
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
      
    </CustomCard>
   </div>
    </div>
     
  );
};

export default TicketForm;
