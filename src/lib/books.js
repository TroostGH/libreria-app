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

export async function fetchAllBooks() {
  if (hasFirebaseConfig && db) {
    const snap = await getDocs(collection(db, "books"));
    if (snap.empty) {
      // Seed Firestore the first time the app is loaded against an empty project.
      await seedFirestore();
      const snap2 = await getDocs(collection(db, "books"));
      return snap2.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  // Local fallback
  let local = readLocal();
  if (!local) {
    local = seedBooks;
    writeLocal(local);
  }
  return local;
}

export async function saveBook(book) {
  if (hasFirebaseConfig && db) {
    const ref = doc(db, "books", book.id);
    await setDoc(ref, book, { merge: true });
    return book;
  }
  // Local fallback
  const all = readLocal() || [];
  const idx = all.findIndex((b) => b.id === book.id);
  if (idx >= 0) all[idx] = book;
  else all.push(book);
  writeLocal(all);
  return book;
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
  for (const b of seedBooks) {
    batch.set(doc(db, "books", b.id), b);
  }
  await batch.commit();
}

// Reset the local cache back to the bundled JSON (handy during dev).
export function resetLocal() {
  writeLocal(seedBooks);
}
