import React from 'react';
import { useGlobalClock } from '../hooks/useGlobalClock';

export const MonthTimeline: React.FC = () => {
  const { clock } = useGlobalClock();

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Show month immediately, even if clock is loading
  const monthName = clock ? monthNames[clock.month - 1] : monthNames[new Date().getMonth()];

  return (
    <span className="text-white text-[10px] font-bold drop-shadow-md">
      {monthName}
    </span>
  );
};
