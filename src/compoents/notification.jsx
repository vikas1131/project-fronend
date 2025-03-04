import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markAsRead } from "../redux/Slice/notificationSlice";

const Notifications = () => {
  const userId = sessionStorage.getItem("email");
  console.log("userId: " + userId);
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [dispatch, userId]);

  return (
    <div className="absolute left-1/4 top-16 -translate-x-1/2 bg-white shadow-lg 
    rounded-lg p-4 w-72 md:w-80 z-50 border border-gray-200" >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Notifications</h3>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No new notifications</p>
      ) : (
         <ul className="space-y-2 max-h-64 overflow-y-auto">
          {notifications.map((notif) => (
            <li key={notif._id} className="flex justify-between items-center p-3 border rounded bg-gray-100 hover:bg-gray-200 transition">
              <p className="text-gray-800 text-sm">{notif.message}</p>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded shadow"
                onClick={() => dispatch(markAsRead(notif._id))}
              >
                Mark as Read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
