// js/common.js

function setupCommonEventListeners() {
    // Sidebar & theme toggle
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("aside #close-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            const aside = document.querySelector("aside");
            if (aside) {
                aside.style.display = "block";
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            const aside = document.querySelector("aside");
            if (aside) {
                aside.style.display = "none";
            }
        });
    }

    if (themeToggler) {
        themeToggler.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme-variables");
            themeToggler.querySelector("span:nth-child(1)")?.classList.toggle("active");
            themeToggler.querySelector("span:nth-child(2)")?.classList.toggle("active");
        });
    }
}

// Ensure the function is called when the DOM is ready on pages that don't have their own listener.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCommonEventListeners);
} else {
    // DOMContentLoaded has already fired
    setupCommonEventListeners();
} 