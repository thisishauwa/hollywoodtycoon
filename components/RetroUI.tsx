import React, { useState, useEffect, useRef } from "react";
import { useSound } from "../contexts/SoundContext";

export const RetroPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`bevel-outset p-2 bg-[#ece9d8] ${className}`}
    style={{ fontFamily: "Tahoma, sans-serif" }}
  >
    {children}
  </div>
);

export const RetroInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = ({ className = "", ...props }) => (
  <input
    className={`bg-white bevel-inset px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400 ${className}`}
    style={{ fontFamily: "Tahoma, sans-serif" }}
    {...props}
  />
);

import { motion } from "framer-motion";

export const WindowFrame: React.FC<{
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  isActive?: boolean;
  zIndex?: number;
  onFocus?: () => void;
  initialPos?: { x: number; y: number };
  showMaximize?: boolean;
}> = ({
  title,
  children,
  onClose,
  onMinimize,
  className = "",
  isActive = true,
  zIndex = 10,
  onFocus,
  initialPos = { x: 50, y: 50 },
  showMaximize = true,
}) => {
  const [pos, setPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({
    pos: initialPos,
    className,
  });
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    onFocus?.();
    if ((e.target as HTMLElement).closest(".title-bar-actions")) return;
    if (isMaximized) return; // Don't allow dragging when maximized
    setIsDragging(true);
    dragStartOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreMaximizeState({ pos, className });
      setIsMaximized(true);
    } else {
      setPos(preMaximizeState.pos);
      setIsMaximized(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPos({
          x: e.clientX - dragStartOffset.current.x,
          y: e.clientY - dragStartOffset.current.y,
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15 }}
      style={
        isMaximized
          ? {
              position: "absolute",
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              zIndex,
            }
          : { position: "absolute", left: pos.x, top: pos.y, zIndex }
      }
      className={`flex flex-col bg-[#ece9d8] bevel-outset rounded-t-lg overflow-hidden xp-window-shadow pointer-events-auto ${
        isMaximized ? "w-full h-full !rounded-none" : className
      }`}
      onMouseDown={onFocus}
    >
      {/* XP Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-between px-2 h-[28px] shrink-0 select-none cursor-default
          ${
            isActive
              ? "xp-title-gradient"
              : "bg-gradient-to-r from-[#7697d7] to-[#9db4e6]"
          }
        `}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <img
            src="/images/Windows Flag.svg"
            alt=""
            className="w-4 h-4 flex-shrink-0"
          />
          <span
            className="text-white font-bold text-[12px] shadow-black drop-shadow-sm truncate"
            style={{ fontFamily: "Tahoma, sans-serif" }}
          >
            {title}
          </span>
        </div>
        <div className="flex gap-[2px] ml-2 title-bar-actions">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize?.();
            }}
            className="hover:brightness-110 active:brightness-90 transition-all"
            title="Minimize"
          >
            <img
              src="/images/minimise.svg"
              alt="Minimize"
              className="w-[21px] h-[21px]"
            />
          </button>
          {showMaximize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMaximize();
              }}
              className="hover:brightness-110 active:brightness-90 transition-all"
              title={isMaximized ? "Restore Down" : "Maximize"}
            >
              <img
                src={
                  isMaximized
                    ? "/images/makesmaller.svg"
                    : "/images/maximise.svg"
                }
                alt={isMaximized ? "Restore" : "Maximize"}
                className="w-[21px] h-[21px]"
              />
            </button>
          )}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="hover:brightness-110 active:brightness-90 transition-all"
              title="Close"
            >
              <img
                src="/images/close.svg"
                alt="Close"
                className="w-[21px] h-[21px]"
              />
            </button>
          )}
        </div>
      </div>

      {/* Content Area - Fixed overflow to allow internal tabs to stay fixed */}
      <div className="flex-1 p-1 bg-[#ece9d8] overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 bevel-inset bg-[#ece9d8] overflow-hidden relative min-h-0">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export const RetroButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "default";
    isLoading?: boolean;
  }
> = ({
  children,
  variant = "default",
  className = "",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "px-3 py-1 text-[11px] active:border-[#808080] active:border-b-white active:border-r-white active:bg-[#e0e0e0] transition-all flex items-center justify-center gap-2 shadow-sm font-bold";
  const variants = {
    default:
      "bg-[#ece9d8] border-2 border-white border-b-[#808080] border-r-[#808080] text-black hover:bg-[#f5f5f5]",
    primary:
      "bg-[#e1e1e1] border-2 border-white border-b-[#808080] border-r-[#808080] text-black hover:bg-[#efefef]",
  };

  const isDisabled = disabled || isLoading;
  const cursorClass = isLoading ? "cursor-wait" : "cursor-pointer";
  const disabledClass = isDisabled ? "opacity-50 pointer-events-none" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${cursorClass} ${disabledClass} ${className}`}
      style={{ fontFamily: "Tahoma, sans-serif" }}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const RetroProgressBar: React.FC<{
  progress: number;
  label?: string;
  showPercentage?: boolean;
}> = ({ progress, label, showPercentage = true }) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate how many "chunks" to show (approx 10px per chunk)
  // We'll use a repeating gradient mask to simulate chunks
  
  return (
    <div className="flex flex-col w-full font-tahoma text-[11px]">
      {label && <div className="mb-1 text-gray-700">{label}</div>}
      <div className="relative w-full h-4 bg-white border border-[#808080] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] p-[1px] overflow-hidden">
        <div 
          className="h-full relative"
          style={{ width: `${clampedProgress}%`, transition: 'width 0.3s ease-out' }}
        >
          {/* XP Green Glossy Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#dbf5ce] via-[#65cd1b] to-[#3a9e04]"></div>
          
          {/* White separators for the "chunk" look */}
          <div 
            className="absolute inset-0 w-full h-full" 
            style={{ 
              backgroundImage: 'linear-gradient(90deg, transparent 0px, transparent 6px, white 6px, white 8px)',
              backgroundSize: '8px 100%' 
            }}
          ></div>
          
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/60 to-transparent"></div>
        </div>
        
        {/* Centered Percentage Label (optional, overrides chunks visually if needed) */}
        {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black drop-shadow-md">
                {Math.round(clampedProgress)}%
            </div>
        )}
      </div>
    </div>
  );
};

export const RetroTab: React.FC<{
  isActive: boolean;
  onClick: () => void;
  label: string;
}> = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-1.5 text-[11px] border-t border-x rounded-t-md mr-1 mb-[-1px] relative z-10 transition-all
      ${
        isActive
          ? "bg-white border-[#808080] border-b-white font-bold"
          : "bg-[#d8d4bf] border-[#808080] text-gray-700 hover:bg-[#e4e0c8]"
      }
    `}
    style={{ fontFamily: "Tahoma, sans-serif" }}
  >
    {label}
  </button>
);

export const StatusBar: React.FC<{
  items: string[];
  activeWindows: {
    id: string;
    title: string;
    icon?: string;
    isMinimized: boolean;
    isActive: boolean;
  }[];
  onToggleWindow: (id: string) => void;
  onStartClick?: () => void;
}> = ({ items, activeWindows, onToggleWindow, onStartClick }) => {
  const { isMuted, toggleMute } = useSound();
  
  return (
  <div
    className="h-8 xp-taskbar-gradient flex items-center gap-0 z-[1000] w-full border-t border-[#1941a5] select-none shrink-0"
    style={{ fontFamily: "Tahoma, sans-serif" }}
  >
    {/* Start Button */}
    <button
      onClick={onStartClick}
      className="xp-start-button h-full px-4 flex items-center gap-2 group hover:brightness-110 active:brightness-90 transition-all shrink-0"
    >
      <img src="/images/Windows Flag.svg" alt="Start" className="w-5 h-5" />
      <span className="text-white font-black italic text-sm tracking-tighter drop-shadow-md">
        start
      </span>
    </button>

    {/* Task Buttons Area */}
    <div className="flex-1 flex items-center px-2 gap-1 overflow-hidden h-full">
      {activeWindows.map((win) => (
        <button
          key={win.id}
          onClick={() => onToggleWindow(win.id)}
          className={`
                    flex items-center gap-2 h-[26px] px-3 rounded-sm min-w-[120px] max-w-[160px] border shadow-inner transition-all
                    ${
                      win.isActive && !win.isMinimized
                        ? "bg-[#3873d3] border-t-[#225ad9] border-l-[#225ad9] border-b-[#4e8df5] border-r-[#4e8df5]"
                        : "bg-[#1941a5] border-[#1941a5] opacity-80"
                    }
                  `}
        >
          <img
            src={win.icon || "/images/Windows Flag.svg"}
            alt=""
            className="w-3 h-3"
          />
          <span className="text-[10px] text-white truncate font-bold">
            {win.title}
          </span>
        </button>
      ))}
    </div>

    {/* System Tray */}
    <div className="h-full bg-[#0996f1] border-l border-[#0873ba] shadow-[inset_2px_0_5px_rgba(0,0,0,0.2)] flex items-center px-3 gap-3 shrink-0">
      {/* Sound Toggle Button */}
      <button
        onClick={toggleMute}
        className="text-white text-sm hover:brightness-110 active:brightness-90 transition-all"
        title={isMuted ? "Unmute sounds" : "Mute sounds"}
      >
        <img 
          src={isMuted ? "/images/audio_off.png" : "/images/audio_on.png"} 
          alt={isMuted ? "Muted" : "Sound On"}
          className="w-4 h-4"
        />
      </button>
      
      {items.map((item, i) => (
        <div
          key={i}
          className="text-white text-[10px] font-bold whitespace-nowrap opacity-90"
        >
          {item}
        </div>
      ))}
      <div className="text-white text-[10px] font-bold flex flex-col items-end leading-none">
        <span>
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  </div>
  );
};

export const DesktopIcon: React.FC<{
  icon: string;
  label: string;
  onClick?: () => void;
  isImage?: boolean;
}> = ({ icon, label, onClick, isImage = false }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 w-20 p-2 hover:bg-white/10 rounded group transition-all pointer-events-auto"
  >
    {isImage ? (
      <img
        src={icon}
        alt={label}
        className="w-12 h-12 filter drop-shadow-lg group-active:scale-95 transition-transform"
      />
    ) : (
      <div className="text-3xl filter drop-shadow-lg group-active:scale-95 transition-transform">
        {icon}
      </div>
    )}
    <span
      className="text-[10px] text-white font-medium text-center desktop-icon-text leading-tight"
      style={{ fontFamily: "Tahoma, sans-serif" }}
    >
      {label}
    </span>
  </button>
);

export const ExplorerToolbar: React.FC<{
  onBack?: () => void;
  onForward?: () => void;
  onUp?: () => void;
  canBack?: boolean;
  canForward?: boolean;
}> = ({ onBack, onForward, onUp, canBack = true, canForward = false }) => {
  return (
    <div className="h-[38px] bg-[#efeecf] border-b border-[#d4d0c8] flex items-center px-1 gap-1 select-none shadow-[inset_0_-1px_0_rgba(255,255,255,0.5)]">
       {/* Back Button Group */}
       <div className="flex items-center gap-0 mr-1 relative group cursor-pointer" onClick={onBack}>
           <button
             disabled={!canBack}
             className={`flex flex-col items-center justify-center rounded-full hover:brightness-110 active:brightness-95 transition-all
               ${!canBack ? 'opacity-50 grayscale cursor-default' : 'cursor-pointer'}
             `}
             title="Back"
           >
              <img src="/images/assetsfortopnav/backCircular.png" className="w-[32px] h-[32px] object-contain" alt="Back" />
              <span className="text-[9px] text-[#444] -mt-1.5 font-tahoma">Back</span>
           </button>
           <div className="ml-0 opacity-70">
               <img src="/images/assetsfortopnav/blackArrowbesidetheBackButton.png" className="h-[24px] w-auto object-contain" alt="" />
           </div>
       </div>

       {/* Forward Button */}
       <button
         onClick={onForward}
         disabled={!canForward}
         className={`hover:brightness-110 active:brightness-95 transition-all ml-1
            ${!canForward ? 'opacity-50 grayscale cursor-default' : 'cursor-pointer'}
         `}
         title="Forward"
       >
          <img src="/images/assetsfortopnav/forwardCircular.png" className="w-[24px] h-[24px] object-contain" alt="Forward" />
       </button>

       {/* Separator */}
       <div className="w-[1px] h-[24px] bg-gray-300 mx-2 shadow-[1px_0_0_white]"></div>

       {/* Folder/Up Button */}
       <button
         onClick={onUp}
         className="flex items-center justify-center w-8 h-8 hover:bg-white/40 border border-transparent hover:border-gray-300 rounded-[2px]"
         title="Up"
       >
          <img src="/images/assetsfortopnav/Folder Open.png" className="w-[20px] h-[20px] object-contain" alt="Up" />
       </button>
       
       <button
         className="flex items-center justify-center w-8 h-8 hover:bg-white/40 border border-transparent hover:border-gray-300 rounded-[2px]"
         title="Search"
       >
          <img src="/images/High-Res_XP_Icons/Search.ico" className="w-[20px] h-[20px] object-contain" alt="Search" />
       </button>
       
       <button
         className="flex items-center justify-center w-8 h-8 hover:bg-white/40 border border-transparent hover:border-gray-300 rounded-[2px]"
         title="Folders"
       >
          <img src="/images/High-Res_XP_Icons/Folder Closed.ico" className="w-[20px] h-[20px] object-contain" alt="Folders" />
       </button>

       {/* Separator */}
       <div className="w-[1px] h-[24px] bg-gray-300 mx-2 shadow-[1px_0_0_white]"></div>
       
         <button
         className="flex items-center justify-center w-8 h-8 hover:bg-white/40 border border-transparent hover:border-gray-300 rounded-[2px]"
         title="Views"
       >
          <img src="/images/High-Res_XP_Icons/Display.ico" className="w-[20px] h-[20px] object-contain" alt="Views" />
       </button>

    </div>
  );
};
