// src/components/AddMember.jsx
import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function AddMember({ onAdded }) {
  const { isAdmin } = useAuth();
  const [userId, setUserId] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!isAdmin()) {
    return <div className="alert alert-warning">Unauthorized — admin access required.</div>;
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await api.createMember({ userId: Number(userId) });
      setMsg("Member created");
      setUserId("");
      if (onAdded) onAdded();
    } catch (e) {
      setErr(e.message || "Failed to create member");
    }
  }

  return (
    <div className="card p-3 mb-3">
      <h5>Add Member</h5>
      <form onSubmit={submit}>
        <input className="form-control mb-2" placeholder="userId (number)" value={userId} onChange={e=>setUserId(e.target.value)} />
        <button className="btn btn-primary w-100" type="submit">Add</button>
      </form>
      {msg && <div className="text-success mt-2">{msg}</div>}
      {err && <div className="text-danger mt-2">{err}</div>}
    </div>
  );
}
