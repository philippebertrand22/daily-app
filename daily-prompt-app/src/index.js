import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase once
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function
async function testFirestoreConnection() {
  console.log("Testing Firestore connection...");
  
  const testData = {
    message: "Connection test successful",
    timestamp: new Date().toISOString(),
    appVersion: process.env.REACT_APP_VERSION || "1.0.0"
  };

  const docRef = await addDoc(collection(db, "test"), testData);
  console.log("✅ Firestore connection successful! Document written with ID:", docRef.id);
  return true;
}

// Actually call the test function
testFirestoreConnection()
  .then(() => {
    console.log("App initialized with working Firestore connection");
  })
  .catch(error => {
    console.error("Firestore connection failed:", error);
  });

// Render the app regardless of Firebase connection
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Export Firebase instances if needed elsewhere
export { app, db };