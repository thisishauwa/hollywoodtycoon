import React, { useState } from "react";

// High-Res XP Icons
const iconMyComputer = "/images/High-Res_XP_Icons/My Computer.ico";
const iconMyProfile = "/images/High-Res_XP_Icons/User 1.ico";
const iconUserAccounts = "/images/High-Res_XP_Icons/User Accounts.ico";
const iconHelp = "/images/High-Res_XP_Icons/User Support.ico";
const iconControlPanel = "/images/High-Res_XP_Icons/Display.ico";
const iconInternet = "/images/High-Res_XP_Icons/Internet Properties.ico";
const iconFolder = "/images/High-Res_XP_Icons/Folder Closed.ico";
const iconGameController = "/images/High-Res_XP_Icons/Game Controller.ico";
const iconActivateWindows = "/images/High-Res_XP_Icons/Activate Windows.ico";
const iconLogOff = "/images/e4e4b7c82836ea1d57b3e70406ce25ededc95b6c.png";

// XP-style standard window (blue title bar, beige body)
const XPModal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  icon?: string;
}> = ({ title, onClose, children, width = "w-[400px]", icon }) => (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 font-tahoma">
    <div className={`${width} bg-[#ece9d8] border-[3px] border-[#0055e5] rounded-t-lg rounded-b-none shadow-2xl flex flex-col`}>
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-2 h-[30px] rounded-t-[3px] select-none shrink-0"
        style={{
          background: "linear-gradient(to bottom, #0058ee 0%, #3593ff 4%, #288eff 6%, #127dff 8%, #036ffc 10%, #0262ee 14%, #0057e5 20%, #0054e3 24%, #0055eb 56%, #005bf5 66%, #026afe 76%, #0062ef 86%, #0052d6 92%, #0040ab 94%, #003087 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)"
        }}
      >
        <div className="flex items-center gap-1">
           {icon && <img src={icon} alt="" className="w-4 h-4" />}
           <span className="text-white text-[13px] font-bold shadow-sm" style={{ textShadow: "1px 1px 0px rgba(0,0,0,0.5)" }}>
            {title}
           </span>
        </div>
        <div className="flex gap-1">
            <button
              onClick={onClose}
              className="w-[21px] h-[21px] bg-[#d73f40] hover:bg-[#e65555] active:bg-[#b02b2c] border border-white/50 rounded-[3px] flex items-center justify-center shadow-sm"
              title="Close"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L9 9M9 1L1 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-3">
        {children}
      </div>
    </div>
  </div>
);

// Credits Modal - Standard Info Dialog
const CreditsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <XPModal title="Credits" onClose={onClose} icon={iconHelp}>
    <div className="flex flex-col gap-4">
       <div className="bg-white border-2 border-inset border-[#828790] p-4 h-48 overflow-y-auto font-sans leading-5 shadow-inner">
           <p className="font-bold text-[#003399] mb-2">Hollywood Tycoon XP Team</p>
           
           <p className="font-bold mt-3">Concept & Design</p>
           <p className="text-sm">Hauwa</p>
           
           <p className="font-bold mt-3">Lead Developer</p>
           <p className="text-sm">Hauwa</p>
           
           <p className="font-bold mt-3">Special Thanks</p>
           <p className="text-sm">The early 2000s for existing.</p>
           
           <div className="my-4 border-t border-gray-300"></div>
           
           <p className="italic text-sm">
             "Movies touch our hearts and awaken our vision, and change the way we see things. 
             They take us to other places. They open doors and minds. Movies are the memories of our lifetime."
           </p>
       </div>
       <div className="flex justify-end">
           <button
             onClick={onClose}
             className="px-6 py-1 min-w-[75px] bg-[#ece9d8] border border-[#003c74] rounded-[3px] text-[11px] hover:bg-[#f3f3f3] shadow-[inset_1px_1px_0px_#fff]"
           >
             OK
           </button>
       </div>
    </div>
  </XPModal>
);

// About Game Modal - 'winver' style
const AboutGameModal: React.FC<{ onClose: () => void; username?: string }> = ({ onClose, username = "Player" }) => (
  <XPModal title="About Hollywood Tycoon" onClose={onClose} width="w-[410px]" icon={iconMyComputer}>
    <div className="flex flex-col select-none">
       {/* Banner */}
       <div className="-mt-3 -mx-3 mb-4 h-16 bg-white border-b border-[#a0a0a0] flex items-center px-4 overflow-hidden relative">
           <div className="absolute right-[-20px] top-[-10px] text-[60px] font-black text-[#ece9d8] opacity-50 italic -rotate-12">
               XP
           </div>
           <div className="z-10">
               <h1 className="text-2xl font-black italic text-[#003399] drop-shadow-sm tracking-tighter">
                   Hollywood <span className="font-light text-[#ff6600]">Tycoon</span>
               </h1>
               <div className="text-[10px] font-bold text-gray-500 ml-1 -mt-1 tracking-widest uppercase">Professional Edition</div>
           </div>
       </div>
       
       <div className="px-2 text-[11px] flex flex-col gap-3">
           <p>
               Version 1.0 (Build 2600.xpsp_sp3_gdr)<br/>
               Copyright © 2003 Hollywood Tycoon Corp.<br/>
               All rights reserved.
           </p>

           <div className="bg-white border border-gray-300 p-2 h-24 overflow-y-auto">
             <strong className="block mb-1">Installed Components:</strong>
             <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                <li>Real-time multiplayer script auctions</li>
                <li>Dynamic actor reputation system</li>
                <li>Production events and random encounters</li>
                <li>Awards season with nominations</li>
                <li>Retro Windows XP aesthetic</li>
             </ul>
           </div>
           
           <p>
               This product is licensed under the <a href="#" className="text-blue-600 underline cursor-pointer">End User License Agreement</a> to:
           </p>
           
           <div className="pl-4 py-1">
               <p className="font-bold">{username}</p>
               <p>StarVision Studios</p>
           </div>
           
           <div className="border-t border-[#a0a0a0] my-1"></div>
           
           <div className="flex gap-2 items-center">
               <span className="text-gray-600">Physical memory available:</span>
               <span className="font-bold">262,144 KB</span>
           </div>
       </div>

       <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-6 py-1 min-w-[75px] bg-[#ece9d8] border border-[#003c74] rounded-[3px] text-[11px] font-bold hover:bg-[#f3f3f3] shadow-[inset_1px_1px_0px_#fff]"
          >
            OK
          </button>
       </div>
    </div>
  </XPModal>
);

// My Profile Modal - 'User Accounts' style
const MyProfileModal: React.FC<{
  onClose: () => void;
  username: string;
  userAvatar?: string;
  onSaveProfile: (name: string, avatar: string) => Promise<void>;
}> = ({ onClose, username, userAvatar, onSaveProfile }) => {
  const [view, setView] = useState<'menu' | 'name' | 'picture'>('menu');
  const [newName, setNewName] = useState(username);
  const [newAvatar, setNewAvatar] = useState(userAvatar || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveProfile(newName, newAvatar);
    setIsSaving(false);
    setView('menu');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-[1px] font-tahoma">
      {/* Full "User Accounts" Window Replica */}
      <div className="w-[600px] h-[550px] bg-white border border-[#0055e5] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="h-[50px] bg-[#0055e5] flex items-center justify-between px-4 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#53a3ff] opacity-50"></div>
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            
            <div className="flex items-center gap-2 z-10">
                <button onClick={() => setView('menu')} className={`flex items-center gap-1 text-white hover:bg-white/10 px-2 py-1 rounded transition-colors group ${view === 'menu' ? 'opacity-50 cursor-default' : ''}`}>
                    <div className="w-5 h-5 rounded-full bg-[#1b7e05] border border-[#52bd3b] flex items-center justify-center shadow-sm group-hover:bg-[#239908]">
                        <svg className="w-3 h-3 text-white -rotate-180" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                    <span className="text-[12px] font-bold">Back</span>
                </button>
                <button onClick={onClose} className="flex items-center gap-1 text-white hover:bg-white/10 px-2 py-1 rounded transition-colors group">
                    <div className="w-5 h-5 rounded-full bg-[#1b7e05] border border-[#52bd3b] flex items-center justify-center shadow-sm group-hover:bg-[#239908]">
                        <img src={iconInternet} className="w-3 h-3" alt="" />
                    </div>
                    <span className="text-[12px] font-bold">Home</span>
                </button>
            </div>
            
            <div className="text-white text-xl font-bold italic tracking-tight opacity-90 z-10">
                User Accounts
            </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar "Related Tasks" */}
            <div className="w-[180px] bg-[#6487dc] p-3 flex flex-col gap-4 text-white">
                <div className="bg-white/0 rounded">
                    <div className="flex items-center gap-2 mb-2 font-bold text-[11px]">
                        <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">?</div>
                        Related Tasks
                    </div>
                    <ul className="space-y-1 pl-6 text-[11px] text-white/90">
                        <li className="hover:underline cursor-pointer">Manage my network passwords</li>
                        <li className="hover:underline cursor-pointer">Prevents a forgotten password</li>
                        <li className="hover:underline cursor-pointer">Change another account</li>
                        <li className="hover:underline cursor-pointer">Create a new account</li>
                    </ul>
                </div>
                
                 <div className="bg-white/0 rounded mt-auto">
                    <div className="flex items-center gap-2 mb-2 font-bold text-[11px]">
                         <span className="text-green-300">Learn About</span>
                    </div>
                     <ul className="space-y-1 pl-6 text-[11px] text-white/90">
                        <li className="hover:underline cursor-pointer">User accounts</li>
                        <li className="hover:underline cursor-pointer">Account types</li>
                        <li className="hover:underline cursor-pointer">Switching users</li>
                    </ul>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-6 relative overflow-y-auto">
                 {/* VIEW: MENU */}
                 {view === 'menu' && (
                   <>
                     <h2 className="text-[#003399] text-[15px] font-medium mb-6">
                        Changes for <span className="font-bold">{username}</span>'s account
                     </h2>

                     <div className="flex gap-4 mb-6">
                         <div className="w-[100px] text-center">
                             <div className="w-[80px] h-[80px] mx-auto bg-gray-200 border-[3px] border-[#fbce5e] rounded-[4px] shadow-sm overflow-hidden mb-2 relative">
                                 {userAvatar ? (
                                    <img src={userAvatar} className="w-full h-full object-cover" alt="" />
                                 ) : (
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-3xl">♟️</div>
                                 )}
                                <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"></div>
                             </div>
                         </div>
                         <div className="flex-1">
                             <div className="flex flex-col gap-1">
                                 <button onClick={() => setView('name')} className="text-left px-2 py-1 text-[11px] text-[#003399] hover:bg-[#ebf4ff] hover:underline rounded flex items-center gap-2 group">
                                     <span className="w-1 h-1 bg-[#003399] rounded-full group-hover:scale-125 transition-transform"></span>
                                     Change my name
                                 </button>
                                 <button onClick={() => setView('picture')} className="text-left px-2 py-1 text-[11px] text-[#003399] hover:bg-[#ebf4ff] hover:underline rounded flex items-center gap-2 group">
                                     <span className="w-1 h-1 bg-[#003399] rounded-full group-hover:scale-125 transition-transform"></span>
                                     Change my picture
                                 </button>
                                 <button className="text-left px-2 py-1 text-[11px] text-[#003399] hover:bg-[#ebf4ff] hover:underline rounded flex items-center gap-2 group opacity-50 cursor-not-allowed">
                                     <span className="w-1 h-1 bg-[#003399] rounded-full group-hover:scale-125 transition-transform"></span>
                                     Change my password
                                 </button>
                                 <button className="text-left px-2 py-1 text-[11px] text-[#003399] hover:bg-[#ebf4ff] hover:underline rounded flex items-center gap-2 group opacity-50 cursor-not-allowed">
                                     <span className="w-1 h-1 bg-[#003399] rounded-full group-hover:scale-125 transition-transform"></span>
                                     Set up my account to use a .NET Passport
                                 </button>
                             </div>
                         </div>
                     </div>
                   </>
                 )}

                 {/* VIEW: CHANGE NAME */}
                 {view === 'name' && (
                   <div className="animate-in fade-in duration-200">
                     <h2 className="text-[#003399] text-[15px] font-medium mb-4">
                        Type a new name for <span className="font-bold">{username}</span>.
                     </h2>
                     <p className="text-[11px] text-gray-700 mb-4">
                        Type the name you want to use in the game. This name will appear on the Start menu and in the Studio Manager.
                     </p>
                     
                     <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full max-w-sm border border-[#003399] rounded-[2px] px-2 py-1 text-[12px] mb-6 shadow-inner outline-none focus:ring-1 focus:ring-[#003399]"
                        autoFocus
                     />

                     <div className="flex gap-2">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-1 bg-[#ece9d8] border border-[#003c74] rounded-[3px] text-[11px] font-bold hover:bg-[#f3f3f3] shadow-sm disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Change Name'}
                        </button>
                        <button 
                          onClick={() => setView('menu')}
                          className="px-4 py-1 bg-[#ece9d8] border border-[#808080] rounded-[3px] text-[11px] hover:bg-[#f3f3f3] shadow-sm"
                        >
                          Cancel
                        </button>
                     </div>
                   </div>
                 )}

                 {/* VIEW: CHANGE PICTURE */}
                 {view === 'picture' && (
                   <div className="animate-in fade-in duration-200">
                     <h2 className="text-[#003399] text-[15px] font-medium mb-4">
                        Pick a new picture for <span className="font-bold">{username}</span>'s account.
                     </h2>
                     <p className="text-[11px] text-gray-700 mb-4">
                        The picture you choose will appear on the Welcome screen and on the Start menu.
                     </p>
                     
                     <div className="h-48 overflow-y-auto border border-[#7f9db9] bg-white p-2 mb-4 grid grid-cols-5 gap-2">
                        {[
                          "/images/profile-airplane.jpg",
                          "/images/profile-astronaut.jpg",
                          "/images/profile-ball.jpg",
                          "/images/profile-beach.jpg",
                          "/images/profile-car.jpg",
                          "/images/profile-cat.jpg",
                          "/images/profile-chess.jpg",
                          "/images/profile-dog.jpg",
                          "/images/profile-duck.jpg",
                          "/images/profile-fish.jpg",
                          "/images/profile-guitar.jpg",
                          "/images/profile-snowflake.jpg",
                        ].map((src, i) => (
                           <div 
                              key={i}
                              onClick={() => setNewAvatar(src)}
                              className={`aspect-square flex items-center justify-center p-2 border hover:bg-blue-50 cursor-pointer rounded-sm ${newAvatar === src ? 'border-[#0055e5] bg-blue-100 ring-1 ring-[#0055e5]' : 'border-transparent'}`}
                           >
                            <img src={src} className="w-10 h-10 object-cover rounded-sm" alt="Avatar option" />
                           </div>
                        ))}
                     </div>
                     
                     <div className="flex flex-col gap-2 mb-6">
                        <p className="text-[11px] text-gray-600">Or enter an image URL:</p>
                        <input 
                          type="text" 
                          placeholder="https://..."
                          value={newAvatar}
                          onChange={(e) => setNewAvatar(e.target.value)}
                          className="w-full border border-[#7f9db9] rounded-[2px] px-2 py-1 text-[11px] outline-none focus:border-[#003399]"
                        />
                     </div>

                     <div className="flex gap-2">
                        <button 
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-4 py-1 bg-[#ece9d8] border border-[#003c74] rounded-[3px] text-[11px] font-bold hover:bg-[#f3f3f3] shadow-sm disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Change Picture'}
                        </button>
                        <button 
                          onClick={() => setView('menu')}
                          className="px-4 py-1 bg-[#ece9d8] border border-[#808080] rounded-[3px] text-[11px] hover:bg-[#f3f3f3] shadow-sm"
                        >
                          Cancel
                        </button>
                     </div>
                   </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  userAvatar?: string;
  onLogOff?: () => void;
  onSaveProfile: (name: string, avatar: string) => Promise<void>;
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

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  username = "Player",
  userAvatar,
  onLogOff,
  onSaveProfile,
}) => {
  // Modal states
  const [showCredits, setShowCredits] = useState(false);
  const [showAboutGame, setShowAboutGame] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);

  // Program items with handlers
  // Left panel - Implemented features only
  const programItems: ProgramItem[] = [
    { icon: iconMyProfile, label: "My Profile", onClick: () => { setShowMyProfile(true); onClose(); } },
    { icon: iconFolder, label: "Credits", onClick: () => { setShowCredits(true); onClose(); } },
    { icon: iconGameController, label: "Games", sublabel: "Coming Soon" },
    { icon: iconActivateWindows, label: "Invite Users", sublabel: "Coming Soon" },
  ];

  // Right panel - Quick access locations
  const locationItems: LocationItem[] = [
    { icon: iconMyComputer, label: "About Game", onClick: () => { setShowAboutGame(true); onClose(); } },
    { icon: iconControlPanel, label: "Control Panel", hasArrow: true },
    { icon: iconHelp, label: "Help and Support", hasArrow: true },
  ];

  return (
    <>
      {/* Modals - always rendered so they can show even when menu is closed */}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
      {showAboutGame && <AboutGameModal onClose={() => setShowAboutGame(false)} username={username} />}
      {showMyProfile && (
        <MyProfileModal
          onClose={() => setShowMyProfile(false)}
          username={username}
          userAvatar={userAvatar}
          onSaveProfile={onSaveProfile}
        />
      )}

      {isOpen && (
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
              <div className="flex-1 bg-white p-[6px] flex flex-col gap-1 min-h-[280px]">
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
              <div className="w-[188px] bg-[#d3e5fa] border-l border-[#95bdee] p-[6px] pt-2 flex flex-col gap-1 h-[280px] overflow-y-auto">
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
      )}
    </>
  );
};
