// src/components/BookAvailability.jsx
import React, { useEffect, useState } from "react";
import {
  getBookAvailability,
  borrowByBook,
  borrow as borrowSpecificCopy
} from "../api";
import { useAuth } from "../auth/AuthContext";

/**
 * Resolve a primitive numeric userId from various principal shapes
 */
function resolveUserIdFromPrincipal(principal) {
  if (!principal) return null;
  const p = principal.payload ?? principal;
  if (typeof p === "number") return p;
  if (!p) return null;
  let id = p.userId ?? p.id ?? p.user_id ?? null;
  if (id != null) return id;
  const nested = p.user ?? p.userInfo ?? p.account ?? null;
  if (nested && typeof nested === "object") {
    id = nested.userId ?? nested.id ?? nested.user_id ?? null;
    if (id != null) return id;
  }
  return null;
}

export default function BookAvailability({ bookId, userId: userIdProp }) {
  const { principal } = useAuth();
  const resolvedFromAuth = resolveUserIdFromPrincipal(principal);
  // Priority: explicit prop > auth resolved
  const rawUserId = userIdProp ?? resolvedFromAuth;
  const userId = rawUserId != null ? Number(rawUserId) : null;

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ totalCopies: 0, availableCopies: 0 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const data = await getBookAvailability(bookId);
      setCounts({
        totalCopies: data?.totalCopies ?? 0,
        availableCopies: data?.availableCopies ?? 0
      });
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to load availability" });
      setCounts({ totalCopies: 0, availableCopies: 0 });
    } finally {
      setLoading(false);
    }
  }

  async function handleBorrowByBook() {
    // validate user id
    if (userId == null || !Number.isFinite(userId)) {
      setMsg({ type: "error", text: "Please sign in to borrow (invalid user id)." });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      const resp = await borrowByBook(bookId, userId);
      setMsg({ type: "success", text: `Borrowed copy ${resp.bookCopyId}` });
      await refresh();
    } catch (err) {
      if (err && err.status === 409) {
        setMsg({ type: "error", text: err.body?.error || "No copy available right now." });
      } else {
        setMsg({ type: "error", text: err.message || "Borrow failed" });
      }
    } finally {
      setBusy(false);
    }
  }

  // optional: borrow a specific copy (if you have an id)
  async function handleBorrowSpecific(copyId) {
    if (userId == null || !Number.isFinite(userId)) {
      setMsg({ type: "error", text: "Please sign in to borrow (invalid user id)." });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      const resp = await borrowSpecificCopy({ bookCopyId: copyId, userId });
      setMsg({ type: "success", text: `Borrowed copy ${resp.bookCopyId}` });
      await refresh();
    } catch (err) {
      if (err && err.status === 409) {
        setMsg({ type: "error", text: err.body?.error || "Copy not available" });
      } else {
        setMsg({ type: "error", text: err.message || "Borrow failed" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-3" style={{ maxWidth: 520 }}>
      <h5>Book #{bookId}</h5>

      {loading ? (
        <p className="text-muted">Checking availability…</p>
      ) : (
        <p>
          Available: <strong>{counts.availableCopies}</strong> /{" "}
          <strong>{counts.totalCopies}</strong>
        </p>
      )}

      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={handleBorrowByBook}
          disabled={busy || loading || counts.availableCopies <= 0}
        >
          {busy ? "Processing…" : "Borrow (auto pick)"}
        </button>

        <button className="btn btn-outline-secondary" onClick={refresh} disabled={busy}>
          Refresh
        </button>
      </div>

      {msg && (
        <div className={`mt-3 small ${msg.type === "error" ? "text-danger" : "text-success"}`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
