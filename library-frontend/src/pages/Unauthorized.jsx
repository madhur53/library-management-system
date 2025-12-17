// src/pages/Unauthorized.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="container mt-5">
      <div className="alert alert-danger">
        <h5>Unauthorized</h5>
        <p>You do not have permission to view this page.</p>
        <p><Link to="/">Go to home</Link> or <Link to="/login">sign in</Link>.</p>
      </div>
    </div>
  );
}
