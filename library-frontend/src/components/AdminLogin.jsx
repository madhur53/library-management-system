// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const admin = await loginAdmin({ username, password });

      // ✅ STORE ADMIN ROLE (THIS FIXES DELETE BUTTON)
      localStorage.setItem("role", "ADMIN");

      // optional but useful
      if (admin?.adminId) {
        localStorage.setItem("adminId", admin.adminId);
      }
      if (admin?.username) {
        localStorage.setItem("adminUsername", admin.username);
      }

      setUsername("");
      setPassword("");
      navigate("/admin");
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <div className="card p-3">
      <h5>Admin Login</h5>
      <form onSubmit={submit}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="form-control mb-2"
          placeholder="username"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="form-control mb-2"
          placeholder="password"
        />
        <button className="btn btn-secondary w-100" type="submit">
          Admin Login
        </button>
        {err && <div className="text-danger mt-2">{err}</div>}
      </form>
    </div>
  );
}
