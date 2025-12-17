// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { notifyError } from "../ui/ToastProvider";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0
  });

  useEffect(() => {
    let mounted = true;

    Promise.all([api.getUsers(), api.getMembers()])
      .then(([users, members]) => {
        if (!mounted) return;

        const activeUsers = Array.isArray(users)
          ? users.filter(u => u.status === "ACTIVE")
          : [];

        const activeMembers = Array.isArray(members)
          ? members.filter(m => m.status === "ACTIVE")
          : [];

        setStats({
          totalUsers: activeUsers.length,
          totalMembers: activeMembers.length
        });
      })
      .catch(() => {
        notifyError("Failed to load admin stats");
      });

    return () => (mounted = false);
  }, []);

  return (
    <div className="card-elevated p-3">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12
        }}
      >
        <h3 style={{ margin: 0 }}>Admin Overview</h3>

        {/* Admin action buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link to="/create-member" className="btn btn-sm btn-primary">
            Add Member
          </Link>

          <Link to="/members" className="btn btn-sm btn-outline-secondary">
            Manage Members
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
        <div className="card p-3" style={{ minWidth: 160 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {stats.totalUsers}
          </div>
          <div style={{ color: "var(--muted)" }}>Active Users</div>
        </div>

        <div className="card p-3" style={{ minWidth: 160 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            {stats.totalMembers}
          </div>
          <div style={{ color: "var(--muted)" }}>Active Members</div>
        </div>

        <div className="card p-3" style={{ minWidth: 160 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>—</div>
          <div style={{ color: "var(--muted)" }}>Borrowed (demo)</div>
        </div>
      </div>
    </div>
  );
}
