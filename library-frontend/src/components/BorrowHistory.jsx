import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { Button } from "react-bootstrap";

export default function BorrowHistory() {
  const { principal } = useAuth();
  const p = principal?.payload ?? principal;
  const userId = Number(p?.userId ?? p?.id ?? p?.user_id);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.getBorrowHistory(userId).then(data => setList(Array.isArray(data) ? data : [])).catch(()=>{}).finally(()=>setLoading(false));
  }, [userId]);

  async function handleReturn(borrow) {
    try {
      await api.returnCopy(borrow.bookCopyId, userId, borrow.borrowId);
      setList(list.filter(l=>l.borrowId !== borrow.borrowId));
    } catch (e) {
      alert(e?.message || "Return failed");
    }
  }

  if (!userId) return <div>Please sign in to view borrowing history.</div>;

  return (
    <div>
      <h4>My Loans</h4>
      {loading && <div>Loading…</div>}
      {!loading && list.length===0 && <div>No loans found.</div>}
      <ul className="list-group">
        {list.map(b => (
          <li key={b.borrowId} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div><strong>Copy #{b.bookCopyId}</strong> — Book #{b.bookId}</div>
              <div className="small text-muted">Issued: {b.issuedOn} • Due: {b.dueOn} • Status: {b.status}</div>
            </div>
            <div>
              {b.status === "ACTIVE" && <Button variant="outline-danger" size="sm" onClick={()=>handleReturn(b)}>Return</Button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
