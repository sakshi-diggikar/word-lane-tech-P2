// forgot.js
import { auth } from './auth.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js';

document.getElementById('reset-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    alert("A password reset link has been sent to your email.");
  } catch (error) {
    console.error("Reset Error:", error.message);
    alert("Error: " + error.message);
  }
});
