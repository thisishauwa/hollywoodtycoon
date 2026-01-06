
import React from 'react';

interface XPWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  width?: string;
  height?: string;
  className?: string;
}

const XPWindow: React.FC<XPWindowProps> = ({ 
  title, 
  children, 
  onClose, 
  onMinimize, 
  width = "w-[500px]", 
  height = "h-auto",
  className = ""
}) => {
  return (
    <div className={`${width} ${height} bg-[#ece9d8] border-2 border-[#0058e3] rounded-t-lg shadow-xl overflow-hidden flex flex-col ${className}`}>
      {/* Title Bar */}
      <div className="h-8 bg-gradient-to-r from-[#0058e3] via-[#28a0f4] to-[#0058e3] flex items-center justify-between px-2 cursor-default select-none">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
          <span className="text-white font-bold text-sm drop-shadow-md">{title}</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onMinimize}
            className="w-5 h-5 bg-[#0058e3] border border-white/50 rounded-sm flex items-center justify-center hover:brightness-125 active:brightness-75"
          >
            <div className="w-2 h-[2px] bg-white mt-2"></div>
          </button>
          <button 
            className="w-5 h-5 bg-[#0058e3] border border-white/50 rounded-sm flex items-center justify-center cursor-not-allowed opacity-50"
          >
             <div className="w-2 h-2 border-2 border-white"></div>
          </button>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-[#e33d1b] border border-white/50 rounded-sm flex items-center justify-center hover:brightness-125 active:brightness-75"
          >
            <span className="text-white text-xs font-bold -mt-1">×</span>
          </button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-1">
        <div className="w-full h-full bg-[#ece9d8] border border-gray-400 p-3 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default XPWindow;
