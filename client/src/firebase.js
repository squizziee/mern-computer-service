import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyAHKJGBupVfDuU14W_nqi7kiDkidymJcU4",
    authDomain: "mern-app-ccdfc.firebaseapp.com",
    projectId: "mern-app-ccdfc",
    storageBucket: "mern-app-ccdfc.firebasestorage.app",
    messagingSenderId: "83144000059",
    appId: "1:83144000059:web:da376e8646562c78cc521e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
    .then(() => {
        // Persistence set successfully
    })
    .catch((error) => {
        console.error('Error setting persistence:', error);
    });

export default app;