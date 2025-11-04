"use client";

export default function FilterErrorPage({ error }) {
  return (
    <div className="error">
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
