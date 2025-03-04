import  Notification from "./../../compoents/notification"
import { Bell, Search, Sun, Moon, Menu, LogOut, User } from "lucide-react";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch} from 'react-redux';
import { useState, useEffect  } from 'react';
import { fetchNotifications} from "./../../redux/Slice/notificationSlice"



const EngineerNavbar = ({toggleSidebar}) => {
  const UserName = sessionStorage.getItem("email")
  const ProfileName = UserName?.split("@")[0]
  console.log("ProfileNamesdsd: " + ProfileName)

  const dispatch = useDispatch();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [isClick, SetClicked] = useState('');
  
  
  useEffect(() => {
    console.log(" isProfileOpen")
    dispatch(fetchNotifications());
    
      const interval = setInterval(() => {
        dispatch(fetchNotifications(UserName))
      }, 5000);
      return () => clearInterval(interval);
    
  }, [dispatch]);

  const { notifications } = useSelector((state) => state.notifications);
  const notificationsCount = notifications?.filter(notification => notification.isRead === false).length;

  return (
    <nav className="h-16 bg-white mb-10 rounded-md   dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center  fixed top-0 left-0 w-full z-50  justify-between lg:justify-between xl:justify-between  ">
      {/* Left side - Mobile menu */}
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 
              bg-clip-text text-transparent hidden sm:block md:block">
              Telecom Services
        </h1>
        <button className="md:hidden  text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"  onClick={toggleSidebar}>
       
       <Menu size={24}  />
     </button>
   

      {/* Middle - Search Bar */}


        {/* Profile Section */}
        <div className="relative">
      {/* Right side - Notifications, Theme Toggle, Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
      


        <button
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          onClick={() => {SetClicked(!isClick)}  
          } >

          <Bell size={24}/>
          {notificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
              {notificationsCount}
            </span>
          )}
             { isClick && <Notification/>}
             
        </button>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            { ProfileName}
            </span>
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-28 w-48 py-2 ml-8 bg-white rounded-md shadow-lg dark:bg-gray-700">
            
              <button
                onClick={() => console.log('Logout clicked')}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>
                <Link to="/logout">Logout </Link></span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default EngineerNavbar;