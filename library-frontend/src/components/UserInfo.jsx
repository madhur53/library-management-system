// src/components/UserInfo.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import api from "../api/api";

/**
 * UserInfo without debug UI.
 * Keeps robust membership detection but hides debug details from the user.
 */
export default function UserInfo() {
  const { principal, logout } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkMembership() {
      setLoading(true);
      setIsMember(false);

      try {
        const members = await api.getMembers();
        if (!mounted) return;

        if (!principal || !principal.payload) {
          setIsMember(false);
          return;
        }

        const payload = principal.payload;

        // helper to collect candidate identifiers from the payload
        const possibleUserIds = new Set();
        const addIfVal = (v) => {
          if (v === undefined || v === null) return;
          possibleUserIds.add(String(v));
          if (!isNaN(Number(v))) possibleUserIds.add(String(Number(v)));
        };

        // common fields at root
        addIfVal(payload.userId);
        addIfVal(payload.id);
        addIfVal(payload.UserId);
        addIfVal(payload._id);
        addIfVal(payload.userID);
        addIfVal(payload.user_id);
        addIfVal(payload.username);
        addIfVal(payload.email);

        // nested user object
        const nested = payload.user ?? payload.userInfo ?? payload.account ?? null;
        if (nested) {
          addIfVal(nested.userId);
          addIfVal(nested.id);
          addIfVal(nested._id);
          addIfVal(nested.username);
          addIfVal(nested.email);
        }

        const candidates = Array.from(possibleUserIds).filter(Boolean);

        // normalize members to array
        const list = Array.isArray(members) ? members : (members ? [members] : []);

        // helper to extract identifiers from a member record
        function memberUserIdentifiers(m) {
          const ids = new Set();
          const add = (v) => {
            if (v === undefined || v === null) return;
            ids.add(String(v));
            if (!isNaN(Number(v))) ids.add(String(Number(v)));
          };

          add(m.userId);
          add(m.userID);
          add(m.UserId);
          add(m.user_id);
          add(m.user);
          add(m.id);
          add(m.memberId);

          const nestedUser = m.user ?? m.userObj ?? m.userInfo ?? null;
          if (nestedUser && typeof nestedUser === "object") {
            add(nestedUser.id);
            add(nestedUser.userId);
            add(nestedUser._id);
            add(nestedUser.username);
            add(nestedUser.email);
          }

          return Array.from(ids);
        }

        // matching attempts
        let matched = false;

        // 1) exact candidate id intersection
        if (candidates.length > 0) {
          for (const mem of list) {
            const memIds = memberUserIdentifiers(mem);
            const intersection = memIds.filter(mid => candidates.includes(mid));
            if (intersection.length > 0) {
              matched = true;
              break;
            }
          }
        }

        // 2) username/email match
        if (!matched) {
          const uname = payload.username ?? payload.email ?? null;
          if (uname) {
            for (const mem of list) {
              const nested = mem.user ?? mem.userObj ?? mem.userInfo ?? null;
              if (nested && (nested.username === uname || nested.email === uname)) {
                matched = true;
                break;
              }
              if (mem.username === uname || mem.email === uname) {
                matched = true;
                break;
              }
            }
          }
        }

        // 3) numeric loose match
        if (!matched && candidates.length > 0) {
          for (const mem of list) {
            const memIds = memberUserIdentifiers(mem);
            for (const c of candidates) {
              for (const mId of memIds) {
                if (String(Number(c)) === String(Number(mId))) {
                  matched = true;
                  break;
                }
              }
              if (matched) break;
            }
            if (matched) break;
          }
        }

        setIsMember(matched);
      } catch (e) {
        // silently fail membership check (no debug output in UI)
        setIsMember(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkMembership();
    return () => { mounted = false; };
  }, [principal]);

  if (!principal) return null;

  const name = principal.payload?.username ?? principal.payload?.fullName ?? "User";
  const role = principal.type ?? "user";

  return (
    <div className="card p-2 mb-3 profile-card" style={{ borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%" }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, background: "#eef7ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#0d6efd" }}>
          { (name || "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase() }
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 13, color: "#6c757d" }}>{role === "admin" ? "Administrator" : "User"}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div className="badge-soft" style={{ marginBottom: 6 }}>
                { loading ? "Checking..." : (isMember ? "Member" : "Not a member") }
              </div>
              <div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => logout()}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
