import React, { useState, useMemo } from "react";
import { GameState, ProjectStatus, StudioMessage, GameEvent } from "./types";
import {
  SEED_ACTORS,
  SEED_SCRIPTS,
  INITIAL_BALANCE,
  START_MONTH,
  START_YEAR,
  RIVAL_STUDIOS,
} from "./constants";
import { processAdvanceMonth } from "./services/gameService";
import {
  WindowFrame,
  RetroTab,
  StatusBar,
  RetroButton,
  DesktopIcon,
} from "./components/RetroUI";
import { Dashboard } from "./components/Dashboard";
import { ScriptMarket } from "./components/ScriptMarket";
import { ActorDb } from "./components/ActorDb";
import { ProductionWizard } from "./components/Production";
import { ReleasedFilms } from "./components/Releases";
import { MagazineWindow } from "./components/MagazineWindow";
import { StudioNetwork } from "./components/StudioNetwork";
import { StartMenu } from "./components/StartMenu";
import { AuthScreen } from "./components/AuthScreen";
import { useAuth } from "./contexts/AuthContext";

const uuid = () =>
  "id-" +
  Math.random().toString(36).substring(2, 9) +
  "-" +
  Date.now().toString(36);

interface WindowState {
  id: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

const App: React.FC = () => {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    month: START_MONTH,
    year: START_YEAR,
    balance: INITIAL_BALANCE,
    reputation: 50,
    actors: SEED_ACTORS,
    marketScripts: SEED_SCRIPTS,
    ownedScripts: [],
    projects: [],
    rivals: RIVAL_STUDIOS,
    events: [],
    playerName: profile?.username || "EXEC_01",
    studioName: profile?.username || "StarVision Global",
    messages: [],
  });

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "scripts" | "actors" | "releases"
  >("dashboard");
  const [showProductionWizard, setShowProductionWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(false);

  // Window Management State - MUST be before any conditional returns
  const [windows, setWindows] = useState<Record<string, WindowState>>({
    manager: { id: "manager", isOpen: true, isMinimized: false, zIndex: 10 },
    news: { id: "news", isOpen: false, isMinimized: false, zIndex: 11 },
    messenger: {
      id: "messenger",
      isOpen: false,
      isMinimized: false,
      zIndex: 12,
    },
  });
  const [activeWindowId, setActiveWindowId] = useState<string>("manager");
  const [topZ, setTopZ] = useState(20);

  // Taskbar items - MUST be before conditional returns
  const taskbarItems = useMemo(() => {
    return Object.values(windows)
      .filter((w) => w.isOpen)
      .map((w) => ({
        id: w.id,
        title:
          w.id === "manager"
            ? "Studio Manager"
            : w.id === "news"
            ? "Variety News"
            : "Messenger",
        icon:
          w.id === "manager"
            ? "/images/My computer.ico"
            : w.id === "news"
            ? "/images/internetexplorer.svg"
            : "/images/mail:message.svg",
        isMinimized: w.isMinimized,
        isActive: activeWindowId === w.id,
      }));
  }, [windows, activeWindowId]);

  // Debug logging
  console.log("Auth State:", { user: !!user, profile: !!profile, loading });

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #5a7fb8 0%, #3a5f8f 100%)",
        }}
      >
        <div className="flex flex-col items-center">
          <img
            src="/images/82099ace911ce53ef05dd5dc28fa051c.png"
            alt="Windows XP"
            className="h-32 mb-12 object-contain"
          />
          <div className="w-64 h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>
          <p className="text-white text-sm mt-4 font-['Tahoma']">
            Loading your studio...
          </p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <AuthScreen
        onSignIn={async (email, password) => {
          setAuthError(null);
          const { error } = await signIn(email, password);
          if (error) setAuthError(error.message);
        }}
        onSignUp={async (email, password, username) => {
          setAuthError(null);
          const { error } = await signUp(email, password, username);
          if (error) setAuthError(error.message);
        }}
        isLoading={loading}
        error={authError}
      />
    );
  }

  // If user exists but profile doesn't (and we're not loading), show error
  if (!profile && !loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#5a7fb8]">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Profile not found</p>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-white text-blue-900 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const focusWindow = (id: string) => {
    setTopZ((prev) => prev + 1);
    setActiveWindowId(id);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], zIndex: topZ + 1, isMinimized: false, isOpen: true },
    }));
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
  };

  const toggleWindowMinimize = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
    if (windows[id].isMinimized) focusWindow(id);
  };

  const handleAdvanceMonth = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      const newState = await processAdvanceMonth(gameState);
      setGameState(newState);
      setIsLoading(false);
    }, 600);
  };

  const handlePlayerBid = (scriptId: string, amount: number) => {
    setGameState((prev) => {
      const updatedScripts = prev.marketScripts.map((s) =>
        s.id === scriptId
          ? { ...s, currentBid: amount, highBidderId: "player" }
          : s
      );
      return { ...prev, marketScripts: updatedScripts };
    });

    setTimeout(() => {
      if (Math.random() > 0.4) {
        setGameState((prev) => {
          const script = prev.marketScripts.find((s) => s.id === scriptId);
          if (!script || script.highBidderId !== "player") return prev;

          const rival =
            prev.rivals[Math.floor(Math.random() * prev.rivals.length)];
          const counterAmount =
            script.currentBid + Math.floor(Math.random() * 80000 + 20000);

          if (rival.balance < counterAmount) return prev;

          const outbidEvent: GameEvent = {
            id: uuid(),
            month: prev.month,
            type: "BAD",
            message: `OUTBID: ${
              rival.name
            } placed $${counterAmount.toLocaleString()} on "${script.title}"!`,
            read: false,
          };

          return {
            ...prev,
            marketScripts: prev.marketScripts.map((s) =>
              s.id === scriptId
                ? { ...s, currentBid: counterAmount, highBidderId: rival.id }
                : s
            ),
            events: [...prev.events, outbidEvent],
          };
        });
      }
    }, 1200);
  };

  const handleSendMoney = (studioId: string, amount: number) => {
    if (gameState.balance < amount) return;
    setGameState((prev) => {
      const transferEvent: GameEvent = {
        id: uuid(),
        month: prev.month,
        type: "INFO",
        message: `TRANSFER: You wired $${amount.toLocaleString()} to ${
          prev.rivals.find((r) => r.id === studioId)?.name
        }.`,
        read: false,
      };
      return {
        ...prev,
        balance: prev.balance - amount,
        rivals: prev.rivals.map((r) =>
          r.id === studioId
            ? {
                ...r,
                balance: r.balance + amount,
                relationship: Math.min(100, r.relationship + 10),
              }
            : r
        ),
        events: [...prev.events, transferEvent],
      };
    });
  };

  const handleSendMessage = (
    studioId: string,
    content: string,
    isPublic: boolean
  ) => {
    const newMessage: StudioMessage = {
      id: uuid(),
      fromId: "player",
      toId: studioId,
      content,
      month: gameState.month,
      isPublic,
    };

    setGameState((prev) => {
      const studio = prev.rivals.find((r) => r.id === studioId);
      const newEvents: GameEvent[] = [...prev.events];
      if (isPublic) {
        newEvents.push({
          id: uuid(),
          month: prev.month,
          type: "GOSSIP",
          message: `WIRE: StarVision Global sends bold memo to ${
            studio?.name
          }: "${content.slice(0, 30)}..."`,
          read: false,
        });
      }
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        events: newEvents,
      };
    });
  };

  const handleStartProduction = (
    scriptId: string,
    actorIds: string[],
    budget: number,
    marketing: number
  ) => {
    const script = gameState.ownedScripts.find((s) => s.id === scriptId);
    if (!script) return;

    const newProject = {
      id: uuid(),
      scriptId,
      studioId: "player",
      title: script.title,
      genre: script.genre,
      cast: actorIds,
      marketingBudget: marketing,
      productionBudget: budget,
      progress: 0,
      status: ProjectStatus.PreProduction,
      quality: 0,
      revenue: 0,
      releaseMonth: 0,
      releaseYear: gameState.year,
      chemistry: 0,
    };

    setGameState((prev) => {
      const newEvents: GameEvent[] = [
        ...prev.events,
        {
          id: uuid(),
          month: prev.month,
          type: "GOOD",
          message: `GREENLIT: "${script.title}" production started.`,
          read: false,
        },
      ];
      if (marketing > 500000) {
        newEvents.push({
          id: uuid(),
          month: prev.month,
          type: "AD",
          message: `MARKETING: ${script.title}`,
          read: false,
        });
      }
      return {
        ...prev,
        balance: prev.balance - (budget + marketing),
        projects: [...prev.projects, newProject],
        actors: prev.actors.map((a) =>
          actorIds.includes(a.id) ? { ...a, status: "In Production" } : a
        ),
        ownedScripts: prev.ownedScripts.filter((s) => s.id !== scriptId),
        events: newEvents,
      };
    });
    setShowProductionWizard(false);
    setActiveTab("dashboard");
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-[1px] cursor-wait">
          <div className="bg-[#ece9d8] bevel-outset p-4 flex flex-col items-center gap-2 shadow-xl">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-bold">
              Updating Industry Data...
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 p-4 flex flex-col items-start gap-4 z-0 pointer-events-none">
        <DesktopIcon
          icon="/images/My computer.ico"
          label="My Studio"
          onClick={() => focusWindow("manager")}
          isImage
        />
        <DesktopIcon
          icon="/images/internetexplorer.svg"
          label="Variety News"
          onClick={() => focusWindow("news")}
          isImage
        />
        <DesktopIcon
          icon="/images/mail:message.svg"
          label="Messenger"
          onClick={() => focusWindow("messenger")}
          isImage
        />
        <DesktopIcon
          icon="/images/Full Recycle Bin.ico"
          label="Trash"
          isImage
        />
      </div>

      <div className="flex-1 relative p-4 z-10 pointer-events-none">
        {windows.manager.isOpen && !windows.manager.isMinimized && (
          <WindowFrame
            title="StarVision Studio Manager 2003"
            className="w-full max-w-6xl h-full max-h-[85vh]"
            onClose={() => closeWindow("manager")}
            onMinimize={() => toggleWindowMinimize("manager")}
            isActive={activeWindowId === "manager"}
            zIndex={windows.manager.zIndex}
            onFocus={() => focusWindow("manager")}
            initialPos={{ x: 50, y: 30 }}
          >
            <div className="flex flex-col h-full overflow-hidden bg-[#ece9d8]">
              {/* FIXED TABS HEADER */}
              <div className="flex px-1 pt-1 items-end shrink-0 border-b border-[#808080] bg-[#dcd8c0]">
                <RetroTab
                  isActive={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                  label="Summary"
                />
                <RetroTab
                  isActive={activeTab === "scripts"}
                  onClick={() => setActiveTab("scripts")}
                  label="IP Market"
                />
                <RetroTab
                  isActive={activeTab === "actors"}
                  onClick={() => setActiveTab("actors")}
                  label="Talent Pool"
                />
                <RetroTab
                  isActive={activeTab === "releases"}
                  onClick={() => setActiveTab("releases")}
                  label="Filmography"
                />
              </div>

              {/* FLEXIBLE CONTENT BODY */}
              <div className="flex-1 p-0.5 flex flex-col overflow-hidden bg-white">
                {activeTab === "dashboard" && (
                  <div className="flex justify-end p-2 bg-[#ece9d8] border-b border-[#808080] shrink-0">
                    <RetroButton
                      onClick={() => setShowProductionWizard(true)}
                      variant="primary"
                      className="h-8 px-4 font-bold !bg-gradient-to-b !from-[#ece9d8] !to-[#d8d4c0] hover:!from-[#f5f5f5] hover:!to-[#e0dcc8]"
                    >
                      GREENLIGHT NEW FILM
                    </RetroButton>
                  </div>
                )}

                <div className="flex-1 overflow-hidden h-full">
                  {activeTab === "dashboard" && (
                    <Dashboard
                      state={gameState}
                      onAdvance={handleAdvanceMonth}
                    />
                  )}
                  {activeTab === "scripts" && (
                    <ScriptMarket
                      marketScripts={gameState.marketScripts}
                      ownedScripts={gameState.ownedScripts}
                      balance={gameState.balance}
                      rivals={gameState.rivals}
                      onBid={handlePlayerBid}
                    />
                  )}
                  {activeTab === "actors" && (
                    <ActorDb actors={gameState.actors} />
                  )}
                  {activeTab === "releases" && (
                    <ReleasedFilms state={gameState} />
                  )}
                </div>
              </div>
            </div>
          </WindowFrame>
        )}

        {windows.news.isOpen && !windows.news.isMinimized && (
          <MagazineWindow
            events={gameState.events}
            onClose={() => closeWindow("news")}
            onMinimize={() => toggleWindowMinimize("news")}
            isActive={activeWindowId === "news"}
            zIndex={windows.news.zIndex}
            onFocus={() => focusWindow("news")}
          />
        )}

        {windows.messenger.isOpen && !windows.messenger.isMinimized && (
          <StudioNetwork
            state={gameState}
            onSendMoney={handleSendMoney}
            onSendMessage={handleSendMessage}
            onClose={() => closeWindow("messenger")}
            onMinimize={() => toggleWindowMinimize("messenger")}
            isActive={activeWindowId === "messenger"}
            zIndex={windows.messenger.zIndex}
            onFocus={() => focusWindow("messenger")}
          />
        )}
      </div>

      {showProductionWizard && (
        <ProductionWizard
          state={gameState}
          onStartProduction={handleStartProduction}
          onCancel={() => setShowProductionWizard(false)}
        />
      )}

      <StartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        username={profile?.username || gameState.playerName}
        onLogOff={signOut}
      />

      <StatusBar
        items={[
          `$${(gameState.balance / 1000).toFixed(0)}K`,
          `${gameState.reputation}% Rep`,
          `Q${Math.ceil(gameState.month / 3)} ${gameState.year}`,
        ]}
        activeWindows={taskbarItems}
        onToggleWindow={(id) => toggleWindowMinimize(id)}
        onStartClick={() => setShowStartMenu(!showStartMenu)}
      />
    </div>
  );
};

export default App;
