const USER_BASE_URL = "http://localhost:5041";

export async function loginUser(username, password) {
  const res = await fetch(`${USER_BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed (status ${res.status})`);
  }

  return res.json();
}