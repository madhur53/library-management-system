// src/components/AutoBorrowButton.jsx
import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Toast, ToastContainer, Spinner } from "react-bootstrap";
import { getBookAvailability, borrowByBook, returnCopy } from "../api/api.js";
import { useAuth } from "../auth/AuthContext";

/**
 * AutoBorrowButton
 * Props:
 *  - bookId (number|string)
 *  - title (string) optional, shown in modal/toast
 *  - className (string) optional for styling
 *
 * Usage: <AutoBorrowButton bookId={b.id} title={b.title} />
 */

// Helper: robustly extract a primitive numeric userId from the auth principal
function resolveUserId(principal) {
  if (!principal) return null;

  // Many auth hooks put the user under principal.payload
  const p = principal.payload ?? principal;

  // If it's already a number
  if (typeof p === "number") return p;

  if (!p) return null;

  // Common fields
  let id = p.userId ?? p.id ?? p.user_id ?? null;
  if (id != null) return id;

  // Sometimes payload itself contains a nested user object
  const nested = p.user ?? p.userInfo ?? p.account ?? null;
  if (nested && typeof nested === "object") {
    id = nested.userId ?? nested.id ?? nested.user_id ?? null;
    if (id != null) return id;
  }

  return null;
}

export default function AutoBorrowButton({ bookId, title, className }) {
  const { principal } = useAuth();
  const resolvedUserIdRaw = resolveUserId(principal);

  // coerce to a number when used
  const resolvedUserId = resolvedUserIdRaw != null ? Number(resolvedUserIdRaw) : null;

  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ totalCopies: 0, availableCopies: 0 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastBorrowedCopyId, setLastBorrowedCopyId] = useState(null);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    // load availability once when component mounts
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await getBookAvailability(bookId);
        if (!mounted) return;
        setCounts({
          totalCopies: data?.totalCopies ?? 0,
          availableCopies: data?.availableCopies ?? 0
        });
      } catch (err) {
        if (!mounted) return;
        setMsg({ type: "error", text: err.message || "Failed to load availability" });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; if (undoTimerRef.current) clearTimeout(undoTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function refresh() {
    setLoading(true);
    try {
      const data = await getBookAvailability(bookId);
      setCounts({
        totalCopies: data?.totalCopies ?? 0,
        availableCopies: data?.availableCopies ?? 0
      });
      setMsg(null);
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to refresh" });
    } finally {
      setLoading(false);
    }
  }

  async function confirmAndBorrow() {
    // Validate numeric userId
    if (!resolvedUserId && resolvedUserId !== 0) {
      setMsg({ type: "error", text: "Please sign in to borrow." });
      setShowConfirm(false);
      return;
    }
    if (!Number.isFinite(resolvedUserId)) {
      setMsg({ type: "error", text: "Invalid user id. Please sign in again." });
      setShowConfirm(false);
      return;
    }

    setShowConfirm(false);
    setBusy(true);
    setMsg(null);
    try {
      // ensure we pass primitive numeric IDs
      const resp = await borrowByBook(bookId, Number(resolvedUserId));
      setLastBorrowedCopyId(resp.bookCopyId);
      setShowToast(true);
      // auto-hide toast after 10s and clear lastBorrowedCopyId
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setShowToast(false);
        setLastBorrowedCopyId(null);
      }, 10000);

      setMsg({ type: "success", text: `Borrowed copy ${resp.bookCopyId}` });
      await refresh();
    } catch (err) {
      if (err && err.status === 409) {
        setMsg({ type: "error", text: err.body?.error || "No copy available" });
      } else {
        setMsg({ type: "error", text: err.message || "Borrow failed" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    if (!lastBorrowedCopyId) return;
    if (!resolvedUserId && resolvedUserId !== 0) {
      setMsg({ type: "error", text: "Please sign in to return the book." });
      return;
    }
    setBusy(true);
    try {
      await returnCopy(lastBorrowedCopyId, Number(resolvedUserId));
      setMsg({ type: "success", text: `Returned copy ${lastBorrowedCopyId}` });
      setShowToast(false);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
      setLastBorrowedCopyId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Undo failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={className}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={busy || loading || counts.availableCopies <= 0}
        >
          {loading ? (<><Spinner animation="border" size="sm" className="me-1" />Check</>) :
            busy ? "Processing…" :
            `Borrow (${counts.availableCopies}/${counts.totalCopies})`}
        </Button>
        {msg && <div className={`small mt-1 ${msg.type === "error" ? "text-danger" : "text-success"}`}>{msg.text}</div>}
      </div>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm borrow</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Borrow <strong>{title ?? `book #${bookId}`}</strong>?</p>
          <p className="small text-muted">Available copies: <strong>{counts.availableCopies}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="primary" onClick={confirmAndBorrow} disabled={busy}>
            {busy ? "Borrowing…" : "Confirm borrow"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={10000} autohide>
          <Toast.Header>
            <strong className="me-auto">Borrowed</strong>
            <small>just now</small>
          </Toast.Header>
          <Toast.Body className="d-flex justify-content-between align-items-center">
            <div>Borrowed copy <strong>{lastBorrowedCopyId}</strong></div>
            <div>
              <Button size="sm" variant="outline-danger" onClick={handleUndo} disabled={busy}>
                Undo
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
