import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = ({ className }) => {
  return (
    <footer className={`bg-white border-t mb-0 border-gray-300 py-6 mt-auto ${className}`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center mt-10">
        <div className="text-gray-700 text-center md:text-left">
          <h2 className="text-xl font-bold text-blue-600">SwiftLink Telecom Services</h2>
          <p className="mt-2">Connecting you to the world with reliable telecom solutions.</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
            <FaTwitter size={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
            <FaLinkedin size={24} />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-500 transition-colors">
            <FaGithub size={24} />
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-4 text-center text-gray-500">
        <p>&copy; 2025 SwiftLink Telecom Services. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
