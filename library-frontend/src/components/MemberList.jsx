// src/components/MemberList.jsx
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function MemberList() {
  const { principal, isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isAdmin()) return; // do not fetch if not admin
    let mounted = true;
    async function load() {
      try {
        const data = await api.getMembers();
        if (mounted) setMembers(data || []);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load members");
      }
    }
    load();
    return () => { mounted = false; };
  }, [principal]); // refetch when principal changes

  if (!isAdmin()) {
    return <div className="alert alert-warning">Unauthorized — admin access required.</div>;
  }

  return (
    <div className="card p-3">
      <h5>Members</h5>
      {err && <div className="text-danger mb-2">{err}</div>}
      <table className="table table-sm">
        <thead>
          <tr><th>ID</th><th>UserId</th><th>Member Since</th></tr>
        </thead>
        <tbody>
          {members.length ? members.map(m => (
            <tr key={m.id ?? m.memberId ?? JSON.stringify(m)}>
              <td>{m.id ?? m.memberId ?? ""}</td>
              <td>{m.userId}</td>
              <td>{m.membershipDate ? new Date(m.membershipDate).toLocaleString() : "-"}</td>
            </tr>
          )) : <tr><td colSpan="3">No members</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
