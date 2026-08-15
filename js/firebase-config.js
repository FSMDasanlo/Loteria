import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
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

// Hash con sal, nunca se guarda la contraseña en texto plano
async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}
function randomSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

window.LoteriaAuth = {
  // Sesión anónima de Firebase, solo para satisfacer las reglas de Firestore (auth != null)
  ready: () => new Promise(resolve => {
    onAuthStateChanged(auth, user => { if (user) resolve(user); });
    signInAnonymously(auth).catch(error => console.error("Error de sesión anónima", error));
  }),
  register: async (nick, password) => {
    const ref = doc(db, "usuarios", nick);
    const existing = await getDoc(ref);
    if (existing.exists()) throw new Error("Ese usuario ya existe, elige otro nombre.");
    const salt = randomSalt();
    const passwordHash = await hashPassword(password, salt);
    await setDoc(ref, { passwordHash, salt, createdAt: Date.now() });
  },
  login: async (nick, password) => {
    const snap = await getDoc(doc(db, "usuarios", nick));
    if (!snap.exists()) throw new Error("Usuario o contraseña incorrectos.");
    const { passwordHash, salt } = snap.data();
    const hash = await hashPassword(password, salt);
    if (hash !== passwordHash) throw new Error("Usuario o contraseña incorrectos.");
  },
  loadData: async nick => {
    const snap = await getDoc(doc(db, "loteria", nick));
    return snap.exists() ? snap.data().payload : null;
  },
  saveData: async (nick, payload) => {
    await setDoc(doc(db, "loteria", nick), { payload, updatedAt: Date.now() });
  }
};
