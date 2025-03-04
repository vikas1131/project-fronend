import React from "react";


const Card = ({
  icon,
  title,
  value,
  
}) => {


  // Larger icon sizes
  const iconSize = 32; // Increase icon size for better prominence

  return (
    <div
    
      className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300  border border-gray-100 dark:bg-gray-800 dark:border-gray-700"
    >
      {/* Icon and trend section */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-4 rounded-lg bg-opacity-20`}
        >
          {/* Display large icons */}
          <div className="flex justify-center">
          {React.cloneElement(icon, { size: iconSize })}
          </div>
        </div>

      </div>

      {/* Card content */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h3>
        <div className="flex items-end space-x-2">
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
      
        </div>
   
      </div>
    </div>
  );
};

export default Card;
