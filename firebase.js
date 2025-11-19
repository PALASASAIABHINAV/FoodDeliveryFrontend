// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIRE_BASE_API_KEY,
  authDomain: "food-project-f8934.firebaseapp.com",
  projectId: "food-project-f8934",
  storageBucket: "food-project-f8934.firebasestorage.app",
  messagingSenderId: "713521766174",
  appId: "1:713521766174:web:cc634f5507519e5b6d330f"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };