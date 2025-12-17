// src/ui/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h5>Something went wrong</h5>
            <pre style={{whiteSpace:"pre-wrap"}}>{String(this.state.error)}</pre>
            <p>Please refresh the page or contact support.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
