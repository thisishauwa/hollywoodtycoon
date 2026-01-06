import React, { useState, useEffect, useRef } from "react";

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
    <div
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
    </div>
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
}> = ({ progress, label }) => (
  <div className="relative w-full h-4 bg-white border border-[#808080] shadow-inner overflow-hidden p-[1px]">
    <div
      className="h-full bg-gradient-to-b from-[#38d438] via-[#28a428] to-[#1e7c1e] transition-all duration-500"
      style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
    />
    {label && (
      <span
        className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black"
        style={{ textShadow: "1px 1px 0 white", fontFamily: "Tahoma" }}
      >
        {label}
      </span>
    )}
  </div>
);

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
}> = ({ items, activeWindows, onToggleWindow, onStartClick }) => (
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
