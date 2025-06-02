// auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';
import { GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDwPZMjSfLLZBKTIYBoe9O2DdQLYaMJkT0",
    authDomain: "word-lane-tech-p2.firebaseapp.com",
    projectId: "word-lane-tech-p2",
    storageBucket: "word-lane-tech-p2.firebasestorage.app",
    messagingSenderId: "248611364200",
    appId: "1:248611364200:web:c55a7446ae8e7861880add"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleBtn = document.querySelector('.google-btn');

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Optional: Save user info to Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                fullName: user.displayName,
                email: user.email,
                phone: user.phoneNumber || '',
                createdAt: new Date()
            });

            showMessage("Login with Google successful!", "#4CAF50");
            setTimeout(() => {
                window.location.href = "homepage.html";
            }, 1500);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            showMessage(`Google Sign-In failed: ${error.message}`);
        }
        
    });
}

// Show toast message
function showMessage(message, color = "#f44336") {
    const existing = document.getElementById("message-box");
    if (existing) existing.remove();

    const msgBox = document.createElement("div");
    msgBox.id = "message-box";
    msgBox.innerText = message;
    msgBox.style.position = 'fixed';
    msgBox.style.top = '20px';
    msgBox.style.left = '50%';
    msgBox.style.transform = 'translateX(-50%)';
    msgBox.style.backgroundColor = color;
    msgBox.style.color = '#fff';
    msgBox.style.padding = '12px 24px';
    msgBox.style.borderRadius = '8px';
    msgBox.style.zIndex = '9999';
    msgBox.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    document.body.appendChild(msgBox);
}

export function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.setAttribute("fill", isPassword ? "#333" : "#666");
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = e.target.fullname.value.trim();
    const email = e.target.emailid.value.trim();
    const phoneNumber = e.target.phonenumber.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

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
            createdAt: new Date()
        });

        showMessage("Account created successfully!", "#4CAF50"); // green
        e.target.reset();

        setTimeout(() => {
            window.location.href = "homepage.html";
        }, 2000);

    } catch (error) {
        console.error("Firebase Error:", error);

        if (error.code === 'auth/email-already-in-use') {
            showMessage("This account already exists. Redirecting to login page...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            showMessage("Error: " + error.message);
        }
    }
});
    // Handle Login Form Submission
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = e.target.email.value.trim();
        const password = e.target.password.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            showMessage("Login successful!", "#4CAF50"); // green

            setTimeout(() => {
                window.location.href = "homepage.html";
            }, 1500);

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

