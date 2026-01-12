import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { SoundProvider } from "./contexts/SoundContext";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SoundProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SoundProvider>
    </AuthProvider>
  </React.StrictMode>
);
