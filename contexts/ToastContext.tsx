import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSound } from './SoundContext';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 = permanent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { playNotificationSound } = useSound();

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };

    setToasts(prev => [...prev, newToast]);

    // Play Windows XP notification sound
    playNotificationSound();

    // Auto-dismiss if duration > 0
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [playNotificationSound]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
};

// XP-styled Toast Container
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastNotification key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastNotification: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };



  // Header gradient based on Luna theme (Blue usually, but we can vary slightly or keep uniform)
  // XP notifications usually use the same blue header (Luna), or Beige (Classic).
  // Let's use Luna Blue for the header as it looks better.
  const headerGradient = 'bg-gradient-to-r from-[#0058E6] via-[#2F9BFF] to-[#0058E6]';

  return (
    <div
      className={`
        w-80 shadow-[0px_0px_10px_rgba(0,0,0,0.5)] 
        rounded-t-lg overflow-hidden
        pointer-events-auto relative
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-12' : 'opacity-100 translate-x-0'}
      `}
      style={{ fontFamily: 'Tahoma, sans-serif' }}
    >
      {/* Main Border Wrapper - Luna Blue */}
      <div className="bg-white border-[3px] border-[#00138C] rounded-t-lg">
        
        {/* Title Bar */}
        <div className={`${headerGradient} px-2 py-1.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[12px] text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.3)] tracking-wide">
              {toast.title}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="hover:brightness-110 active:brightness-90 transition-all rounded-[3px]"
          >
             <img src="/images/close.svg" className="w-[21px] h-[21px]" alt="Close" />
          </button>
        </div>

        {/* Content Body */}
        <div className="bg-[#EFF3FF] p-3 flex gap-3 relative overflow-hidden">
           {/* Sidebar Graphic (faded accent) */}
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8CAFFF] to-transparent"></div>

           {/* Message Area */}
           <div className="flex-1 min-w-0">
             <p className="text-[11px] text-[#000000] leading-relaxed font-medium">
               {toast.message}
             </p>

             {/* Action Button */}
             {toast.action && (
               <button
                 onClick={() => {
                   toast.action!.onClick();
                   handleClose();
                 }}
                 className="mt-3 px-3 py-1 text-[11px] text-black bg-[#F0F0F0] border border-[#003C74] rounded-[3px] hover:bg-white hover:border-[#F29623] active:bg-[#E0E0E0] shadow-sm font-bold flex items-center gap-1 transition-all"
               >
                 {toast.action.label} <span className="text-[#003C74]">»</span>
               </button>
             )}
           </div>
        </div>

        {/* Progress bar (if timed) */}
        {(toast.duration || 0) > 0 && (
          <div className="h-1 bg-[#EFF3FF] border-t border-[#D6DFF7]">
            <div
              className="h-full bg-gradient-to-r from-[#2F9BFF] to-[#0058E6]"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};
