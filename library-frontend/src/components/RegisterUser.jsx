// src/components/RegisterUser.jsx
import { useState } from "react";
import api from "../api/api";

export default function RegisterUser({ onRegistered }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      const payload = { fullName, username, password, email };
      await api.registerUser(payload);
      setMsg("User created successfully.");
      setFullName(""); setUsername(""); setPassword(""); setEmail("");
      if (onRegistered) onRegistered();
    } catch (e) {
      if (e.status === 409) setErr(e.body || "Username already exists");
      else setErr(e.message || "Registration failed");
    }
  }

  return (
    <div className="card p-3 mb-3">
      <h5>Register User</h5>
      <form onSubmit={submit}>
        <input className="form-control mb-2" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
        <input className="form-control mb-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="btn btn-success w-100" type="submit">Register</button>
        {msg && <div className="text-success mt-2">{msg}</div>}
        {err && <div className="text-danger mt-2">{err}</div>}
      </form>
    </div>
  );
}
