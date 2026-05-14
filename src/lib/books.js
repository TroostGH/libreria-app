// Single source of truth for working with the books collection.
// - In local mode (no Firebase config) data lives in localStorage,
//   seeded from src/data/books.json the first time.
// - With Firebase config the same operations target the "books"
//   collection in Firestore.

import { db, hasFirebaseConfig } from "../firebase.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import seedBooks from "../data/books.json";

const LS_KEY = "libreria.books.v1";

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Lettura localStorage fallita:", e);
    return null;
  }
}

function writeLocal(books) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(books));
  } catch (e) {
    console.warn("Scrittura localStorage fallita:", e);
  }
}

export function emptyBook(year = new Date().getFullYear()) {
  return {
    id: `book-${Date.now()}`,
    year,
    title: "",
    author: "",
    status: "toread",
    rate: 0,
    percentCompleted: 0,
    cost: 0,
    pages: 0,
    dateStart: "",
    dateEnd: "",
    daysReading: 0,
    pagesPerDay: 0,
    quotes: [],
    concepts: [],
    nozioni: [],
    giudizio: "",
  };
}

// Status normalisation rules.
//
// "abandoned" and "finished" are sticky — the user chose them explicitly, so
// we don't downgrade a legacy 2020 finished book to "toread" just because the
// dates are missing. "reading" without a dateStart is inconsistent and gets
// demoted to "toread". Everything else (toread, empty) follows the strict
// date rule the user asked for:
//   - no dates                  -> toread (Da leggere shelf, year=0)
//   - only dateStart            -> reading
//   - dateStart and dateEnd     -> finished
//
// Shelf year follows the resulting status: toread → 0; otherwise year of
// dateStart (fallback dateEnd, fallback existing year).
export function deriveStatusAndYear(book) {
  const hasStart = !!(book.dateStart && String(book.dateStart).trim());
  const hasEnd = !!(book.dateEnd && String(book.dateEnd).trim());
  const next = { ...book };
  const s = next.status || "";

  if (s === "abandoned" || s === "finished") {
    // sticky
  } else if (s === "reading" && !hasStart) {
    next.status = "toread";
  } else {
    // empty, toread, or reading-with-dates → derive purely from dates
    if (!hasStart && !hasEnd) next.status = "toread";
    else if (hasStart && !hasEnd) next.status = "reading";
    else next.status = "finished";
  }

  if (next.status === "toread") {
    next.year = 0;
  } else {
    const ref = next.dateStart || next.dateEnd || "";
    const m = /^(\d{4})/.exec(ref);
    if (m) next.year = Number(m[1]);
    // else keep existing year (e.g. abandoned/finished without dates)
  }
  return next;
}

// Lightweight helper: keep the user's chosen status but recompute the shelf
// year. Used by the status dropdown so picking a status manually doesn't get
// fought by the date-based auto-derivation.
export function deriveYearOnly(book) {
  const next = { ...book };
  if (next.status === "toread") {
    next.year = 0;
  } else {
    const ref = next.dateStart || next.dateEnd || "";
    const m = /^(\d{4})/.exec(ref);
    if (m) next.year = Number(m[1]);
  }
  return next;
}

export async function fetchAllBooks({ force = false } = {}) {
  if (hasFirebaseConfig && db) {
    const snap = await getDocs(collection(db, "books"));
    if (snap.empty || force) {
      // Either the collection is empty (first load) or the caller asked
      // for a forced re-seed (e.g. ?seed=force in the URL).
      await seedFirestore();
      const snap2 = await getDocs(collection(db, "books"));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  // Local fallback
  if (force) {
    writeLocal(seedBooks);
    return seedBooks;
  }
  let local = readLocal();
  if (!local) {
    local = seedBooks;
    writeLocal(local);
  }
  return local;
}

export async function saveBook(book) {
  // Always re-align the shelf year with the current status + dates, but DO
  // NOT overwrite a manually-picked status (the UI is the source of truth
  // for status — it already runs deriveStatusAndYear when dates change).
  const finalBook = deriveYearOnly(book);

  if (hasFirebaseConfig && db) {
    const ref = doc(db, "books", finalBook.id);
    await setDoc(ref, finalBook, { merge: true });
    return finalBook;
  }
  // Local fallback
  const all = readLocal() || [];
  const idx = all.findIndex((b) => b.id === finalBook.id);
  if (idx >= 0) all[idx] = finalBook;
  else all.push(finalBook);
  writeLocal(all);
  return finalBook;
}

export async function deleteBook(bookId) {
  if (hasFirebaseConfig && db) {
    await deleteDoc(doc(db, "books", bookId));
    return;
  }
  const all = (readLocal() || []).filter((b) => b.id !== bookId);
  writeLocal(all);
}

async function seedFirestore() {
  const batch = writeBatch(db);
  for (const raw of seedBooks) {
    // Normalise each book through the same status/shelf rules used in the UI
    // so the seed dataset always lands on the correct shelf.
    const b = deriveStatusAndYear({ ...raw });
    batch.set(doc(db, "books", b.id), b);
  }
  await batch.commit();
}

// Reset the local cache back to the bundled JSON (handy during dev).
export function resetLocal() {
  writeLocal(seedBooks);
}
