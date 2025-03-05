import React, {useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';


import { fetchTickets } from '../../redux/Slice/UserSlice';

import TaskCard from './Taskcard';
import Loading from "../../compoents/Loadingpage"
// import Notasksimage from '../../assets/NoTasks.png';


const UserTicketList = () => {
  //const  userId  = 2
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { tasks, loading, error } = useSelector((state) => state.tickets);
  
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    const role = sessionStorage.getItem('role');
    if (email && !isDataLoaded)  {
      dispatch(fetchTickets({userEmail: email, role: role}));
      setIsDataLoaded(true)
    }
  }, [user, dispatch,isDataLoaded]);

 

  if (loading) {
    return <div role="status"><Loading />Loading...</div>;
  }
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  if(tasks?.length === 0) {
    return  <div className='top-24 justify-center  flex flex-col items-center'>
    {/* { <img src={Notasksimage} alt="No Tasks" className="w-72 h-30 " />} */}
    {<p>No Tickets raised yet!</p>}
  </div>
  }


  return (
    <div className=''> 
     
      <div style={taskListStyles}>
      <h1 className=' font-bold bg-white rounded-md  justify-start text-2xl  w-full h-50  p-3 mb-6'> My Tickets  </h1>
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} showPriority={false} assignEngineer={true}/>
        
        ))}
      </div>
      
    </div>
  );
};

   
const taskListStyles = {
  display: 'flex',
  // flexWrap: 'wrap',
  justifyContent: 'center',
  //alignItems: 'center',
  gap: '20px',
  width: '80%',
  flexDirection: 'column',
  margin: '0 auto',
  
};

export default UserTicketList;
