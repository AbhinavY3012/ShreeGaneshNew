import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth"; // Commented out - not using auth yet
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBBUf1eOJCpiTFq-8z_Ch-MqHN6A99KrfY",
    authDomain: "food-suppliers-cd833.firebaseapp.com",
    projectId: "food-suppliers-cd833",
    storageBucket: "food-suppliers-cd833.firebasestorage.app",
    messagingSenderId: "913195417907",
    appId: "1:913195417907:web:9d30a9127b365980967e46",
    measurementId: "G-VZET3K4VBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
// const auth = getAuth(app); // Commented out - not using auth yet
const storage = getStorage(app);

export { app, analytics, db, storage };
// export { auth }; // Uncomment when you need authentication
