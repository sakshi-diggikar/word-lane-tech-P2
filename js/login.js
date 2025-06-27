document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById("loginPassword");
    const togglePassword = document.querySelector(".toggle-password");
    const loginOverlay = document.getElementById("loginOverlay"); // Get the overlay element

    // Initially, ensure the login overlay is visible when the page loads
    // This assumes the user needs to log in first to see the dashboard.
    // If the dashboard is visible by default and login is a modal,
    // you'd control its visibility differently (e.g., via a button click).
    loginOverlay.style.display = 'flex'; // Or 'block' depending on your CSS display property

    // Toggle eye icon
    togglePassword.addEventListener("click", function () {
        const icon = this.querySelector("i");
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        icon.classList.toggle("bx-show", !isPassword);
        icon.classList.toggle("bx-hide", isPassword);
    });

    // Form submit handling
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        const userId = document.getElementById("loginId").value.trim();
        const password = passwordInput.value.trim();

        if (!userId || !password) {
            showToast("Please fill in all fields.");
            return; // Stop execution if fields are empty
        }

        // Simulate a slight delay for "login processing" feedback
        showToast("Logging in...");

        setTimeout(() => {
            // In a real application, you'd send userId and password to a server
            // and handle the response here.
            // For this example, we're using the prefix logic.

            let redirectPath = '';
            if (userId.startsWith("AD")) {
                redirectPath = "Admin/admin_panel.html";
            } else if (userId.startsWith("EMP")) {
                redirectPath = "Employee/employee_panel.html";
            } else if (userId.startsWith("HR")) {
                redirectPath = "HR/hr_panel.html";
            } else if (userId.startsWith("MGR")) {
                redirectPath = "Manager/manager_panel.html";
            } else {
                showToast("Invalid User ID format or credentials.");
                return; // Stop if user ID format is invalid
            }

            // If login is successful (based on our simple logic)
            // Hide the login overlay and redirect
            hideLoginOverlay();
            // In a real app, you might load content dynamically or redirect
            window.location.href = redirectPath; // Redirect to the appropriate panel

        }, 1500); // Simulate network delay for login
    });

    /**
     * Displays a toast message.
     * @param {string} message - The message to display in the toast.
     */
    function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.className = "show"; // Add 'show' class to make it visible

        // Remove 'show' class after a delay to hide the toast
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 2800); // Adjusted duration to match CSS transition (2.8 seconds)
    }

    /**
     * Hides the login overlay with a fade-out effect.
     */
    function hideLoginOverlay() {
        loginOverlay.style.opacity = '0';
        loginOverlay.style.visibility = 'hidden';
        // Optional: Remove the overlay from DOM after transition if not needed anymore
        // setTimeout(() => {
        //     loginOverlay.style.display = 'none';
        // }, 400); // Match CSS transition duration
    }

    // If you want the login overlay to appear only when a "Login" button is clicked
    // on the dashboard, you would initially set loginOverlay.style.display = 'none';
    // and then have a button that calls loginOverlay.style.display = 'flex';
    // For now, it's set to be visible on page load as per typical login page behavior.
});
