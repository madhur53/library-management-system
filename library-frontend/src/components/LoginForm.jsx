// src/components/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await loginUser({ username, password });
      setUsername(""); setPassword("");
      navigate("/");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-elevated" style={{maxWidth:420}}>
      <h4 style={{marginTop:0}}>Welcome back</h4>
      <p className="text-muted" style={{marginBottom:12}}>Sign in with your username and password.</p>

      <form onSubmit={submit}>
        <div className="mb-2">
          <label className="form-label small">Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} className="form-control" placeholder="your username" />
        </div>

        <div className="mb-2">
          <label className="form-label small">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-control" placeholder="your password" />
        </div>

        {err && <div className="alert alert-danger py-1">{err}</div>}

        <div style={{display:"flex", gap:8}}>
          <button className="btn btn-primary" style={{flex:1}} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { setUsername("demo"); setPassword("demo"); }}>Demo</button>
        </div>
      </form>
    </div>
  );
}
