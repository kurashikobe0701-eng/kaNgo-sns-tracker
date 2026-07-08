import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKdrW6IJ4tHNnCW00Xlo1rJkXLBwArTv4",
  authDomain: "kango-sns-tracker.firebaseapp.com",
  projectId: "kango-sns-tracker",
  storageBucket: "kango-sns-tracker.firebasestorage.app",
  messagingSenderId: "441955862225",
  appId: "1:441955862225:web:8dde815607e04d403e27f0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
