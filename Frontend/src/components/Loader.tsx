import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative bg-gray-900 border h-full border-gray-700 text-green-500 font-mono text-base py-6 px-4 w-full rounded-md shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 rounded-t-md px-2">
          <div className="float-left text-gray-300 font-mono">Status</div>
          <div className="float-right flex space-x-2 pt-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="inline-block whitespace-nowrap overflow-hidden border-r-2 border-green-500 animate-[typeAndDelete_4s_steps(11)_infinite,blinkCursor_0.5s_step-end_infinite_alternate] mt-6">
          Running...
        </div>
      </div>
    </div>
  );
}

export default Loader;
