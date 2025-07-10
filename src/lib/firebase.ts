// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC34QJk3hVYnm-GH676R4dq-MnEk-h8pQs",
  authDomain: "oxygen-c1775.firebaseapp.com",
  projectId: "oxygen-c1775",
  storageBucket: "oxygen-c1775.firebasestorage.app",
  messagingSenderId: "641362796373",
  appId: "1:641362796373:web:0a2b2480368447779199dc",
  measurementId: "G-TYJ42HKGQJ"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, analytics };
