// src/pages/CreateMember.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { notifySuccess, notifyError } from "../ui/ToastProvider";

export default function CreateMember() {
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([api.getUsers(), api.getMembers()])
      .then(([usersData, membersData]) => {
        if (!mounted) return;
        setUsers(Array.isArray(usersData) ? usersData : []);
        setMembers(Array.isArray(membersData) ? membersData : []);
      })
      .catch(() => {
        notifyError("Failed to load users or members.");
      })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  function findMemberByUser(userId) {
    return members.find(m => (m.userId ?? m.user_id ?? m.id) === userId);
  }

  async function handleCreate() {
    if (!selectedUser) {
      notifyError("Please select a user.");
      return;
    }

    const userId = Number(selectedUser);
    const existingMember = findMemberByUser(userId);

    setCreating(true);
    try {
      if (!existingMember) {
        // ✅ Fresh member
        await api.createMember({ userId });
        notifySuccess("Member created successfully.");
      } else if (existingMember.status === "INACTIVE") {
        // ♻️ Reactivate member
        await api.restoreMember(existingMember.memberId ?? existingMember.id);
        notifySuccess("Member reactivated successfully.");
      } else {
        notifyError("User is already an active member.");
        return;
      }

      setSelectedUser("");
      const refreshedMembers = await api.getMembers().catch(() => null);
      if (Array.isArray(refreshedMembers)) setMembers(refreshedMembers);

    } catch (err) {
      notifyError(err?.message || "Failed to create or restore member");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="card-elevated p-3">
      <h4>Create / Reactivate Member</h4>

      <div className="mb-3">
        <label className="form-label">Select existing user</label>
        {loading ? (
          <div className="text-muted">Loading users…</div>
        ) : (
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- choose user --</option>
            {users.map(u => {
              const uid = u.userId ?? u.user_id ?? u.id;
              const display =
                u.fullName ?? u.full_name ?? u.username ?? `user-${uid}`;

              const member = findMemberByUser(uid);
              const isActiveMember = member && member.status === "ACTIVE";
              const isInactiveMember = member && member.status === "INACTIVE";

              return (
                <option
                  key={uid}
                  value={uid}
                  disabled={isActiveMember}
                >
                  {display}
                  {isActiveMember && " (already member)"}
                  {isInactiveMember && " (reactivate)"}
                </option>
              );
            })}
          </select>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={creating || !selectedUser}
        >
          {creating ? "Processing…" : "Confirm"}
        </button>

        <button
          className="btn btn-outline-secondary"
          onClick={() => setSelectedUser("")}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
