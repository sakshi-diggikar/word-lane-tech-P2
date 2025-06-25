// Admin Panel JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // --- Admin Activities Table (old logic) ---
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

    // --- Main Content: Assigned Tasks Table (from admin_main.js) ---
    const assignedTasks = [
        {
            projectId: "PRJ001",
            projectName: "Website Redesign",
            taskName: "UI Overhaul",
            dueOn: "2024-07-10",
            status: "active",
            employeeName: "Alice"
        },
        {
            projectId: "PRJ002",
            projectName: "Mobile App Launch",
            taskName: "API Integration",
            dueOn: "2024-07-15",
            status: "delayed",
            employeeName: "Bob"
        },
        {
            projectId: "PRJ003",
            projectName: "Cloud Migration",
            taskName: "Server Setup",
            dueOn: "2024-07-20",
            status: "completed",
            employeeName: "Charlie"
        },
        {
            projectId: "PRJ004",
            projectName: "Security Audit",
            taskName: "Vulnerability Scan",
            dueOn: "2024-07-25",
            status: "active",
            employeeName: "Diana"
        },
        {
            projectId: "PRJ005",
            projectName: "API Integration",
            taskName: "Endpoint Testing",
            dueOn: "2024-07-30",
            status: "active",
            employeeName: "Eve"
        }
    ];

    // --- Main Content Table Logic ---
    function populateAssignedTasksTable(data) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) {
            const table = document.getElementById("recent-orders--table");
            const newTbody = document.createElement("tbody");
            table.appendChild(newTbody);
            return populateAssignedTasksTable(data);
        }
        tbody.innerHTML = "";
        data.forEach(task => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${task.projectId}</td>
                <td>${task.projectName}</td>
                <td>${task.taskName}</td>
                <td>${task.dueOn}</td>
                <td><span class="status-badge ${task.status}">${task.status}</span></td>
                <td>${task.employeeName}</td>
                <td><button class="action-btn view">View</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Main Content: Search
    const searchInput = document.getElementById("task-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = assignedTasks.filter(task =>
                task.taskName.toLowerCase().includes(searchTerm) ||
                task.projectName.toLowerCase().includes(searchTerm) ||
                task.projectId.toLowerCase().includes(searchTerm) ||
                task.employeeName.toLowerCase().includes(searchTerm)
            );
            populateAssignedTasksTable(filteredData);
        });
    }

    // Main Content: Sort
    const sortIcon = document.getElementById("sort-icon");
    const sortOptions = document.getElementById("sort-options");
    if (sortIcon && sortOptions) {
        sortIcon.addEventListener("click", () => {
            sortOptions.style.display = sortOptions.style.display === "block" ? "none" : "block";
        });
        document.addEventListener("click", (e) => {
            if (!sortIcon.contains(e.target) && !sortOptions.contains(e.target)) {
                sortOptions.style.display = "none";
            }
        });
        const sortOptionElements = sortOptions.querySelectorAll("div");
        sortOptionElements.forEach(option => {
            option.addEventListener("click", () => {
                const filter = option.getAttribute("data-filter");
                let filteredData = assignedTasks;
                if (filter !== "all") {
                    filteredData = assignedTasks.filter(task => task.status === filter);
                }
                populateAssignedTasksTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Main Content: Initialize table
    populateAssignedTasksTable(assignedTasks);

    // Main Content: Update insights
    function updateInsights() {
        const totalTask = document.querySelector(".insights .sales h1");
        const totalProjects = document.querySelector(".insights .expenses h1");
        const completedTasks = document.querySelector(".insights .income h1");
        if (totalTask) totalTask.textContent = "1000";
        if (totalProjects) totalProjects.textContent = "450";
        if (completedTasks) completedTasks.textContent = "700";
    }
    updateInsights();

    // Main Content: Action button click
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("action-btn")) {
            const row = e.target.closest("tr");
            const taskName = row.cells[2].textContent;
            alert(`Viewing details for task: ${taskName}`);
        }
    });

    // --- (Optional) Keep old admin activities logic for other tables if needed ---
    // (No changes to the old admin activities logic, but you can remove it if not needed)
}); 