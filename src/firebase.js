// Firebase setup.
//
// La config qui sotto è il "web app config" di Firebase. È pubblica per
// design (Firebase la usa per identificare il progetto, NON per controllare
// l'accesso). La sicurezza dei dati passa per le regole di Firestore
// (firestore.rules).
//
// Riferimento ufficiale: https://firebase.google.com/docs/projects/api-keys

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYsgzClBRMEhJGCK9ChwgslQXEeWbjtKU",
  authDomain: "libreria-app-41b47.firebaseapp.com",
  projectId: "libreria-app-41b47",
  storageBucket: "libreria-app-41b47.firebasestorage.app",
  messagingSenderId: "506076458519",
  appId: "1:506076458519:web:2455e12da984e0f26c7652",
};

export const hasFirebaseConfig = true;

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
