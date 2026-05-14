import React from "react";
import Book from "./Book.jsx";

export default function Shelf({
  label,
  sublabel,
  books,
  onPick,
  onAdd,
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <section className="shelf">
      <div
        className="shelf-label"
        onClick={onToggleCollapse}
        role={onToggleCollapse ? "button" : undefined}
        tabIndex={onToggleCollapse ? 0 : undefined}
        title={onToggleCollapse ? "Clic per aprire/chiudere lo scaffale" : undefined}
      >
        <div className="shelf-label-left">
          {onToggleCollapse && (
            <span className={"chevron " + (collapsed ? "collapsed" : "open")}>
              ▾
            </span>
          )}
          <h2>{label}</h2>
        </div>
        <span className="count">
          {sublabel ?? `${books.length} libr${books.length === 1 ? "o" : "i"}`}
        </span>
      </div>

      {!collapsed && (
        <>
          <div className="shelf-board">
            <div className="books-row">
              {books.length === 0 && !onAdd && (
                <div className="empty-shelf">Nessun libro qui ancora.</div>
              )}
              {books.map((b) => (
                <Book key={b.id} book={b} onClick={() => onPick(b)} />
              ))}
              {onAdd && (
                <div
                  className="book empty-add"
                  style={{ width: 110 }}
                  onClick={onAdd}
                  title="Aggiungi un libro a questo scaffale"
                >
                  + Aggiungi
                </div>
              )}
            </div>
          </div>
          <div className="shelf-floor" />
        </>
      )}
    </section>
  );
}
