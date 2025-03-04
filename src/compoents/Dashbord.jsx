import React from "react";
import { 
  FaRegClock,
  FaUserCog,
  FaUsers,
  FaBox,
  FaUserPlus,
  FaClipboard,
  FaClipboardCheck,
  FaShieldAlt,
  FaClipboardList,
  FaBug,
  FaBan,
} from "react-icons/fa";
import { Bar,Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,ArcElement, Title, Tooltip } from "chart.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "./Card";
import { data } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, BarElement,ArcElement, Title, Tooltip);

const Dashboard = ({ ticketStatusData, taskPriorityData,data }) => {
  const role = sessionStorage.getItem("role");

  const getCardConfig = (role) => {
    const { openTickets=[],allTasks=[],failedTasks=[],inprogressTasks=[], allEngineers=[], resolvedTickets=[], approvedEngineers=[],completedTasks=[],pendingTasks=[],totalTasks=[],activeEngineers=[],allHazards=[]} = data;
    console.log("data",data)
    const cardData = {
      user: [
        { icon: < FaClipboardList/>, title: "Total Tickets", value: totalTasks?.length },
        { icon: <FaClipboardCheck />, title: "Completed Tickets", value: completedTasks?.length },
        { icon: <FaRegClock />, title: "Pending Tickets", value: totalTasks?.length+inprogressTasks?.length },
        { icon: <FaBan />, title: "Failed Tickets", value: failedTasks?.length },
      ],
      engineer: [
        { icon: <FaClipboard />, title: "My Active Tickets", value: allTasks?.length },
        { icon: <FaRegClock />, title: "Pending Tickets", value: allTasks?.length+inprogressTasks?.length },
        { icon: <FaClipboardCheck />, title: "Completed Tickets", value: resolvedTickets?.length },
        { icon: <FaShieldAlt />, title: "All Hazards", value: allHazards?.length },
      ],
      admin: [
        { icon: <FaClipboard />, title: "Open Tickets", value: openTickets?.length },
        { icon: <FaClipboardCheck/>, title: "Resolved Tickets", value: resolvedTickets?.length},
        { icon: <FaUserPlus />, title: "New Engineers", value: allEngineers?.length-approvedEngineers?.length  },
        { icon: <FaUsers/>, title: "Approved Engineers", value: approvedEngineers?.length },
      ],
    };
    return cardData[role] || [];
  };

  const cardConfig = getCardConfig(role,data);

  return (
    <div className="grow p-6 dark:bg-gray-900 dark:text-white">
       <h1 className=' font-bold bg-white rounded-md  justify-start text-2xl  w-full h-50  p-3 mb-6'> Dashboard  </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.length > 0 ? cardConfig.map((card, index) => <Card key={index} icon={card.icon} title={card.title} value={card.value} />) : <p>No data available</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Ticket Status Overview</h3>
          {ticketStatusData?.labels ? (
            <Bar data={ticketStatusData} />
          ) : (
            <p>No Ticket Data</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4">Task Priority Overview</h3>
          {taskPriorityData?.labels ? (
            <Bar data={taskPriorityData} />
          ) : (
            <p>No Task Priority Data</p>
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default Dashboard;
