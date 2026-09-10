import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

function getClientApp() {
  return getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);
}

// Inicialização preguiçosa: evita chamar o SDK do Firebase (e falhar com
// chaves ausentes) durante a renderização no servidor ou o build.
export function getClientAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getClientApp());
  return cachedAuth;
}

export function getClientDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getClientApp());
  return cachedDb;
}
