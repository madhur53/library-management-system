// vite-project/src/pages/BooksPage.jsx
import React, { useEffect, useState } from "react";
import { getBooks } from "../api"; // uses API_ROOT from src/api.js
import BookAvailability from "../components/BookAvailability";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const data = await getBooks();
        if (mounted) setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(e.message || "Failed to load books");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">Loading books…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Error: {err}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="mb-3">Library Catalog</h3>

      {books.length === 0 ? (
        <div className="alert alert-info">No books found.</div>
      ) : (
        <div className="row g-3">
          {books.map((b) => (
            <div key={b.id ?? b.bookId ?? b.book_id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title" style={{ fontSize: "1rem" }}>
                    {b.title ?? "Untitled"}
                  </h5>
                  <p className="card-text text-muted mb-2" style={{ fontSize: ".86rem" }}>
                    {b.author?.firstName || b.author?.name || b.author?.lastName
                      ? `${b.author?.firstName ?? ""} ${b.author?.lastName ?? ""}`.trim()
                      : b.publisher?.name ?? ""}
                  </p>

                  <div style={{ marginTop: "auto" }}>
                    {/* BookAvailability expects a numeric bookId prop */}
                    <BookAvailability
                      bookId={b.id ?? b.bookId ?? b.book_id}
                      userId={12} /* replace with real user id / auth */
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
