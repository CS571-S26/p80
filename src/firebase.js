import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARoWzXWpLo8i8qnZOyoQZobfm2362157M",
  authDomain: "coy-project-80.firebaseapp.com",
  projectId: "coy-project-80",
  storageBucket: "coy-project-80.firebasestorage.app",
  messagingSenderId: "103615159320",
  appId: "1:103615159320:web:6d4b5415dfb0e505d9376d",
  measurementId: "G-7BZSEQHTE4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
