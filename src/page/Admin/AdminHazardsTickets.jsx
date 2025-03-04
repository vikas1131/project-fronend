import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { MapPin, AlertTriangle, Send, X} from "lucide-react";
import CustomCard from "../../compoents/CustomCard";
import { HazardsTicket } from "../../redux/Slice/raiseticke";
import { useDispatch} from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminHazardsTickets = () => {

  const [ticketForm, setTicketForm] = useState({
   hazardType: "",
   description: "",
   riskLevel: "medium",
   address: "",
   pincode:""
  });
  // const navigate = useNavigate()
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCancel = () => {
     toast.success("Cancelled!");
      setTimeout(() => {
      navigate('/admin/hazards');
    }, 1000); // Delay navigation by 1 second
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  
    // Make sure the data matches the backend's expected format
    const formData = {
      hazardType: ticketForm.hazardType,
      description: ticketForm.description,
      riskLevel: ticketForm.riskLevel,
      address: ticketForm.address,
      pincode: ticketForm.pincode,
    };

    try {
      const response = await dispatch(HazardsTicket(formData));
      console.log("Ticket submitted successfully:", response);
      if (response.payload.success === true) {
        toast.success("Hazard submitted successfully!");
        setTimeout(() => {
          navigate('/admin/hazards');
        }, 1000); // Delay navigation by 1 second
      }
      // console.log("Ticket submitted successfully:", response);
      // Reset form on success
      setTicketForm({
        hazardType: "", // Default value, can be changed by the user
        description: "",
        riskLevel: "medium", // Default, can be changed by the user
        address: "",
        pincode: "",
      });
      //  navigate("/admin/hazards")
    } catch (err) {
      toast.error("Failed to add new hazard! please try again later.");
      console.error("Failed to submit Hazard:");
    }
  };
    const inputStyles =
    "w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent justify-center";

  return (
    <CustomCard title="Add New Hazards" icon={AlertTriangle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hazard Type
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hazard Title"
            value={ticketForm.hazardType}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, hazardType: e.target.value })
            }
            required
          />

        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Address"
            value={ticketForm.address}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, address: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Describe hazard in detail"
            value={ticketForm.description}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, description: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <select
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={ticketForm.riskLevel}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, riskLevel: e.target.value })
            }
          >
            <option value="low">Low - Not Urgent</option>
            <option value="medium">Medium - Needs Attention</option>
            <option value="high">High - Urgent Issue</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter Pincode
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={ticketForm.pincode}
            onChange={(e) =>
              setTicketForm({ ...ticketForm, pincode: e.target.value })
            }
          />
        </div>

        <div className="flex justify-between">
        <button
            onClick={handleCancel}
           className="w-40 flex items-center justify-center gap-2 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="w-40 flex items-center justify-center bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          <span className="flex items-center justify-center w-full gap-2">
            <Send size={16} />
            Submit
          </span>
        </button>

        
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </CustomCard>
  );
};

export default AdminHazardsTickets;
