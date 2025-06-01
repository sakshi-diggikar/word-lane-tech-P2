// auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js';
// Your Firebase config (replace with your own from Firebase console)
// Your web app's Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDwPZMjSfLLZBKTIYBoe9O2DdQLYaMJkT0",
    authDomain: "word-lane-tech-p2.firebaseapp.com",
    projectId: "word-lane-tech-p2",
    storageBucket: "word-lane-tech-p2.firebasestorage.app",
    messagingSenderId: "248611364200",
    appId: "1:248611364200:web:c55a7446ae8e7861880add"
  };

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Function to toggle password visibility
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
        alert("Passwords do not match!");
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName,
            email,
            phone: phoneNumber,
            createdAt: new Date()
        });

        alert("Account created successfully!");
        e.target.reset();

        // Redirect to homepage after signup
        window.location.href = "homepage.html";

    } catch (error) {
        console.error("Firebase Error:", error);

        // Remove any existing message boxes (optional cleanup)
        const existingBox = document.getElementById("message-box");
        if (existingBox) existingBox.remove();

        const messageBox = document.createElement('div');
        messageBox.id = "message-box";
        messageBox.innerText =
            error.code === 'auth/email-already-in-use'
                ? "This account already exists. Redirecting to login page..."
                : "Error: " + error.message;

        messageBox.style.position = 'fixed';
        messageBox.style.top = '20px';
        messageBox.style.left = '50%';
        messageBox.style.transform = 'translateX(-50%)';
        messageBox.style.backgroundColor = '#f44336';
        messageBox.style.color = '#fff';
        messageBox.style.padding = '12px 24px';
        messageBox.style.borderRadius = '8px';
        messageBox.style.zIndex = '9999';
        messageBox.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
        document.body.appendChild(messageBox);

        if (error.code === 'auth/email-already-in-use') {
            // Redirect silently after 2 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        }
    }
    
});

