"use client";

export default function Error({ reset }) {
  return (
    <section className="section">
      <div className="container">
        <div className="empty" role="alert">
          <p>Something went wrong loading this page.</p>
          <button type="button" className="btn btn--primary" onClick={reset}>Try again</button>
        </div>
      </div>
    </section>
  );
}
