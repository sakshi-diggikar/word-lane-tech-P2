document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById("loginPassword");
    const togglePassword = document.querySelector(".toggle-password");
    const loginOverlay = document.getElementById("loginOverlay");

    // Show login overlay on page load
    loginOverlay.style.display = 'flex';

    // Toggle password visibility
    togglePassword.addEventListener("click", function () {
        const icon = this.querySelector("i");
        const isPassword = passwordInput.type === "emp_password_hash";
        passwordInput.type = isPassword ? "text" : "emp_password_hash";
        icon.classList.toggle("bx-show", !isPassword);
        icon.classList.toggle("bx-hide", isPassword);
    });

    // Submit login form
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const user_id = document.getElementById("loginId").value.trim();
        const password = passwordInput.value.trim();

        if (!user_id || !password) {
            showToast("Please fill in all fields.");
            return;
        }

        showToast("Logging in...");

        try {
            const res = await fetch("http://localhost:3000/api/auth/login" , {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, password }),
            });

            const data = await res.json();

            if (data.success) {
                showToast(`Welcome, ${data.name}`);
                sessionStorage.setItem("emp_user_id", data.emp_user_id);
                setTimeout(() => {
                    hideLoginOverlay();
                    window.location.href = data.redirect;
                }, 1500); // Delay for smooth transition
            } else {
                showToast(data.message);
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            showToast("Server error. Please try again.");
        }
    });

    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "show";
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 2800);
    }

    function hideLoginOverlay() {
        loginOverlay.style.opacity = '0';
        loginOverlay.style.visibility = 'hidden';
        // Optional: fully remove after transition
        // setTimeout(() => loginOverlay.style.display = 'none', 400);
    }
});
