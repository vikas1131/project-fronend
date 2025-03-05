import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUpdateProfile, fetchProfile } from "../../redux/Slice/UserSlice";
import { validateEmail,validatePhoneNumber } from "../../utils/validation";

const UserProfile = () => {
  const userEmail = sessionStorage.getItem("email");
  const role = sessionStorage.getItem("role"); // Replace with the actual user role/ID if needed
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.tickets);
  console.log("user profile: ", profile)

  // Fetch the profile if not already loaded
  useEffect(() => {
    if (!profile.email) {
      dispatch(fetchProfile({ userEmail, role }));
    }
  }, [dispatch, profile.email, userEmail, role]);

  // Local state for update form; update it when profile is fetched
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({ email: "", phone: "" }); // **Added state for errors**
  useEffect(() => {
    if (profile.email) {
      setUser({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const [activeTab, setActiveTab] = useState("personal");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);

    const emailError = validateEmail(user.email) ? "" : "Invalid email format"; // **Validate email**
    const phoneError = validatePhoneNumber(user.phone) ? "" : "Invalid phone number"; // **Validate phone**

    setErrors({ email: emailError, phone: phoneError });

    if (emailError || phoneError) return; // **Prevent submission if errors exist**

    try {
      // Dispatch updated profile with an object containing userEmail, role, and updatedata (user)
      await dispatch(fetchUpdateProfile({ userEmail, role, updatedata: user }));
      setSuccess(true);
    } catch (error) {
      console.error("Profile update failed:", error.message);
    }

    setTimeout(() => setSuccess(false), 3000); // Reset success state after 3 seconds
  };

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "update", label: "Update Profile" },
  ];

  return (
  <div>
    <div className="min-h-screen   from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-6">Your Profile</h1>
          <div className="relative inline-block group">
          
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-2 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-500 text-white shadow-md "
                      : "bg-white text-blue-500 hover:bg-blue-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "personal" && (
              <div className="grid md:grid-cols-2 gap-6">
                <ProfileField
                  label="Full Name"
                  value={user.name}
                  icon={<User className="w-5 h-5" />}
                />
                  <ProfileField
                  label="Email"
                  value={user.email}
                  icon={<Mail className="w-5 h-5" />}
                />
                <ProfileField
                  label="Phone"
                  value={user.phone}
                  icon={<Phone className="w-5 h-5" />}
                />
                <ProfileField
                  label="Address"
                  value={user.address}
                  icon={<MapPin className="w-5 h-5" />}
                />
              </div>
            )}

            {activeTab === "update" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 ">
                  <InputField
                    label="Full Name"
                    value={user.name}
                    disabled
                    icon={<User className="w-5 h-5" />}
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                    icon={<Mail className="w-5 h-5" />}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>} {/* **Show email error** */}
                  <InputField
                    label="Phone"
                    type="tel"
                    value={user.phone}
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                    icon={<Phone className="w-5 h-5" />}
                  />
                   {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>} {/* **Show phone error** */}
                  <InputField
                    label="Address"
                    value={user.address}
                    onChange={(e) =>
                      setUser({ ...user, address: e.target.value })
                    }
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>
                <SubmitButton success={success} />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

const ProfileField = ({ label, value, icon }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <div className="w-full px-4 py-3 rounded-lg border bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
      {value}
    </div>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      className="w-full px-4 py-3 rounded-lg border bg-white/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      {...props}
    />
  </div>
);

const SubmitButton = ({ success }) => (
  <div className="relative">
    <button
      type="submit"
      className={`w-40 py-2 rounded-lg font-medium text-white transition-all duration-300 ${
        success ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {success && <CheckCircle className="w-5 h-5" />}
        {success ? "Profile Updated!" : "Save Changes"}
      </span>
    </button>

    
  </div>
);

export default UserProfile;
