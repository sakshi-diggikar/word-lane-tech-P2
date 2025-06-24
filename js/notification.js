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

    // Create an audio element for the notification sound
    const notificationSound = new Audio('./audio/notification.mp3'); // Adjust path if necessary
    notificationSound.volume = 0.5; // Set volume (0.0 to 1.0)

    // Function to update the notification count display
    function updateNotificationCount() {
        notificationCount.textContent = unreadNotificationCount;
        notificationCount.style.display = unreadNotificationCount > 0 ? "flex" : "none";
    }

    // Function to add a notification to the drawer
    function addNotificationToDrawer(notification) {
        const noNotificationsMessage = notificationsList.querySelector(".no-notifications");
        if (noNotificationsMessage) {
            noNotificationsMessage.remove();
        }

        const notificationItem = document.createElement("div");
        notificationItem.classList.add("notification-item");
        notificationItem.innerHTML = `
        <p><b>${notification.sender}</b> ${notification.message}</p>
        <small class="text-muted">${notification.time}</small>
      `;
        notificationsList.prepend(notificationItem); // Add to the top
    }

    // Function to show a temporary notification
    function showTemporaryNotification(notification) {
        const tempNotificationDiv = document.createElement("div");
        tempNotificationDiv.classList.add("temp-notification");
        tempNotificationDiv.innerHTML = `
        <p><b>${notification.sender}</b> ${notification.message}</p>
        <small>${notification.time}</small>
      `;
        document.body.appendChild(tempNotificationDiv);

        // Play the notification sound
        notificationSound.play().catch(error => {
            // Catch potential autoplay errors (e.g., user hasn't interacted with the page yet)
            console.warn("Notification sound autoplay prevented:", error);
            // You might want to show a message to the user or provide a button to enable sound
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
        unreadNotificationCount++;
        updateNotificationCount();
        addNotificationToDrawer(notification);
        showTemporaryNotification(notification);
    }

    // Event listener for the notification bell icon
    if (notificationBellIcon) {
        notificationBellIcon.addEventListener("click", () => {
            notificationDrawer.classList.toggle("active");
            if (notificationDrawer.classList.contains("active")) {
                // When drawer opens, mark all as read
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

    // Simulate new notifications
    let notificationCounter = 0;
    const dummyNotifications = [
        { sender: "Alice", message: "assigned you a new task: 'Review Q4 Report'.", time: "Just now" },
        { sender: "Bob", message: "completed 'Project Alpha Phase 1'.", time: "2 minutes ago" },
        { sender: "HR Dept", message: "Your leave request for 15th Nov has been approved.", time: "5 minutes ago" },
        { sender: "System", message: "Server maintenance scheduled for tonight.", time: "10 minutes ago" },
        { sender: "Charlie", message: "sent you a message in the team chat.", time: "15 minutes ago" },
    ];

    setInterval(() => {
        const newNotification = dummyNotifications[notificationCounter % dummyNotifications.length];
        // Clone to ensure unique time for simulation
        const notificationToSend = { ...newNotification, time: new Date().toLocaleTimeString() };
        handleNewNotification(notificationToSend);
        notificationCounter++;
    }, 15000); // Simulate a new notification every 15 seconds

    // Initial update of notification count
    updateNotificationCount();

    // Sidebar & theme toggle (common for both index.html and admin_analytics.html)
    menuBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "block";
    });

    closeBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "none";
    });

    themeToggler?.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme-variables");
        themeToggler
            .querySelector("span:nth-child(1)")
            ?.classList.toggle("active");
        themeToggler
            .querySelector("span:nth-child(2)")
            ?.classList.toggle("active");
    });
});
  