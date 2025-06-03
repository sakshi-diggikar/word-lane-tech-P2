window.onload = () => {
    const username = localStorage.getItem('username'); // Get from localStorage

    if (username) {
        document.getElementById('username').textContent = username;
        const sidebarUsername = document.getElementById('sidebar-username');
        if (sidebarUsername) sidebarUsername.textContent = username;
    } else {
        // No username found, redirect to login
        window.location.href = 'login.html';
    }

    // Sidebar toggle
    const profileToggle = document.querySelector('.profile-dropdown');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    profileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Sidebar item active logic
    const items = document.querySelectorAll('#sidebar ul li');
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }
};
