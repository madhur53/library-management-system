const CATALOG_BASE_URL = "http://localhost:8081";

export async function fetchBooks() {
  const res = await fetch(`${CATALOG_BASE_URL}/api/catalog/books`);
  if (!res.ok) {
    throw new Error(`Failed to fetch books (status ${res.status})`);
  }
  return res.json();
}





export async function borrowBookByMember(bookId, { memberId = null, userId = null, issuedBy = null, days = 14 } = {}) {
  const payload = { memberId, userId, issuedBy, days };
  const res = await fetch(`${CATALOG_BASE}/api/catalog/books/${bookId}/borrow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Borrow failed (status ${res.status})`);
  }
  return res.json();
}
