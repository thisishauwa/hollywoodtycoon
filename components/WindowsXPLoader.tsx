import React from "react";

export const WindowsXPLoader: React.FC = () => {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #5a7fb8 0%, #3a5f8f 100%)",
      }}
    >
      <div className="flex flex-col items-center">
        {/* Windows XP Logo */}
        <img
          src="/images/82099ace911ce53ef05dd5dc28fa051c.png"
          alt="Windows XP"
          className="h-32 mb-16 object-contain"
        />

        {/* Loading Text */}
        <p
          className="text-white text-sm mb-4"
          style={{ fontFamily: "Tahoma, sans-serif" }}
        >
          Microsoft Windows XP
        </p>

        {/* Windows XP Progress Bar - Authentic Style */}
        <div
          className="relative w-64 h-3 bg-[#003399] border border-[#0055dd] overflow-hidden"
          style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}
        >
          {/* Animated sliding blocks */}
          <div className="absolute inset-0 flex">
            <div className="xp-bar-segment"></div>
            <div className="xp-bar-segment"></div>
            <div className="xp-bar-segment"></div>
          </div>
        </div>
      </div>

      <style>{`
        .xp-bar-segment {
          width: 33.333%;
          height: 100%;
          background: linear-gradient(to bottom, #0066ff 0%, #0055dd 50%, #0044cc 100%);
          animation: xp-slide 1.2s ease-in-out infinite;
          opacity: 0;
        }
        
        .xp-bar-segment:nth-child(1) {
          animation-delay: 0s;
        }
        
        .xp-bar-segment:nth-child(2) {
          animation-delay: 0.4s;
        }
        
        .xp-bar-segment:nth-child(3) {
          animation-delay: 0.8s;
        }
        
        @keyframes xp-slide {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          20% {
            opacity: 1;
            transform: translateX(0);
          }
          80% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
