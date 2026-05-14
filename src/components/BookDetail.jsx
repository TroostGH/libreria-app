import React, { useEffect, useState } from "react";
import StarRating from "./StarRating.jsx";
import { deriveStatusAndYear } from "../lib/books.js";

const STATUSES = [
  { v: "toread", l: "Da leggere" },
  { v: "reading", l: "In lettura" },
  { v: "finished", l: "Finito" },
  { v: "abandoned", l: "Abbandonato" },
];

export default function BookDetail({ book, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(book);
  const [newQuote, setNewQuote] = useState("");
  const [newConcept, setNewConcept] = useState("");
  const [newNozione, setNewNozione] = useState("");

  useEffect(() => {
    // Esc to close
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function update(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  // When dates change, recompute status+year live (preserving "abandoned").
  function updateDates(patch) {
    setDraft((d) => deriveStatusAndYear({ ...d, ...patch }));
  }

  function save() {
    onSave(draft);
  }

  function pushTo(field, value, setter) {
    const v = value.trim();
    if (!v) return;
    update({ [field]: [...(draft[field] || []), v] });
    setter("");
  }

  function removeAt(field, idx) {
    const next = [...(draft[field] || [])];
    next.splice(idx, 1);
    update({ [field]: next });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="topbar">
          <div>{draft.year ? `SCAFFALE ${draft.year}` : "DA LEGGERE"}</div>
          <div className="actions">
            <button className="btn primary" onClick={save}>
              Salva
            </button>
            <button className="btn danger" onClick={() => onDelete(draft)}>
              Elimina
            </button>
            <button className="btn ghost" onClick={onClose}>
              Chiudi
            </button>
          </div>
        </div>

        <input
          className="book-title-input"
          placeholder="Titolo del libro"
          value={draft.title || ""}
          onChange={(e) => update({ title: e.target.value })}
        />
        <input
          placeholder="Autore"
          value={draft.author || ""}
          onChange={(e) => update({ author: e.target.value })}
        />

        <div className="fields-grid">
          <div className="field">
            <label>Scaffale (auto)</label>
            <div className="value">
              {draft.year && draft.year > 0
                ? draft.year
                : "Da leggere"}
            </div>
          </div>
          <div className="field">
            <label>Status (auto, salvo "Abbandonato")</label>
            <select
              value={draft.status || "toread"}
              onChange={(e) =>
                setDraft((d) => deriveStatusAndYear({ ...d, status: e.target.value }))
              }
            >
              {STATUSES.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Valutazione</label>
            <StarRating
              value={draft.rate || 0}
              onChange={(v) => update({ rate: v })}
            />
          </div>
          <div className="field">
            <label>Pagine</label>
            <input
              type="number"
              value={draft.pages || ""}
              onChange={(e) =>
                update({ pages: e.target.value ? Number(e.target.value) : 0 })
              }
            />
          </div>
          <div className="field">
            <label>Costo €</label>
            <input
              type="number"
              step="0.01"
              value={draft.cost || ""}
              onChange={(e) =>
                update({ cost: e.target.value ? Number(e.target.value) : 0 })
              }
            />
          </div>
          <div className="field">
            <label>Data inizio</label>
            <input
              type="date"
              value={draft.dateStart || ""}
              onChange={(e) => updateDates({ dateStart: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Data fine</label>
            <input
              type="date"
              value={draft.dateEnd || ""}
              onChange={(e) => updateDates({ dateEnd: e.target.value })}
            />
          </div>
          <div className="field">
            <label>% completato</label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.percentCompleted || ""}
              onChange={(e) =>
                update({
                  percentCompleted: e.target.value
                    ? Number(e.target.value)
                    : 0,
                })
              }
            />
          </div>
        </div>

        {/* QUOTES */}
        <div className="section">
          <h3>Frasi migliori ({(draft.quotes || []).length})</h3>
          {(draft.quotes || []).length === 0 && (
            <p className="empty">Nessuna frase ancora. Aggiungi le tue preferite qui sotto.</p>
          )}
          {(draft.quotes || []).map((q, i) => (
            <div key={i} className="item quote">
              {q}
              <button className="remove" onClick={() => removeAt("quotes", i)}>
                ×
              </button>
            </div>
          ))}
          <textarea
            placeholder="Aggiungi una frase…"
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
          />
          <div className="add-row">
            <button
              className="btn"
              onClick={() => pushTo("quotes", newQuote, setNewQuote)}
            >
              + Aggiungi frase
            </button>
          </div>
        </div>

        {/* CONCEPTS */}
        <div className="section">
          <h3>Concetti ({(draft.concepts || []).length})</h3>
          {(draft.concepts || []).length === 0 && (
            <p className="empty">Annota qui i concetti chiave del libro.</p>
          )}
          {(draft.concepts || []).map((q, i) => (
            <div key={i} className="item">
              {q}
              <button className="remove" onClick={() => removeAt("concepts", i)}>
                ×
              </button>
            </div>
          ))}
          <textarea
            placeholder="Aggiungi un concetto…"
            value={newConcept}
            onChange={(e) => setNewConcept(e.target.value)}
          />
          <div className="add-row">
            <button
              className="btn"
              onClick={() => pushTo("concepts", newConcept, setNewConcept)}
            >
              + Aggiungi concetto
            </button>
          </div>
        </div>

        {/* NOZIONI */}
        <div className="section">
          <h3>Nozioni principali ({(draft.nozioni || []).length})</h3>
          {(draft.nozioni || []).length === 0 && (
            <p className="empty">Le nozioni più importanti, una per riga.</p>
          )}
          {(draft.nozioni || []).map((q, i) => (
            <div key={i} className="item">
              {q}
              <button className="remove" onClick={() => removeAt("nozioni", i)}>
                ×
              </button>
            </div>
          ))}
          <textarea
            placeholder="Aggiungi una nozione…"
            value={newNozione}
            onChange={(e) => setNewNozione(e.target.value)}
          />
          <div className="add-row">
            <button
              className="btn"
              onClick={() => pushTo("nozioni", newNozione, setNewNozione)}
            >
              + Aggiungi nozione
            </button>
          </div>
        </div>

        {/* GIUDIZIO */}
        <div className="section">
          <h3>Il tuo giudizio</h3>
          <textarea
            className="giudizio-textarea"
            placeholder="Cosa ne pensi del libro? Cosa ti ha lasciato?"
            value={draft.giudizio || ""}
            onChange={(e) => update({ giudizio: e.target.value })}
          />
        </div>

        <div className="modal-footer">
          <button className="btn primary" onClick={save}>
            Salva modifiche
          </button>
        </div>
      </div>
    </div>
  );
}
