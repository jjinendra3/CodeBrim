import React from "react";

const ScreenLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex space-x-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`relative w-10 h-10 rounded-full border-2 border-gray-300 animate-bounce delay-${index * 200}`}
          >
            <div className="absolute inset-0 bg-gray-300 rounded-full animate-ping" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenLoader;
