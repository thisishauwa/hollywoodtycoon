
import React from 'react';
import XPLoader from './components/XPLoader';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center">
      <div className="mb-12 flex flex-col items-center">
        {/* Placeholder for the iconic Windows XP logo */}
        <div className="text-white text-4xl font-bold italic flex items-baseline mb-2">
          <span className="text-blue-500">M</span>
          <span className="text-red-500">i</span>
          <span className="text-yellow-500">c</span>
          <span className="text-green-500">r</span>
          <span className="text-white">osoft</span>
        </div>
        <div className="text-white text-5xl font-bold flex flex-col items-end">
          <div className="flex items-center">
            Windows<span className="text-orange-600 text-3xl align-top ml-1">xp</span>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-transparent mt-1"></div>
        </div>
      </div>

      <XPLoader />

      <div className="fixed bottom-12 text-gray-500 text-[10px] font-sans tracking-widest uppercase">
        Copyright © Microsoft Corporation
      </div>
    </div>
  );
};

export default App;
