// src/components/BookDetailsModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import ConfirmBorrowModal from "./ConfirmBorrowModal";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { notifySuccess, notifyError } from "../ui/ToastProvider";

/**
 * BookDetailsModal — now the single place where borrowing happens.
 */
export default function BookDetailsModal({ book, open, onClose }) {
  const [availability, setAvailability] = useState(null);
  const [rules, setRules] = useState({ defaultDays: 14, maxDays: 28 });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { principal } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function loadExtras() {
      if (!book || (!book.bookId && !book.id)) return;
      try {
        const bookId = book.bookId ?? book.id;

        const av = await api.getBookAvailability(bookId).catch(() => null);
        if (mounted) setAvailability(av);

        const r = await api.getLoanRules().catch(() => null);
        if (mounted && r && (r.defaultDays || r.maxDays)) setRules(r);
      } catch (_) {}
    }
    loadExtras();
    return () => { mounted = false; };
  }, [book]);

  async function handleConfirmBorrow(days) {
    if (!principal?.payload) {
      notifyError("Please sign in to borrow books.");
      return;
    }

    const raw = principal.payload;
    const resolvedUserId = raw?.userId ?? raw?.id ?? raw?.UserId ?? raw?._id;
    const numericUserId = resolvedUserId != null ? Number(resolvedUserId) : null;

    if (!numericUserId || !Number.isFinite(numericUserId)) {
      notifyError("Could not determine your user ID. Please sign in again.");
      return;
    }

    const isMemberFlag = principal.payload?.isMember ?? null;
    const isMember = principal.type === "admin" ? true : (isMemberFlag === true ? true : null);

    if (isMember === false) {
      notifyError("Only library members may borrow books.");
      return;
    }

    const bookId = book.bookId ?? book.id;

    try {
      //const res = await api.borrowByBook(bookId, numericUserId);
      const res = await api.borrowByBook(bookId, numericUserId, days);

      notifySuccess("Borrowed successfully!");
      setConfirmOpen(false);
      onClose?.();
    } catch (e) {
      notifyError(e?.message || "Failed to borrow this book.");
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050
        }}
      >
        <motion.div
          initial={{ y: 30, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ width: "min(920px,95%)", borderRadius: 12, padding: 18 }}
        >
          <div className="card-elevated">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <h4 style={{ margin: 0 }}>{book?.title ?? book?.name ?? "Untitled"}</h4>
                <div style={{ color: "var(--muted)" }}>
                  {book?.author
                    ? typeof book.author === "string"
                      ? book.author
                      : `${book.author.firstName ?? ""} ${book.author.lastName ?? ""}`.trim()
                    : book?.authorName}
                </div>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <hr />

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  minHeight: 200,
                  background: "#f7fbff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div style={{ fontSize: 32, color: "var(--brand)" }}>📚</div>
              </div>

              <div>
                <p><strong>Publisher:</strong> {book?.publisher?.name ?? book?.publisherName ?? "—"}</p>
                <p><strong>Category:</strong> {book?.category?.name ?? book?.categoryName ?? "—"}</p>
                <p><strong>ISBN / Code:</strong> {book?.isbn ?? book?.code ?? "—"}</p>

                <p><strong>Availability:</strong> {availability?.availableCopies ?? book?.availableCopies ?? "N/A"}</p>

                <p><strong>Loan rules:</strong> Default {rules?.defaultDays ?? 14} days, max {rules?.maxDays ?? 28} days</p>

                <p><strong>Description:</strong></p>
                <div style={{ whiteSpace: "pre-wrap", color: "var(--muted)" }}>
                  {book?.description ?? book?.summary ?? "No description available."}
                </div>

                <hr />

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={() => setConfirmOpen(true)}>
                    Borrow
                  </button>
                  <button className="btn btn-outline-secondary" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <ConfirmBorrowModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          book={book}
          defaultDays={rules?.defaultDays ?? 14}
          maxDays={rules?.maxDays ?? 28}
          onConfirm={handleConfirmBorrow}
        />
      </motion.div>
    </AnimatePresence>
  );
}
