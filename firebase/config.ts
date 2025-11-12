import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// =================================================================================
// TODO: Replace the following with your actual Firebase project configuration.
// You can find this in your Firebase project settings under "General".
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDRxqlYeIga-BUPOBuEvuspdyIFdwlRDgk",
  authDomain: "gemini-ocr-af44d.firebaseapp.com",
  projectId: "gemini-ocr-af44d",
  storageBucket: "gemini-ocr-af44d.firebasestorage.app",
  messagingSenderId: "77695678375",
  appId: "1:77695678375:web:ec72d44750b9cb74d66882",
  measurementId: "G-55BQD3VEQ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);