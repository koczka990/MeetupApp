// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCycTIOxymnduU1S-nPwd5VmYgHCV8P9g0",
  authDomain: "meetupapp-7ca47.firebaseapp.com",
  projectId: "meetupapp-7ca47",
  storageBucket: "meetupapp-7ca47.firebasestorage.app",
  messagingSenderId: "780825273555",
  appId: "1:780825273555:web:7e8ef7d1dace737ff0e026",
  measurementId: "G-7PS7L5DB4Z"
};

// Initialize Firebase app and Firestore
let app, db;

function initializeFirebase() {
	// Check if firebase is loaded
	if (!window.firebase || !window.firebase.firestore) {
		console.error('Firebase SDK not loaded.');
		return;
	}
	app = firebase.initializeApp(firebaseConfig);
	db = firebase.firestore();
	window.db = db; // Expose db globally
}

// Expose initializeFirebase for manual or auto init
window.initializeFirebase = initializeFirebase;

// Optionally auto-initialize on load
window.addEventListener('DOMContentLoaded', initializeFirebase);
