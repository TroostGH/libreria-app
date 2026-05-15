// A single book rendered "face out" on the shelf.
// All books share the same height for a tidy library look. Width varies
// slightly with page count so thicker books look thicker. Title sits at
// the top, author has its own ribbon below, and the rating is shown as
// real stars at the bottom.
import React from "react";

// Deterministic per-book color from a small palette so the same book
// always has the same color across reloads.
const PALETTE = [
  "#6b2737",
  "#2b4a5e",
  "#4a5a2b",
  "#5a3a2b",
  "#7a5a2b",
  "#3a3a5a",
  "#804040",
  "#2b6055",
  "#5e2b5e",
  "#404040",
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function colorFor(book) {
  return PALETTE[hashStr(book.id || book.title || "") % PALETTE.length];
}

function Stars({ value }) {
  if (!value) return <div className="rating empty">non valutato</div>;
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={"star " + (n <= value ? "on" : "off")}>
          {n <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function Book({ book, onClick }) {
  const color = colorFor(book);
  const cls = ["book"];
  if (book.status === "reading") cls.push("reading");
  if (book.status === "abandoned") cls.push("abandoned");
  if (book.status === "toread") cls.push("toread");

  // All books share the same width (CSS controls it). Only color varies.
  return (
    <div
      className={cls.join(" ")}
      style={{ background: color }}
      onClick={onClick}
      title={`${book.title}${book.author ? " — " + book.author : ""}`}
    >
      <div className="book-top">
        {book.status === "toread" && (
          <span className="badge toread-badge">Da leggere</span>
        )}
        {book.status === "abandoned" && (
          <span className="badge abandoned-badge">Abbandonato</span>
        )}
        <div className="book-title">{book.title}</div>
      </div>

      <div className="book-bottom">
        {book.author && (
          <div className="book-author-ribbon">
            <span className="book-author">{book.author}</span>
          </div>
        )}
        <Stars value={book.rate} />
      </div>
    </div>
  );
}
