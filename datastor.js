// document.getElementById('signup-form').addEventListener('submit', async (e) => {
//     e.preventDefault();

//     // Get form values
//     const fullName = e.target.fullname.value.trim();
//     const email = e.target.emailid.value.trim();
//     const phoneNumber = e.target.phonenumber.value.trim();
//     const password = e.target.password.value;
//     const confirmPassword = e.target.confirmPassword.value;

//     // Simple check for matching passwords
//     if (password !== confirmPassword) {
//         alert("Passwords do not match!");
//         return;
//     }

//     try {
//         // 1. Create user with email and password (Firebase Auth)
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         // 2. Save extra user info in Firestore under 'users/{uid}'
//         await setDoc(doc(db, "users", user.uid), {
//             fullName: fullName,
//             email: email,
//             phoneNumber: phoneNumber,
//             createdAt: new Date().toISOString()
//         });

//         alert("Account created successfully!");
//         // Optionally, redirect or reset form here
//         e.target.reset();

//     } catch (error) {
//         console.error("Error during signup:", error);
//         alert(error.message);
//     }
// });
  