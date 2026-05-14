# La Mia Libreria

Dashboard personale per visualizzare e annotare i libri letti, anno per anno.

## Stack
- **Vite + React** (UI)
- **Firebase Hosting** (sito statico)
- **Firestore** (libri + note, sincronizzate su tutti i dispositivi)

## Sviluppo locale
```bash
npm install
npm run dev
```
Visita http://127.0.0.1:5173 — senza file `.env.local` l'app gira in **modalità locale** (dati salvati su `localStorage` del browser, partendo dal seed in `src/data/books.json`).

## Collegare Firebase
1. Crea un progetto su https://console.firebase.google.com.
2. Abilita Firestore (modalità "test" per cominciare).
3. Aggiungi una web-app al progetto e copia la config.
4. Crea `.env.local` partendo da `.env.example` e riempi le 6 variabili `VITE_FB_*`.
5. `npm run dev` — al primo caricamento la collezione `books` viene popolata col seed.

## Deploy
```bash
npm install -g firebase-tools  # una sola volta
firebase login                 # una sola volta
firebase use --add             # collega questo repo al progetto Firebase
npm run deploy                 # build + deploy hosting
```
Per pubblicare anche le regole Firestore: `firebase deploy --only firestore:rules`.
