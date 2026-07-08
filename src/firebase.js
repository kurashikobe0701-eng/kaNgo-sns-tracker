import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9Vg4I3Z50meLDgHs3PukRqUtJrxEbuFM",
  authDomain: "kango-sns-tracker.firebaseapp.com",
  projectId: "kango-sns-tracker",
  storageBucket: "kango-sns-tracker.firebasestorage.app",
  messagingSenderId: "441955862225",
  appId: "1:441955862225:web:daa556ccd7179c203e27f0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
