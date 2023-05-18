// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZeFrH4jAGzhVkU4uIczu3y7qOTmw6BxI",
  authDomain: "notes-app-a2e91.firebaseapp.com",
  projectId: "notes-app-a2e91",
  storageBucket: "notes-app-a2e91.appspot.com",
  messagingSenderId: "925693117119",
  appId: "1:925693117119:web:5a617e5c2751e7ea063c0a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)