// src/components/BookList.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { FaBook, FaFilter, FaSort } from "react-icons/fa";
import BookDetailsModal from "./BookDetailsModal";
import { motion } from "framer-motion";
import { notifySuccess, notifyError } from "../ui/ToastProvider";

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState("title"); // title | author
  const [onlyMember, setOnlyMember] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getBooks()
      .then(data => { if (!mounted) return; setBooks(Array.isArray(data) ? data : []); })
      .catch(e => { if (!mounted) return; setErr(e?.message || "Failed to fetch books"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => mounted = false;
  }, []);

  const formatted = useMemo(() => {
    return books.map(b => {
      const title = b.title ?? b.name ?? "Untitled";
      const author = b.author ? (typeof b.author === "string" ? b.author : `${b.author.firstName ?? ""} ${b.author.lastName ?? ""}`.trim()) : (b.authorName ?? "Unknown");
      return {...b, title, author};
    });
  }, [books]);

  const filtered = useMemo(() => {
    let arr = formatted;
    if (q) {
      const s = q.toLowerCase();
      arr = arr.filter(b => (b.title + " " + b.author).toLowerCase().includes(s));
    }
    if (onlyMember) {
      // client-side: if membership flag exists filter, else no-op
      arr = arr.filter(b => b.onlyForMembers !== true ? true : false);
    }
    if (sortBy === "title") arr = arr.sort((a,b)=> a.title.localeCompare(b.title));
    else if (sortBy === "author") arr = arr.sort((a,b)=> a.author.localeCompare(b.author));
    return arr;
  }, [formatted, q, sortBy, onlyMember]);

  function openDetails(book) { setSelected(book); setOpen(true); }
  function closeDetails() { setSelected(null); setOpen(false); }

  function handleReserve(book) {
    // stub kept for compatibility (but in Option A reserve/borrow lives in modal)
    try {
      notifySuccess(`Reserved "${book.title}" (demo)`);
    } catch (e) {
      notifyError("Failed to reserve");
    }
  }

  return (
    <div className="card-elevated">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <h4 style={{margin:0}}>Books</h4>
          <div className="badge-soft" style={{fontSize:12}}>Total {books.length}</div>
        </div>

        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <input className="form-control" placeholder="Search title or author..." value={q} onChange={e=>setQ(e.target.value)} style={{width:260}} />
          <select className="form-select" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:160}}>
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
          </select>
          <button className={`btn btn-outline-secondary`} onClick={()=>setOnlyMember(!onlyMember)}>
            <FaFilter/> {onlyMember ? "Members only" : "All"}
          </button>
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {loading ? (
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16}}>
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} className="book-card" style={{height:250, padding:12}}>
              <div className="book-cover" style={{height:120}}></div>
              <div className="book-body">
                <div style={{height:14, background:"#eef2ff", width:"80%", borderRadius:6}}></div>
                <div style={{height:12, background:"#f1f5ff", width:"60%", borderRadius:6, marginTop:6}}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="book-grid" role="list">
          {filtered.length===0 && <div className="text-muted">No books found.</div>}
          {filtered.map((b, idx) => (
            <motion.div layout key={b.bookId ?? b.id ?? idx} className="book-card" style={{cursor:"pointer"}}>
              <div className="book-cover" onClick={()=>openDetails(b)}>
                <FaBook style={{fontSize:26, color:"#0d6efd"}}/>
              </div>
              <div className="book-body">
                <div className="book-title" onClick={()=>openDetails(b)}>{b.title}</div>
                <div className="book-meta">{b.author}</div>
                <div style={{marginTop:8, display:"flex", gap:8}}>
                  <button className="btn btn-outline-primary btn-sm" onClick={()=>openDetails(b)}>Details</button>
                  {/* Reserve / Borrow moved to Details modal to avoid duplication */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BookDetailsModal book={selected} open={open} onClose={closeDetails} />
    </div>
  );
}
