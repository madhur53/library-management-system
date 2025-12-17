// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";

import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useDarkMode } from "./theme/DarkModeContext";

import BookList from "./components/BookList";
import LoginForm from "./components/LoginForm";
import AdminLogin from "./components/AdminLogin";
import RegisterUser from "./components/RegisterUser";
import UserInfo from "./components/UserInfo";
import Unauthorized from "./pages/Unauthorized";

import AdminDashboard from "./pages/AdminDashboard";
import MembersPage from "./pages/MembersPage";
import BorrowHistory from "./components/BorrowHistory";

// ⭐ ADDED: Create Member page
import CreateMember from "./pages/CreateMember";

import "./App.css";

function AppShell() {
  const { principal, isAdmin, logout } = useAuth();
  const { dark, setDark } = useDarkMode();

  return (
    <>
      <Navbar bg="white" expand="lg" className="mb-3">
        <Container className="container-main">
          <Navbar.Brand as={Link} to="/" style={{ color: "#0d6efd" }}>
            Library<span style={{ color: "#0b5ed7", opacity: 0.85 }}>Portal</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar" className="justify-content-end">
            <Nav className="align-items-center">
              
              <Nav.Link as={Link} to="/">Books</Nav.Link>

              {/* Admin-only Members list */}
              {isAdmin() && <Nav.Link as={Link} to="/members">Members</Nav.Link>}

              {!principal && (
                <>
                  <Nav.Link as={Link} to="/login">Sign in</Nav.Link>
                  <Nav.Link as={Link} to="/admin-login">Admin</Nav.Link>
                  <Nav.Link as={Link} to="/register">Register</Nav.Link>
                </>
              )}

              {isAdmin() && <Nav.Link as={Link} to="/admin">Admin Console</Nav.Link>}

              {/* User loans */}
              {principal && <Nav.Link as={Link} to="/my-loans">My Loans</Nav.Link>}

              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setDark(!dark)}
                >
                  {dark ? "Light" : "Dark"}
                </button>
              </div>

              {principal && (
                <div style={{ color: "#111", marginLeft: 12, display: "flex", alignItems: "center" }}>
                  <div style={{ marginRight: 12, fontSize: 13 }}>
                    {principal.type === "admin"
                      ? `Admin: ${principal.payload?.username ?? principal.payload?.fullName}`
                      : principal.payload?.username ?? principal.payload?.fullName}
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => logout()}
                  >
                    Logout
                  </button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="container-main">
        <UserInfo />
      </Container>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />

      <Container className="container-main mt-3">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<BookList />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin-only pages */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/members"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MembersPage />
              </ProtectedRoute>
            }
          />

          {/* ⭐ ADDED: Create Member route */}
          <Route
            path="/create-member"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CreateMember />
              </ProtectedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/my-loans"
            element={
              <ProtectedRoute>
                <BorrowHistory />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Fallback */}
          <Route path="*" element={<BookList />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}
