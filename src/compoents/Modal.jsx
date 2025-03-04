// src/components/Modal.jsx

import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-500 text-2xl font-bold"
        >
          &times;
        </button>

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
