// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Providers & UI helpers
import ToastProvider from "./ui/ToastProvider";
import ErrorBoundary from "./ui/ErrorBoundary";
import { DarkModeProvider } from "./theme/DarkModeContext";
import { AuthProvider } from "./auth/AuthContext";

// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element "#root" not found in index.html');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
