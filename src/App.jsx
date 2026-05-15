import React, { useEffect, useMemo, useState } from "react";
import Shelf from "./components/Shelf.jsx";
import BookDetail from "./components/BookDetail.jsx";
import {
  fetchAllBooks,
  saveBook,
  deleteBook,
  emptyBook,
} from "./lib/books.js";
import { hasFirebaseConfig } from "./firebase.js";

function groupByYear(books) {
  // year 0 -> "Da leggere"
  const map = new Map();
  for (const b of books) {
    const y = b.year || 0;
    if (!map.has(y)) map.set(y, []);
    map.get(y).push(b);
  }
  return map;
}

// Ordering: status=reading first, then most recent (by start, falling back
// to end date), then alphabetical for items with no dates.
function shelfSort(a, b) {
  const ar = a.status === "reading" ? 1 : 0;
  const br = b.status === "reading" ? 1 : 0;
  if (ar !== br) return br - ar;
  const ka = a.dateStart || a.dateEnd || "";
  const kb = b.dateStart || b.dateEnd || "";
  if (ka && kb) return kb.localeCompare(ka); // descending
  if (ka) return -1;
  if (kb) return 1;
  return (a.title || "").localeCompare(b.title || "");
}

function yearStats(books) {
  let pages = 0;
  let days = 0;
  for (const b of books) {
    if (b.status !== "finished") continue;
    if (b.pages && b.daysReading) {
      pages += b.pages;
      days += b.daysReading;
    }
  }
  if (!days) return null;
  return Math.round(pages / days);
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // book being viewed/edited
  const [collapsed, setCollapsed] = useState({}); // { [yearOrZero]: true }

  useEffect(() => {
    (async () => {
      try {
        // Allow a one-off force-reseed via ?seed=force. After the seed we
        // strip the query so a refresh doesn't redo it endlessly.
        const params = new URLSearchParams(window.location.search);
        const force = params.get("seed") === "force";
        const all = await fetchAllBooks({ force });
        setBooks(all);
        if (force) {
          params.delete("seed");
          const cleanUrl =
            window.location.pathname +
            (params.toString() ? `?${params.toString()}` : "") +
            window.location.hash;
          window.history.replaceState({}, "", cleanUrl);
          // eslint-disable-next-line no-alert
          alert(
            `Re-seed completato: ${all.length} libri ricaricati con tutte le note.`
          );
        }
      } catch (e) {
        console.error(e);
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => groupByYear(books), [books]);
  const years = useMemo(
    () => [...grouped.keys()].filter((y) => y > 0).sort((a, b) => b - a),
    [grouped]
  );

  const stats = useMemo(() => {
    const finished = books.filter((b) => b.status === "finished");
    const totPages = finished.reduce((s, b) => s + (b.pages || 0), 0);
    const totCost = books.reduce((s, b) => s + (b.cost || 0), 0);
    const reading = books.filter((b) => b.status === "reading").length;
    return {
      tot: books.length,
      finished: finished.length,
      pages: totPages,
      cost: totCost,
      reading,
    };
  }, [books]);

  async function handleSave(book) {
    if (!book.id) book.id = `book-${Date.now()}`;
    const saved = await saveBook(book);
    setBooks((bs) => {
      const idx = bs.findIndex((b) => b.id === saved.id);
      if (idx >= 0) {
        const next = [...bs];
        next[idx] = saved;
        return next;
      }
      return [...bs, saved];
    });
    setSelected(null);
  }

  async function handleDelete(book) {
    const ok = window.confirm(`Eliminare "${book.title}" dalla libreria?`);
    if (!ok) return;
    await deleteBook(book.id);
    setBooks((bs) => bs.filter((b) => b.id !== book.id));
    setSelected(null);
  }

  function handleAdd(year) {
    const b = emptyBook(year);
    if (year === 0) b.status = "toread";
    setSelected(b);
  }

  function toggleShelf(key) {
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));
  }

  function sublabelFor(yearKey, list) {
    const reading = list.filter((b) => b.status === "reading").length;
    const total = list.length;
    const totLabel = `${total} libr${total === 1 ? "o" : "i"}`;
    if (yearKey === 0) {
      return total > 0 ? `${totLabel} in coda` : "vuoto — aggiungi qui i prossimi libri";
    }
    const ppd = yearStats(list);
    const parts = [totLabel];
    if (reading > 0) parts.push(`${reading} in lettura`);
    if (ppd) parts.push(`${ppd} pag/giorno`);
    return parts.join(" · ");
  }

  if (loading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>La Mia Libreria</h1>
          <p className="subtitle">Carico gli scaffali…</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <img className="app-logo" src="/logo.png" alt="La Mia Libreria" />
          <div className="header-titles">
            <h1>La Mia Libreria</h1>
            <p className="subtitle">
              {hasFirebaseConfig
                ? "Sincronizzata su tutti i dispositivi"
                : "Modalità locale (Firebase non ancora configurato)"}
            </p>
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="v">{stats.tot}</span>
            <span className="l">Libri totali</span>
          </div>
          <div className="stat">
            <span className="v">{stats.finished}</span>
            <span className="l">Letti</span>
          </div>
          <div className="stat">
            <span className="v">{stats.reading}</span>
            <span className="l">In lettura</span>
          </div>
          <div className="stat">
            <span className="v">{stats.pages.toLocaleString("it-IT")}</span>
            <span className="l">Pagine</span>
          </div>
          <div className="stat">
            <span className="v">
              €{stats.cost.toFixed(2).replace(".", ",")}
            </span>
            <span className="l">Spesi</span>
          </div>
        </div>

        {error && (
          <p style={{ color: "#f4b4a8", marginTop: 14 }}>
            Errore caricamento: {error}
          </p>
        )}
      </header>

      <nav className="year-nav">
        <button
          onClick={() =>
            document.getElementById("shelf-0")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Da leggere
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() =>
              document
                .getElementById(`shelf-${y}`)
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {y}
          </button>
        ))}
      </nav>

      {/* "Da leggere" shelf — year 0 is reserved for wishlist */}
      <div id="shelf-0">
        <Shelf
          label="Da leggere"
          sublabel={sublabelFor(0, grouped.get(0) || [])}
          books={(grouped.get(0) || []).slice().sort(shelfSort)}
          onPick={setSelected}
          onAdd={() => handleAdd(0)}
          collapsed={!!collapsed[0]}
          onToggleCollapse={() => toggleShelf(0)}
        />
      </div>

      {years.map((y) => (
        <div key={y} id={`shelf-${y}`}>
          <Shelf
            label={`${y}`}
            sublabel={sublabelFor(y, grouped.get(y) || [])}
            books={(grouped.get(y) || []).slice().sort(shelfSort)}
            onPick={setSelected}
            collapsed={!!collapsed[y]}
            onToggleCollapse={() => toggleShelf(y)}
          />
        </div>
      ))}

      {selected && (
        <BookDetail
          book={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
