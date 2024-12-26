import { getAuth, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

class FirebaseAuthenticator {
    constructor(app) {
        this.provider = new GoogleAuthProvider();
        this.auth = getAuth(app);
        this.db = getFirestore(app)
    }

    authenticateDefault(email, password) {

    }
}