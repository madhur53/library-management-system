// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Protects a route for authenticated users (either user or admin).
 * If `requireAdmin === true` only admins are allowed.
 *
 * Usage:
 * <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage/></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { principal, isAdmin } = useAuth();

  if (!principal) {
    // not logged in -> redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    // logged in but not admin -> unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
