import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOqBPg6riLBuFo1fpRewQegnnbYl2d6fE",
  authDomain: "loteria-navidad-b196c.firebaseapp.com",
  projectId: "loteria-navidad-b196c",
  storageBucket: "loteria-navidad-b196c.firebasestorage.app",
  messagingSenderId: "283129919915",
  appId: "1:283129919915:web:b933a20e916b834be27aee"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// GitHub Pages sends a Cross-Origin-Opener-Policy header that breaks signInWithPopup, use redirect instead
getRedirectResult(auth).catch(error => console.error("Error al completar el inicio de sesión", error.code, error.message));

// Each signed-in user owns exactly one document: loteria/{uid}
window.LoteriaAuth = {
  signIn: () => signInWithRedirect(auth, provider),
  signOut: () => signOut(auth),
  onChange: callback => onAuthStateChanged(auth, callback),
  loadData: async uid => {
    const snap = await getDoc(doc(db, "loteria", uid));
    return snap.exists() ? snap.data().payload : null;
  },
  saveData: async (uid, payload) => {
    await setDoc(doc(db, "loteria", uid), { payload, updatedAt: Date.now() });
  }
};
