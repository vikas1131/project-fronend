import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClientUser from "../../utils/apiClientUser";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import {
  validateEmail, 
  validatePassword, 
  validatePincode, 
  validatePhoneNumber, validateSecurityAnswer} from "../../utils/validation"
function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    password: "",
    securityQuestion: "",
    securityAnswer: "",
    role: "",
    specialization: "",
    availability: [],
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validators = {
    email: validateEmail,
    password: validatePassword,
    pincode: validatePincode,
    phone: validatePhoneNumber,
    securityAnswer: validateSecurityAnswer,
  };

  const errorMessages = {
    email: "Invalid email format.",
    password:
      "Password must be 8-15 characters, include uppercase, number & special character.",
    pincode: "Invalid pincode format.",
    phone: "Invalid phone number format.",
    securityAnswer: "Invalid security answer.",
  };

  //  Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if(validators[name]){
      setErrors((prev) => ({
        ...prev,
        [name]: validators[name](value)? "" : errorMessages[name],
      }))
    }
  };

  // Handle availability checkbox change
  const handleAvailabilityChange = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter((d) => d !== day)
        : [...prev.availability, day],
    }));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();


    if (Object.values(errors).some((error) =>error)) {
      //setErrors(newErrors);
      toast.error("Please correct the errors and try again.");
      return;
    }

    try {
      const response = await apiClientUser.post("/users/newUser", {
        // name: formData.name,
        // email: formData.email,
        // phone: formData.phone,
        // address: formData.address,
        // pincode: formData.pincode,
        // password: formData.password,
        // securityQuestion: formData.securityQuestion,
        // securityAnswer: formData.securityAnswer,
        // role: formData.role,
        ...formData,
        specialization:
          formData.role === "engineer" ? formData.specialization : null,
        availability: formData.role === "engineer" ? formData.availability : [],
      });

      //alert("Registration successful! Please log in.");
      toast.success("Registration successful! Please log in.");
      
      setTimeout(() => navigate("/login"), 5000); // Small delay to show toast
    
      //navigate("/login");
    } catch (error) {
      console.error(
        "Signup Error:",
        error.response?.data?.message || error.message
      );
    //   alert(
    //     error.response?.data?.message || "Signup failed. Please try again."
    //   );
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    //use react Fragment to wrap the all the div's or <>
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-3xl font-semibold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Side Fields */}
            <div>
              {["name", "email", "phone", "address", "pincode"].map((field) => (
                <div className="mb-4" key={field}>
                  <label className="block text-lg font-medium mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    placeholder={`Enter ${field}`}
                    //className="w-full px-4 py-2 border rounded-md"
                    className={`w-full px-4 py-2 border rounded-md ${errors[field] ? "border-2 border-red-500" : "border border-gray-300"}`}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                  {errors[field] && (
                    <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Fields */}
            <div>
              {["password", "securityQuestion", "securityAnswer"].map(
                (field) => (
                  <div className="mb-4" key={field}>
                    <label className="block text-lg font-medium mb-2">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      placeholder={`Enter ${field}`}
                      //className="w-full px-4 py-2 border rounded-md"
                      className={`w-full px-4 py-2 border rounded-md ${errors[field] ? "border-2 border-red-500" : "border border-gray-300"}`}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      required
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[field]}
                      </p>
                    )}
                  </div>
                )
              )}

              <div className="mb-4">
                <label htmlFor="role" className="block text-lg font-medium mb-2">Role</label>
                <select
                  id="role"
                  className="w-full px-4 py-2 border rounded-md"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="engineer">Engineer</option>
                  <option value="user">User</option>
                </select>
              </div>
              {/*git commit*/}

              {/* Engineer Fields */}
              {formData.role === "engineer" && (
                <React.Fragment>
                  <div className="mb-4">
                    <label htmlFor="specialization" className="block text-lg font-medium mb-2">
                      Specialization
                    </label>
                    <select
                      id="specialization"
                      className="w-full px-4 py-2 border rounded-md"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Specialization
                      </option>
                      <option value="Installation">Installation</option>
                      <option value="Fault">Fault</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">
                      Availability
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={formData.availability.includes(day)}
                            onChange={() => handleAvailabilityChange(day)}
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>

                  {errors.engineerFields && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.engineerFields}
                    </p>
                  )}
                </React.Fragment>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
          >
            Register
          </button>
        </form>
      </div>
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
    </div>
  );
}

export default Signup;

