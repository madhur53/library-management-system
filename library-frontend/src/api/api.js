// vite-project/src/api.js 
// Default uses Vite proxy. If NOT using proxy, change API_ROOT to "http://localhost:8081/api"
export const API_ROOT = "/api";

/* ---------------------- INTERNAL HELPER ---------------------- */

async function safeParse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function request(path, opts = {}) {
  const { method = "GET", headers = {}, body, timeoutMs } = opts;

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_ROOT}${normalized}`;

  const controller = new AbortController();
  let timer = null;

  if (timeoutMs && timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body
        ? { "Content-Type": "application/json", ...headers }
        : headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
      signal: controller.signal
    });
  } catch (err) {
    if (timer) clearTimeout(timer);

    if (err.name === "AbortError") {
      const e = new Error("Request timed out");
      e.code = "TIMEOUT";
      throw e;
    }

    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }

  const data = await safeParse(res);

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      res.statusText ||
      `HTTP ${res.status}`;
    const e = new Error(msg);
    e.status = res.status;
    e.body = data;
    throw e;
  }

  return data;
}

/* ---------------------- HIGH-LEVEL API ---------------------- */

// AUTH
export function loginUser(payload) {
  return request("/users/login", { method: "POST", body: payload });
}

export function registerUser(payload) {
  return request("/users", { method: "POST", body: payload });
}

export function loginAdmin(payload) {
  return request("/admins/login", { method: "POST", body: payload });
}

// MEMBERS
export function createMember(payload) {
  return request("/members", { method: "POST", body: payload });
}

export function getMembers() {
  return request("/members");
}

// ✅ DELETE MEMBER (ADMIN)
export function deleteMember(memberId) {
  return request(`/members/${memberId}`, { method: "DELETE" });
}

// ✅ RESTORE MEMBER (ADMIN)
export function restoreMember(memberId) {
  return request(`/members/${memberId}/restore`, { method: "POST" });
}

// USERS
export function getUsers() {
  return request("/users");
}

// BOOKS
export function getBooks() {
  return request("/catalog/books");
}

export function getBookById(id) {
  return request(`/catalog/books/${id}`);
}

export function getBookAvailability(bookId) {
  return request(`/catalog/books/${bookId}/availability`);
}

/* BORROWING (supports days) */
export function borrow({ bookCopyId, bookId, userId, days }) {
  if (bookCopyId != null) {
    return request("/catalog/borrow", {
      method: "POST",
      body: { bookCopyId, userId, days }
    });
  }
  if (bookId != null) {
    return request("/catalog/borrow/book", {
      method: "POST",
      body: { bookId, userId, days }
    });
  }
  return Promise.reject(
    new Error("borrow() requires either bookCopyId or bookId")
  );
}

export function borrowByBook(bookId, userId, days) {
  return request("/catalog/borrow/book", {
    method: "POST",
    body: { bookId, userId, days }
  });
}

export function borrowCopy(bookCopyId, userId, days) {
  return request("/catalog/borrow", {
    method: "POST",
    body: { bookCopyId, userId, days }
  });
}

export function returnCopy(bookCopyId, userId, borrowId) {
  return request("/catalog/return", {
    method: "POST",
    body: { bookCopyId, userId, borrowId }
  });
}

export function getBorrowHistory(userId) {
  return request(`/catalog/borrows/user/${userId}`);
}

// compatibility alias
export function borrowBook(bookId, userId, days) {
  return borrowByBook(bookId, userId, days);
}

/* GENERIC HELPERS */
export function get(path) {
  return request(path, { method: "GET" });
}

export function post(path, body) {
  return request(path, { method: "POST", body });
}

/* ---------------------- DEFAULT EXPORT ---------------------- */

export default {
  API_ROOT,
  request,

  // auth
  loginUser,
  registerUser,
  loginAdmin,

  // members
  createMember,
  getMembers,
  deleteMember,
  restoreMember, // ✅ NOW AVAILABLE

  // users
  getUsers,

  // catalog
  getBooks,
  getBookById,
  getBookAvailability,

  // borrowing
  borrow,
  borrowByBook,
  borrowBook,
  borrowCopy,
  returnCopy,
  getBorrowHistory,

  // helpers
  get,
  post
};
