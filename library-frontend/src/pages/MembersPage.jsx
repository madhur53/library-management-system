// src/pages/MembersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { FaDownload, FaTrash, FaUndo } from "react-icons/fa";

/**
 * Render members and show membership date correctly for local display (Asia/Kolkata).
 */
function formatMemberDate(dateString) {
  if (!dateString) return "-";

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    const local = new Date(Number(y), Number(m) - 1, Number(d));
    return local.toLocaleDateString("en-IN");
  }

  try {
    const dt = new Date(dateString);
    if (Number.isNaN(dt.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(dt);
  } catch {
    return dateString;
  }
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 admin guard
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getMembers()
      .then(m => { if (mounted) setMembers(Array.isArray(m) ? m : []); })
      .catch(() => setMembers([]))
      .finally(() => { if (mounted) setLoading(false); });
    return () => mounted = false;
  }, []);

  // ✅ HIDE INACTIVE MEMBERS BY DEFAULT
  const filtered = useMemo(() => {
    const activeMembers = members.filter(
      m => m.status !== "INACTIVE"
    );

    if (!q) return activeMembers;

    const s = q.trim().toLowerCase();
    return activeMembers.filter(m => {
      const mid = String(m.memberId ?? m.id ?? "");
      const uid = String(m.userId ?? m.user_id ?? "");
      return mid.includes(s) || uid.includes(s);
    });
  }, [members, q]);

  function exportCSV() {
    const rows = [
      ["memberId","userId","membershipDate","status"],
      ...filtered.map(m => [
        m.memberId ?? m.id ?? "",
        m.userId ?? m.user_id ?? "",
        m.membershipDate ?? m.membership_date ?? "",
        m.status ?? "ACTIVE"
      ])
    ];
    const csv = rows.map(r =>
      r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // =========================
  // DEACTIVATE MEMBER
  // =========================
  function deleteMember(memberId) {
    if (!window.confirm("Deactivate this member?")) return;

    api.deleteMember(memberId)
      .then(() => {
        setMembers(prev =>
          prev.map(m =>
            (m.memberId ?? m.id) === memberId
              ? { ...m, status: "INACTIVE" }
              : m
          )
        );
      })
      .catch(err => {
        alert(err?.message || "Failed to deactivate member");
      });
  }

  // =========================
  // REACTIVATE MEMBER
  // =========================
  function restoreMember(memberId) {
    api.restoreMember(memberId)
      .then(() => {
        setMembers(prev =>
          prev.map(m =>
            (m.memberId ?? m.id) === memberId
              ? { ...m, status: "ACTIVE" }
              : m
          )
        );
      })
      .catch(err => {
        alert(err?.message || "Failed to restore member");
      });
  }

  return (
    <div className="card-elevated">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h4>Members</h4>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <input
            className="form-control"
            placeholder="Search by userId/memberId"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button className="btn btn-outline-secondary" onClick={exportCSV}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>MemberId</th>
                <th>UserId</th>
                <th>MemberSince</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const memberId = m.memberId ?? m.id;
                const inactive = m.status === "INACTIVE";

                return (
                  <tr key={memberId}>
                    <td>{memberId}</td>
                    <td>{m.userId ?? m.user_id ?? ""}</td>
                    <td>{formatMemberDate(m.membershipDate ?? m.membership_date)}</td>
                    <td>
                      <span className="badge bg-success">ACTIVE</span>
                    </td>

                    {isAdmin && (
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          title="Deactivate member"
                          onClick={() => deleteMember(memberId)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
