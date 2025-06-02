// auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDwPZMjSfLLZBKTIYBoe9O2DdQLYaMJkT0",
    authDomain: "word-lane-tech-p2.firebaseapp.com",
    projectId: "word-lane-tech-p2",
    storageBucket: "word-lane-tech-p2.firebasestorage.app",
    messagingSenderId: "248611364200",
    appId: "1:248611364200:web:c55a7446ae8e7861880add"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const googleBtn = document.querySelector('.google-btn');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

// Utility function to show toast message
function showMessage(message, color = "#f44336") {
    const existing = document.getElementById("message-box");
    if (existing) existing.remove();

    const msgBox = document.createElement("div");
    msgBox.id = "message-box";
    msgBox.innerText = message;
    Object.assign(msgBox.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: color,
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: '9999',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(msgBox);
}

// Redirect helper
function redirectTo(url, delay = 2000) {
    setTimeout(() => {
        window.location.href = url;
    }, delay);
}

// Toggle password visibility
export function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.setAttribute("fill", isPassword ? "#333" : "#666");
}

// Sign-up form logic
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = e.target.fullname.value.trim();
        const email = e.target.emailid.value.trim();
        const phoneNumber = e.target.phonenumber.value.trim();
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (!fullName || !email || !phoneNumber) {
            showMessage("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName,
                email,
                phone: phoneNumber,
                createdAt: serverTimestamp()
            });

            showMessage("Account created successfully!", "#4CAF50");
            e.target.reset();
            redirectTo("homepage.html");

        } catch (error) {
            console.error("Firebase Error:", error);
            if (error.code === 'auth/email-already-in-use') {
                showMessage("This account already exists. Redirecting to login...");
                redirectTo("login.html");
            } else {
                showMessage("Error: " + error.message);
            }
        }
    });
}

// Login form logic
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            showMessage("Login successful!", "#4CAF50");
            redirectTo("homepage.html", 1500);

        } catch (error) {
            console.error("Login Error:", error);

            let msg = "Login failed.";
            if (error.code === 'auth/user-not-found') msg = "No account found with this email.";
            else if (error.code === 'auth/wrong-password') msg = "Incorrect password.";
            else if (error.code === 'auth/invalid-email') msg = "Invalid email format.";

            showMessage(msg);
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // 1. Check if user exists in Firestore (your user base)
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // 2. User doesn't exist in Firestore — delete from Firebase Auth
                await user.delete();

                showMessage("Google account not registered. Redirecting to signup...", "#FF9800");
                redirectTo("signup.html");
            } else {
                showMessage("Welcome back!", "#4CAF50");
                redirectTo("homepage.html");
            }

        } catch (error) {
            console.error("Google Sign-In Error:", error);
            showMessage("Google Sign-In failed. " + error.message);
        }
    });
}

