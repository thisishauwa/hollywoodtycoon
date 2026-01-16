import React, { useState, useEffect } from 'react';
import { useGlobalClock } from '../hooks/useGlobalClock';

export const MonthTimeline: React.FC = () => {
  const { clock, timeUntilAdvance } = useGlobalClock();
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      if (!timeUntilAdvance) {
        setTimeRemaining('--:--');
        setProgress(0);
        return;
      }

      // Calculate time remaining
      const totalSeconds = Math.floor(timeUntilAdvance.hoursRemaining * 3600);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      
      // Calculate progress (assuming 4 minutes = 240 seconds per month)
      const monthDurationSeconds = 4 * 60; // 4 minutes
      const elapsed = monthDurationSeconds - totalSeconds;
      const progressPercent = Math.max(0, Math.min(100, (elapsed / monthDurationSeconds) * 100));
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timeUntilAdvance]);

  if (!clock) return null;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-[#ece9d8] border border-[#808080] shadow-sm">
      <div className="flex items-center gap-1">
        <img src="/images/High-Res_XP_Icons/Calendar.ico" className="w-4 h-4" alt="" />
        <span className="text-[10px] font-bold">
          {monthNames[clock.month - 1]} {clock.year}
        </span>
      </div>
      
      <div className="flex-1 h-4 bg-white border border-[#808080] relative min-w-[120px]">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-bold text-black drop-shadow-[0_1px_0_white]">
            {timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
};
