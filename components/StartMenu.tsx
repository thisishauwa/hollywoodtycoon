import React from "react";

// Import icons from Figma
const iconInternet = "/images/4d7e8c868beeb6a52b134fb9224e6f219986120f.png";
const iconEmail = "/images/67245b8379bfc95e877a8bf77af11e50f93c9666.png";
const iconMediaPlayer = "/images/a452f2899a0222d68b78c6d0316b8e5b4001de15.png";
const iconMSN = "/images/aae80cc02bc3611b9d11394e6347e669ba3148cc.png";
const iconMessenger = "/images/3d588ce8e469ecee21d24fcd281ee392f4046a27.png";
const iconTour = "/images/6bcc50f02444b307a4111cd673e2c2151ec8e689.png";
const iconMyDocuments = "/images/8f324bd70a4b74d383205e1e964a352e5a8fcdb1.png";
const iconMyPictures = "/images/0139ae1ab0cd145c3dd9e9b345d1522b74e6ba70.png";
const iconComputer = "/images/My computer.ico";
const iconControlPanel = "/images/3849be99b89c123dd6ff0b28fe733fd1558334fd.png";
const iconHelp = "/images/8102f876b018bca29c07ca9bc0dd7609e2adc5db.png";
const iconRun = "/images/ce00f48541fffae4db3ea6a2096246e36e66a774.png";
const iconLogOff = "/images/e4e4b7c82836ea1d57b3e70406ce25ededc95b6c.png";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  userAvatar?: string;
  onLogOff?: () => void;
}

interface ProgramItem {
  icon: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
}

interface LocationItem {
  icon: string;
  label: string;
  hasArrow?: boolean;
  onClick?: () => void;
}

const programItems: ProgramItem[] = [
  { icon: iconInternet, label: "Studio Manager", sublabel: "Current Game" },
  { icon: iconEmail, label: "New Game", sublabel: "Start Fresh" },
  { icon: iconMSN, label: "Settings" },
  { icon: iconMessenger, label: "Credits" },
  { icon: iconTour, label: "Help & Support" },
];

const locationItems: LocationItem[] = [
  { icon: iconMyDocuments, label: "My Profile" },
  { icon: iconMyPictures, label: "Leaderboards" },
  { icon: iconComputer, label: "About Game" },
  { icon: iconControlPanel, label: "Control Panel" },
  { icon: iconHelp, label: "Help and Support" },
  { icon: iconRun, label: "Run..." },
];

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  username = "Player",
  userAvatar,
  onLogOff,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[999]" onClick={onClose} />

      {/* Start Menu */}
      <div
        className="fixed bottom-8 left-0 z-[1000] w-[376px] bg-white border border-[#215cc5] rounded-tl-[6px] rounded-tr-[6px] overflow-hidden"
        style={{
          boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.5)",
          fontFamily: "Tahoma, sans-serif",
        }}
      >
        {/* Blue gradient header with user */}
        <div
          className="h-[64px] flex items-center px-[6px] relative"
          style={{
            backgroundImage:
              "linear-gradient(rgb(116, 170, 232) 0%, rgb(25, 105, 210) 0.77526%, rgb(33, 116, 219) 6.392%, rgb(71, 146, 236) 13.18%, rgb(68, 139, 227) 91.946%, rgb(37, 119, 223) 95.857%, rgb(13, 91, 199) 100%)",
            boxShadow:
              "inset 5px 0px 6px -4px #91a3d9, inset 0px -5px 40px 10px rgba(9,74,189,0.66)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* User Avatar */}
            <div
              className="w-[52px] h-[52px] border-2 border-[#ccd6eb] rounded-[5px] bg-gray-300 overflow-hidden"
              style={{ boxShadow: "2px 2px 4px 0px rgba(0,0,0,0.25)" }}
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
              )}
            </div>
            {/* Username */}
            <p
              className="text-white text-[18px] font-semibold"
              style={{
                textShadow: "1px 2px 3px rgba(0,0,0,0.5)",
                fontFamily: "Inter, Tahoma, sans-serif",
              }}
            >
              {username}
            </p>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex border-t border-b border-[#1c6bd1] relative">
          {/* Orange accent line */}
          <div
            className="absolute left-0 right-0 top-[-1px] h-[3px]"
            style={{
              background:
                "linear-gradient(to right, rgba(255,138,29,0) 0%, #ff8a1d 50%, rgba(255,138,29,0) 100%)",
            }}
          />

          {/* Left panel - Programs */}
          <div className="flex-1 bg-white p-[6px] flex flex-col gap-1 min-h-[374px]">
            {programItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 p-[2px] hover:bg-[#3169c6] cursor-pointer transition-colors rounded-sm group"
                onClick={item.onClick}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-black group-hover:text-white truncate">
                    {item.label}
                  </p>
                  {item.sublabel && (
                    <p className="text-[9px] text-gray-500 group-hover:text-white/80 truncate">
                      {item.sublabel}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* All Programs button */}
            <div className="mt-auto pt-1 border-t border-gray-200">
              <div className="flex items-center justify-end gap-2 p-[2px] hover:bg-[#3169c6] hover:text-white cursor-pointer rounded-sm">
                <p className="text-[11px] font-bold">All Programs</p>
                <div className="text-green-600">▶</div>
              </div>
            </div>
          </div>

          {/* Right panel - Locations */}
          <div className="w-[188px] bg-[#d3e5fa] border-l border-[#95bdee] p-[6px] pt-2 flex flex-col gap-1 h-[374px] overflow-y-auto">
            {locationItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-1 p-[2px] hover:bg-[#3169c6] cursor-pointer transition-colors rounded-sm group"
                onClick={item.onClick}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-8 h-8 object-contain"
                />
                <p className="flex-1 text-[11px] text-[#373738] group-hover:text-white truncate">
                  {item.label}
                </p>
                {item.hasArrow && (
                  <div className="text-xs text-[#373738] group-hover:text-white">
                    ▶
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom power controls */}
        <div
          className="h-[40px] flex items-center justify-end gap-2 px-2"
          style={{
            backgroundImage:
              "linear-gradient(rgb(116, 170, 232) 0%, rgb(25, 105, 210) 0.77526%, rgb(33, 116, 219) 6.392%, rgb(71, 146, 236) 13.18%, rgb(68, 139, 227) 91.946%, rgb(37, 119, 223) 95.857%, rgb(13, 91, 199) 100%)",
            boxShadow: "inset -4px 0px 4px -1px rgba(0,46,137,0.25)",
          }}
        >
          {/* Log off button */}
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-white/20 rounded transition-colors"
            onClick={() => {
              onClose();
              onLogOff?.();
            }}
          >
            <img src={iconLogOff} alt="Log off" className="w-6 h-6" />
            <span className="text-white text-[11px] font-bold">Log off</span>
          </button>
        </div>
      </div>
    </>
  );
};
