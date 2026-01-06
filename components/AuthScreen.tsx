import React, { useState } from "react";

// Windows XP Profile Icons
const PROFILE_ICONS = [
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
];

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSignIn,
  onSignUp,
  isLoading = false,
  error = null,
}) => {
  const [mode, setMode] = useState<"select" | "signin" | "signup">("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Generate random profile icon once at mount
  const [profileIcon] = useState(
    () => PROFILE_ICONS[Math.floor(Math.random() * PROFILE_ICONS.length)]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      await onSignIn(email, password);
    } else if (mode === "signup") {
      await onSignUp(email, password, username);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ fontFamily: "'Source Sans Pro', Tahoma, sans-serif" }}
    >
      {/* Header with gradient line */}
      <div
        className="relative"
        style={{
          minHeight: "112px",
          width: "100%",
          backgroundColor: "#084DA3",
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 h-[7px]"
          style={{
            background:
              "linear-gradient(270deg, #084DA3 -33.4%, #084DA3 6.07%, #FFFFFF 49.56%, #084DA3 82.59%, #084DA3 121.25%)",
          }}
        />
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{
          background:
            "radial-gradient(19.48% 42.48% at 10% 22.48%, #9CC0E9 0%, #508FD9 100%)",
        }}
      >
        <div
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-10"
          style={{ height: "100%" }}
        >
          {/* Left side - Logo and text */}
          <div
            className="flex flex-col items-end justify-center relative"
            style={{ top: "-40px" }}
          >
            <img
              src="/images/82099ace911ce53ef05dd5dc28fa051c.png"
              alt="Windows XP"
              className="h-32 object-contain"
            />
            <h1 className="text-white font-medium text-lg mt-8 mr-10">
              To begin, click your user name
            </h1>
          </div>

          {/* Vertical line */}
          <div
            className="w-0.5 h-[80%] mx-10"
            style={{
              background:
                "linear-gradient(180deg, #508FD9 0%, #FFFFFF 47.4%, #508FD9 98.96%)",
            }}
          />

          {/* Right side - User cards */}
          <div className="flex flex-col gap-4">
            {mode === "select" && (
              <>
                {/* Sign In Card */}
                <div
                  onClick={() => setMode("signin")}
                  className="cursor-pointer group"
                  style={{
                    width: "445px",
                    height: "112.5px",
                    background:
                      "linear-gradient(90deg, #084DA3 0%, #508FD9 100%)",
                    borderRadius: "4px 0px 0px 4px",
                    padding: "15px 20px",
                    display: "flex",
                    gap: "15px",
                  }}
                >
                  <div className="w-20 h-20 relative">
                    <img
                      src={profileIcon}
                      alt="Sign In"
                      className="w-20 h-20 object-cover border-2 border-transparent group-hover:border-[#FFCC00] transition-colors"
                      style={{ borderRadius: "2px" }}
                    />
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="font-medium text-lg mb-1">Sign In</h3>
                    <p className="text-sm opacity-90">
                      Existing Studio Account
                    </p>
                  </div>
                </div>

                {/* Create Account Card */}
                <div
                  onClick={() => setMode("signup")}
                  className="cursor-pointer group"
                  style={{
                    width: "445px",
                    height: "112.5px",
                    background:
                      "linear-gradient(90deg, #084DA3 0%, #508FD9 100%)",
                    borderRadius: "4px 0px 0px 4px",
                    padding: "15px 20px",
                    display: "flex",
                    gap: "15px",
                  }}
                >
                  <div className="w-20 h-20 relative">
                    <img
                      src={profileIcon}
                      alt="Create Account"
                      className="w-20 h-20 object-cover border-2 border-transparent group-hover:border-[#FFCC00] transition-colors"
                      style={{ borderRadius: "2px" }}
                    />
                  </div>
                  <div className="flex-1 text-white">
                    <p className="font-medium text-lg">Create Account</p>
                  </div>
                </div>
              </>
            )}

            {mode === "signin" && (
              <div
                style={{
                  width: "445px",
                  minHeight: "140px",
                  background:
                    "linear-gradient(90deg, #084DA3 0%, #508FD9 100%)",
                  borderRadius: "4px 0px 0px 4px",
                  padding: "15px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative shrink-0">
                    <img
                      src={profileIcon}
                      alt="Sign In"
                      className="w-20 h-20 object-cover border-2 border-[#FFCC00]"
                      style={{ borderRadius: "2px" }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-base mb-1">
                      Sign In
                    </h3>
                    <p className="text-white text-xs opacity-90">
                      Type your credentials
                    </p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 text-xs rounded border border-white/50 bg-white/90"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 text-xs rounded border border-white/50 bg-white/90"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-white text-xs underline hover:no-underline"
                    >
                      Don't have an account? Sign up
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0"
                    >
                      <img
                        src="/images/Frame 99.svg"
                        alt="Next"
                        className="w-8 h-8"
                      />
                    </button>
                  </div>
                  {error && (
                    <p className="text-yellow-300 text-xs">⚠️ {error}</p>
                  )}
                </form>
              </div>
            )}

            {mode === "signup" && (
              <div
                style={{
                  width: "445px",
                  minHeight: "170px",
                  background:
                    "linear-gradient(90deg, #084DA3 0%, #508FD9 100%)",
                  borderRadius: "4px 0px 0px 4px",
                  padding: "15px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 relative shrink-0">
                    <img
                      src={profileIcon}
                      alt="Create Account"
                      className="w-20 h-20 object-cover border-2 border-[#FFCC00]"
                      style={{ borderRadius: "2px" }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-base mb-1">
                      Create Account
                    </h3>
                    <p className="text-white text-xs opacity-90">
                      Set up your studio
                    </p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Studio Name"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 text-xs rounded border border-white/50 bg-white/90"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 text-xs rounded border border-white/50 bg-white/90"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-1.5 text-xs rounded border border-white/50 bg-white/90"
                    style={{ fontFamily: "Tahoma, sans-serif" }}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setEmail("");
                        setPassword("");
                        setUsername("");
                      }}
                      className="text-white text-xs underline hover:no-underline"
                    >
                      Already have an account? Sign in
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0"
                    >
                      <img
                        src="/images/Frame 99.svg"
                        alt="Next"
                        className="w-8 h-8"
                      />
                    </button>
                  </div>
                  {error && (
                    <p className="text-yellow-300 text-xs">⚠️ {error}</p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative"
        style={{
          minHeight: "12.5vh",
          width: "100%",
          backgroundColor: "#084DA3",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[7px]"
          style={{
            background:
              "linear-gradient(270deg, #084DA3 -33.4%, #084DA3 6.07%, #FF9933 49.56%, #084DA3 82.59%, #084DA3 121.25%)",
          }}
        />
      </div>
    </div>
  );
};
