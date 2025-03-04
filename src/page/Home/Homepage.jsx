import React, { useState } from 'react';
import { ChevronRight, CheckCircle, MapPin, Shield, Server, Wifi, Users, Clipboard, AlertTriangle, Mail, Smartphone, Calendar, Clock } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {  Menu, LogOut ,User ,Bell} from "lucide-react";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      title: "Fault Ticket Management",
      description: "Instant ticket creation and tracking for network faults",
      icon: Clipboard
    },
    {
      title: "Engineer Allocation",
      description: "Smart assignment based on location and availability",
      icon: Users
    },
    {
      title: "Hazard Compliance",
      description: "Real-time risk assessment and safety protocols",
      icon: Shield
    },
    {
      title: "Multi-Device Access",
      description: "Full functionality across mobile, tablet and desktop",
      icon: Smartphone
    }
  ];

  const token = sessionStorage.getItem("token");
  const email = sessionStorage.getItem("email");
  const role = sessionStorage.getItem("role");

  const handleRaiseTicket = () => {
    if (!token) {
      // Redirect to login if user is not authenticated
      navigate("/login");
    } else if (role === "user") {
      // If logged in and role is "user", go to raise ticket page
      navigate("/User/RaiseTicket");
    } else {
      // If logged in but role is not "user" (admin or engineer)
      toast.error("Only Uses can Raise Tickets");
      //alert("Only users can raise tickets.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Revised Navbar */}
      <nav className="sticky top-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wifi className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TelecomFieldOps</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
            <a href="#safety" className="text-gray-600 hover:text-blue-600">Safety</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600">Contact</a>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            <Link to="/login">Login</Link> 
            </button>
          </div>

          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
             <Menu size={24}  />
            {/* Hamburger icon */}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white py-4 px-4 shadow-lg">
            <a href="#features" className="block py-2">Features</a>
            <a href="#safety" className="block py-2">Safety</a>
            <a href="#contact" className="block py-2">Contact</a>
            <button  className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4">
             <Link to="/login">Login</Link> 
            </button>
          </div>
        )}
      </nav>

      {/* Updated Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-gray-100 pt-28 pb-36">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              <span className="block mb-4">Telecom Infrastructure</span>
              <span className="text-blue-600">Field Operations Platform</span>
            </h1>
            
            <div className="h-2"></div> {/* Added gap */}
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline fault resolution and maintenance tasks across Bangalore's telecom networks
            </p>

            <div className="flex gap-4 justify-center pt-8">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              onClick={handleRaiseTicket}>
                <Mail className="w-5 h-5" />
                Raise Ticket
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20" id="features">
        <h2 className="text-3xl font-bold text-center mb-16">Core Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <feature.icon className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Operational Workflow</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Ticket Creation</h3>
              <p className="text-gray-600">Users report faults via web or mobile interface</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Allocation</h3>
              <p className="text-gray-600">System assigns tasks based on location and priority</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Resolution Tracking</h3>
              <p className="text-gray-600">Real-time updates from field engineers</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-gray-900 text-gray-300 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Wifi className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">TelecomFieldOps</span>
              </div>
              <p className="text-sm">Bangalore-based telecom operations management since 2023</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">Fault Management</a></li>
                <li><a href="#" className="hover:text-blue-400">Safety Compliance</a></li>
                <li><a href="#" className="hover:text-blue-400">Workforce Tracking</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© 2024 TelecomFieldOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    
    </div>
  );
};

export default LandingPage;