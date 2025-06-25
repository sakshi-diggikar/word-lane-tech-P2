// Employee Panel JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Sample data for employee tasks
    const employeeTasks = [
        {
            taskId: "TASK001",
            taskName: "Frontend Development",
            project: "E-commerce Platform",
            dueDate: "2024-01-15",
            status: "in-progress",
            priority: "high"
        },
        {
            taskId: "TASK002",
            taskName: "API Integration",
            project: "Mobile App",
            dueDate: "2024-01-20",
            status: "pending",
            priority: "medium"
        },
        {
            taskId: "TASK003",
            taskName: "Database Optimization",
            project: "CRM System",
            dueDate: "2024-01-18",
            status: "completed",
            priority: "low"
        },
        {
            taskId: "TASK004",
            taskName: "UI/UX Design",
            project: "Dashboard Redesign",
            dueDate: "2024-01-25",
            status: "pending",
            priority: "high"
        },
        {
            taskId: "TASK005",
            taskName: "Testing & QA",
            project: "Payment Gateway",
            dueDate: "2024-01-22",
            status: "in-progress",
            priority: "medium"
        }
    ];

    // Function to populate the table
    function populateTable(data) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        data.forEach(task => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${task.taskId}</td>
                <td>${task.taskName}</td>
                <td>${task.project}</td>
                <td>${task.dueDate}</td>
                <td><span class="status-badge ${task.status}">${task.status}</span></td>
                <td><span class="priority-badge ${task.priority}">${task.priority}</span></td>
                <td>
                    <button class="action-btn view">View</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Search functionality
    const searchInput = document.getElementById("task-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = employeeTasks.filter(task => 
                task.taskName.toLowerCase().includes(searchTerm) ||
                task.project.toLowerCase().includes(searchTerm) ||
                task.taskId.toLowerCase().includes(searchTerm)
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
                let filteredData = employeeTasks;

                if (filter !== "all") {
                    filteredData = employeeTasks.filter(task => 
                        task.status === filter
                    );
                }

                populateTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Initialize table
    populateTable(employeeTasks);

    // Update insights data
    function updateInsights() {
        const myTasks = document.querySelector(".insights .sales h1");
        const workHours = document.querySelector(".insights .expenses h1");
        const performance = document.querySelector(".insights .income h1");

        if (myTasks) myTasks.textContent = "15";
        if (workHours) workHours.textContent = "42";
        if (performance) performance.textContent = "92%";
    }

    updateInsights();

    // Simulate task updates
    setInterval(() => {
        // Randomly update task status
        const randomTask = employeeTasks[Math.floor(Math.random() * employeeTasks.length)];
        const statuses = ["pending", "in-progress", "completed"];
        randomTask.status = statuses[Math.floor(Math.random() * statuses.length)];
        
        populateTable(employeeTasks);
    }, 45000);

    // Add click handlers for action buttons
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("action-btn")) {
            const row = e.target.closest("tr");
            const taskId = row.cells[0].textContent;
            alert(`Viewing details for task: ${taskId}`);
        }
    });
}); 