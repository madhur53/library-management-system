// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // store unified principal: { type: "user"|"admin", payload: {...} }
  const [principal, setPrincipal] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("principal") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (principal) localStorage.setItem("principal", JSON.stringify(principal));
    else localStorage.removeItem("principal");
  }, [principal]);

  const loginUser = async (credentials) => {
    const user = await api.loginUser(credentials);
    const p = { type: "user", payload: user };
    setPrincipal(p);
    return p;
  };

  const loginAdmin = async (credentials) => {
    const admin = await api.loginAdmin(credentials);
    const p = { type: "admin", payload: admin };
    setPrincipal(p);
    return p;
  };

  const logout = () => {
    setPrincipal(null);
  };

  const isAdmin = () => principal?.type === "admin";
  const isUser = () => principal?.type === "user";

  return (
    <AuthContext.Provider value={{ principal, loginUser, loginAdmin, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
