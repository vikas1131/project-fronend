import React from 'react';

const SkeletonLoading = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse mb-8" />

      {/* Grid of Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg p-4 space-y-4"
          >
            {/* Card Image */}
            <div className="w-full h-48 bg-gray-200 rounded animate-pulse" />
            
            {/* Card Title */}
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
            
            {/* Card Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-center pt-4">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center items-center space-x-2 mt-8">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index}
            className="h-8 w-8 bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoading;