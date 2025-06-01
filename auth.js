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
        console.error("Firebase Error:", error);  // <--- place here
        alert("Error: " + error.message);         // <--- place here
    }
});

