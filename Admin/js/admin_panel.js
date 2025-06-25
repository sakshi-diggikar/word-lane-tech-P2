// Admin Panel JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Sample data for admin activities
    const adminActivities = [
        {
            userId: "ADM001",
            userName: "John Smith",
            activity: "User registration approved",
            time: "2 minutes ago",
            status: "admin",
            department: "IT"
        },
        {
            userId: "ADM002",
            userName: "Sarah Johnson",
            activity: "System configuration updated",
            time: "5 minutes ago",
            status: "system",
            department: "Admin"
        },
        {
            userId: "ADM003",
            userName: "Mike Wilson",
            activity: "New project created",
            time: "10 minutes ago",
            status: "admin",
            department: "Development"
        },
        {
            userId: "ADM004",
            userName: "Lisa Brown",
            activity: "Database backup completed",
            time: "15 minutes ago",
            status: "system",
            department: "IT"
        },
        {
            userId: "ADM005",
            userName: "David Lee",
            activity: "User permissions modified",
            time: "20 minutes ago",
            status: "admin",
            department: "HR"
        }
    ];

    // Function to populate the table
    function populateTable(data) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        data.forEach(activity => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${activity.userId}</td>
                <td>${activity.userName}</td>
                <td>${activity.activity}</td>
                <td>${activity.time}</td>
                <td><span class="status-badge ${activity.status}">${activity.status}</span></td>
                <td>${activity.department}</td>
                <td>
                    <button class="action-btn view">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Search functionality
    const searchInput = document.getElementById("activity-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = adminActivities.filter(activity => 
                activity.userName.toLowerCase().includes(searchTerm) ||
                activity.activity.toLowerCase().includes(searchTerm) ||
                activity.department.toLowerCase().includes(searchTerm)
            );
            populateTable(filteredData);
        });
    }

    // Sort functionality
    const sortIcon = document.getElementById("sort-icon");
    const sortOptions = document.getElementById("sort-options");
    
    if (sortIcon && sortOptions) {
        sortIcon.addEventListener("click", () => {
            sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!sortIcon.contains(e.target) && !sortOptions.contains(e.target)) {
                sortOptions.style.display = "none";
            }
        });

        // Sort options click handlers
        const sortOptionElements = sortOptions.querySelectorAll("div");
        sortOptionElements.forEach(option => {
            option.addEventListener("click", () => {
                const filter = option.getAttribute("data-filter");
                let filteredData = adminActivities;

                if (filter !== "all") {
                    filteredData = adminActivities.filter(activity => 
                        activity.status === filter
                    );
                }

                populateTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Initialize table
    populateTable(adminActivities);

    // Update insights data
    function updateInsights() {
        const totalUsers = document.querySelector(".insights .sales h1");
        const activeProjects = document.querySelector(".insights .expenses h1");
        const totalRevenue = document.querySelector(".insights .income h1");

        if (totalUsers) totalUsers.textContent = "1,250";
        if (activeProjects) activeProjects.textContent = "45";
        if (totalRevenue) totalRevenue.textContent = "₹2.5M";
    }

    updateInsights();

    // Simulate real-time updates
    setInterval(() => {
        // Add new activity every 30 seconds
        const newActivity = {
            userId: "ADM" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            userName: "Admin User",
            activity: "System activity logged",
            time: "Just now",
            status: Math.random() > 0.5 ? "admin" : "system",
            department: "IT"
        };
        
        adminActivities.unshift(newActivity);
        if (adminActivities.length > 10) {
            adminActivities.pop();
        }
        
        populateTable(adminActivities);
    }, 30000);
}); 