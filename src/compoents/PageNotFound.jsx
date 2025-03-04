import React, { useState, useEffect } from "react";
// import { HomeIcon, ArrowLeft, RefreshCcw, Search } from "lucide-react";
import pagenot404 from "./../assets/PageNot404.jpg";

const PageNotFound = () => {
  const [countdown, setCountdown] = useState(10);

  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        {/* Animated 404 Header */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-gray-200 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-medium text-gray-800">
              Oops! Page Not Found
            </span>
          </div>
        </div>

        {/* Astronaut Illustration */}
        <div className="relative h-48">
          <img
            src={pagenot404}
            alt="Lost in Space"
            className={`mx-auto h-full object-contain ${
              isAnimating ? "animate-bounce" : ""
            }`}
          />
        </div>



      </div>
    </div>
  );
};

export default PageNotFound;
