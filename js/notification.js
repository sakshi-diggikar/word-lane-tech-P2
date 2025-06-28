// notification.js

document.addEventListener("DOMContentLoaded", () => {
    const notificationBellIcon = document.getElementById("notification-bell-icon");
    const notificationCount = document.getElementById("notification-count");
    const notificationDrawer = document.getElementById("notification-drawer");
    const notificationsList = document.getElementById("notifications-list");

    // Common UI elements (sidebar and theme toggler)
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    let notifications = []; // Array to store all notifications
    let unreadNotificationCount = 0;
    let currentUserId = null;

    // Create an audio element for the notification sound
    const notificationSound = new Audio('./audio/notification.mp3'); // Adjust path if necessary
    notificationSound.volume = 0.5; // Set volume (0.0 to 1.0)

    // Function to get current user ID from session
    function getCurrentUserId() {
        // Try to get from localStorage or sessionStorage
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        return user.user_id || user.emp_user_id || user.admin_user_id;
    }

    // Function to update the notification count display
    function updateNotificationCount() {
        if (notificationCount) {
            notificationCount.textContent = unreadNotificationCount;
            notificationCount.style.display = unreadNotificationCount > 0 ? "flex" : "none";
        }
    }

    // Function to add a notification to the drawer
    function addNotificationToDrawer(notification) {
        if (!notificationsList) return;

        const noNotificationsMessage = notificationsList.querySelector(".no-notifications");
        if (noNotificationsMessage) {
            noNotificationsMessage.remove();
        }

        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");
        notificationItem.innerHTML = `
            <p><b>${notification.type}</b> ${notification.message}</p>
            <small class="text-muted">${new Date(notification.created_at).toLocaleString()}</small>
        `;
        
        // Add click handler for notification link
        if (notification.link) {
            notificationItem.style.cursor = 'pointer';
            notificationItem.addEventListener('click', () => {
                window.location.href = notification.link;
            });
        }
        
        notificationsList.prepend(notificationItem); // Add to the top
    }

    // Function to show a temporary notification
    function showTemporaryNotification(notification) {
        const tempNotificationDiv = document.createElement("div");
        tempNotificationDiv.classList.add("temp-notification");
        tempNotificationDiv.innerHTML = `
            <p><b>${notification.type}</b> ${notification.message}</p>
            <small>${new Date(notification.created_at).toLocaleString()}</small>
        `;
        document.body.appendChild(tempNotificationDiv);

        // Play the notification sound
        notificationSound.play().catch(error => {
            // Catch potential autoplay errors (e.g., user hasn't interacted with the page yet)
            console.warn("Notification sound autoplay prevented:", error);
        });

        // Trigger slide-in animation
        setTimeout(() => {
            tempNotificationDiv.classList.add("show");
        }, 10); // Small delay to ensure CSS transition applies

        // Trigger slide-out animation and remove after a few seconds
        setTimeout(() => {
            tempNotificationDiv.classList.remove("show");
            tempNotificationDiv.classList.add("hide");
            tempNotificationDiv.addEventListener("transitionend", () => {
                tempNotificationDiv.remove();
            }, { once: true }); // Remove after transition ends
        }, 5000); // Notification visible for 5 seconds
    }

    // Function to handle new incoming notifications
    function handleNewNotification(notification) {
        notifications.push(notification);
        if (!notification.is_read) {
            unreadNotificationCount++;
        }
        updateNotificationCount();
        addNotificationToDrawer(notification);
        showTemporaryNotification(notification);
    }

    // Function to fetch notifications from the server
    async function fetchNotifications() {
        try {
            const userId = getCurrentUserId();
            if (!userId) return;

            const response = await fetch(`/api/projects/notifications/${userId}`);
            if (response.ok) {
                const serverNotifications = await response.json();
                
                // Clear existing notifications
                notifications = [];
                if (notificationsList) {
                    notificationsList.innerHTML = '';
                }
                
                // Add server notifications
                serverNotifications.forEach(notification => {
                    handleNewNotification(notification);
                });
                
                // Show "no notifications" message if empty
                if (serverNotifications.length === 0 && notificationsList) {
                    notificationsList.innerHTML = '<div class="no-notifications">No notifications yet</div>';
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }

    // Function to mark notification as read
    async function markNotificationAsRead(notificationId) {
        try {
            const response = await fetch(`/api/projects/notifications/mark-read/${notificationId}`, {
                method: 'POST'
            });
            if (response.ok) {
                // Update local state
                const notification = notifications.find(n => n.id === notificationId);
                if (notification && !notification.is_read) {
                    notification.is_read = true;
                    unreadNotificationCount = Math.max(0, unreadNotificationCount - 1);
                    updateNotificationCount();
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    // Event listener for the notification bell icon
    if (notificationBellIcon) {
        notificationBellIcon.addEventListener("click", () => {
            notificationDrawer.classList.toggle("active");
            if (notificationDrawer.classList.contains("active")) {
                // When drawer opens, mark all as read
                notifications.forEach(notification => {
                    if (!notification.is_read) {
                        markNotificationAsRead(notification.id);
                    }
                });
                unreadNotificationCount = 0;
                updateNotificationCount();
            }
        });
    }

    // Close drawer if clicked outside
    document.addEventListener("click", (event) => {
        if (notificationDrawer && notificationBellIcon &&
            !notificationDrawer.contains(event.target) && !notificationBellIcon.contains(event.target)) {
            notificationDrawer.classList.remove("active");
        }
    });

    // Initial load of notifications
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    setInterval(fetchNotifications, 30000);

    // Initial update of notification count
    updateNotificationCount();

    // Sidebar & theme toggle (common for both index.html and admin_analytics.html)
    menuBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "block";
    });

    closeBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "none";
    });

    // themeToggler?.addEventListener("click", () => {
    //     document.body.classList.toggle("dark-theme-variables");
    //     themeToggler
    //         .querySelector("span:nth-child(1)")
    //         ?.classList.toggle("active");
    //     themeToggler
    //         .querySelector("span:nth-child(2)")
    //         ?.classList.toggle("active");
    // });
});
  