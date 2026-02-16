/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgXTKrh9yvK6agFy7YJgbH5fqMIdjl4YY",
  authDomain: "tailandi-menu.firebaseapp.com",
  databaseURL: "https://tailandi-menu-default-rtdb.firebaseio.com",
  projectId: "tailandi-menu",
  storageBucket: "tailandi-menu.firebasestorage.app",
  messagingSenderId: "147672302900",
  appId: "1:147672302900:web:48502f145c5d9d1d825161"
};

const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
