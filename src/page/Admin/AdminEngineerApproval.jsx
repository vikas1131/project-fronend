import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEngineers, fetchAllApprovedEngineers, approveEngineer } from "../../redux/Slice/AdminSlice";
import Loading from "../../compoents/Loadingpage";

const AdminEngineerApproval = () => {
  const dispatch = useDispatch();
  const { engineers = [], loading, error } = useSelector((state) => state.admin);

 

  useEffect(() => {
    dispatch(fetchAllEngineers()); // Fetch engineers who need approval
  }, [dispatch]);

  const handleApproval = (engineerEmail, approve) => {
    dispatch(approveEngineer({ engineerEmail, approve })).then(() => {
        setTimeout(() => {
            dispatch(fetchAllApprovedEngineers()); // Refresh approved engineers list
            dispatch(fetchAllEngineers()); // Refresh pending engineers list
        }, 500);
    });
  };

  if (loading) return <div className="text-center text-gray-500"><Loading /></div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!Array.isArray(engineers) || engineers.length === 0) return <p className="text-center text-gray-500">No engineers available.</p>;

  return (
    <div className="ml-12">
    <h1 className="font-bold bg-white rounded-md text-2xl w-full p-3 mb-6">New Engineers</h1>
    <div className="p-4 mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {/* <AdminNavbar /> */}

      {engineers.map((engineer) => (
        <div
          key={engineer._id}
          className="bg-white p-6 shadow-md rounded-lg border border-gray-300 hover:shadow-lg transition-all duration-300"
        >
          <h2 className="text-xl font-semibold">{engineer?.name}</h2><hr /><br />
          <p className="text-gray-600">Email: {engineer.email}</p>
          <p className="text-gray-600">Phone: {engineer.phone}</p>
          <p className="text-gray-600">Specialization: {engineer.specialization}</p>
          <p className="text-gray-500">Address: {engineer.address}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-20 mt-4">
            <button
              onClick={() => handleApproval(engineer.email, true)}
              disabled={engineer.isEngineer}
              className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300
                ${engineer.isEngineer 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                }`}
            >
              Approve
            </button>
            <button
              onClick={() => handleApproval(engineer.email, false)}
              disabled={!engineer.isEngineer}
              className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-md transition duration-300
                ${!engineer.isEngineer
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg"
                }`}
            >
              Disapprove
            </button>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default AdminEngineerApproval;