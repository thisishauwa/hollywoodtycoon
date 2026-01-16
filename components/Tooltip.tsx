import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
      }

      setTooltipStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 10000,
      });
    }
  }, [isVisible, position]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="inline-block"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="pointer-events-none"
        >
          <div className="bg-[#ffffe1] border border-black text-black text-[10px] px-2 py-1 shadow-lg max-w-[200px] font-tahoma">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for common game term tooltips
interface GameTermTooltipProps {
  term: 'reputation' | 'chemistry' | 'quality' | 'tier' | 'marketing' | 'production';
  children: React.ReactNode;
}

const tooltipTexts = {
  reputation: "Industry standing. Higher reputation unlocks better actors and reduces costs.",
  chemistry: "How well the cast works together. Improves film quality and audience reviews.",
  quality: "Production value of the film. Affects critical reception and box office performance.",
  tier: "Your studio level based on reputation. Higher tiers unlock A-list talent.",
  marketing: "Advertising budget. Directly boosts opening weekend box office revenue.",
  production: "Quality budget for filming. Higher budgets improve base quality and reduce flop risk."
};

export const GameTermTooltip: React.FC<GameTermTooltipProps> = ({ term, children }) => {
  return (
    <Tooltip content={tooltipTexts[term]}>
      {children}
    </Tooltip>
  );
};
