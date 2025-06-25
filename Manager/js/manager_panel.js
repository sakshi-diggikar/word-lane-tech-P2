// Manager Panel JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Sample data for team projects
    const teamProjects = [
        {
            projectId: "PRJ001",
            projectName: "Website Redesign",
            status: "active",
            teamLead: "Alice",
            dueDate: "2024-07-10"
        },
        {
            projectId: "PRJ002",
            projectName: "Mobile App Launch",
            status: "completed",
            teamLead: "Bob",
            dueDate: "2024-06-15"
        },
        {
            projectId: "PRJ003",
            projectName: "Cloud Migration",
            status: "active",
            teamLead: "Charlie",
            dueDate: "2024-08-01"
        },
        {
            projectId: "PRJ004",
            projectName: "Security Audit",
            status: "completed",
            teamLead: "Diana",
            dueDate: "2024-05-30"
        },
        {
            projectId: "PRJ005",
            projectName: "API Integration",
            status: "active",
            teamLead: "Eve",
            dueDate: "2024-07-20"
        }
    ];

    // Function to populate the table
    function populateTable(data) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) {
            // If tbody doesn't exist, create it
            const table = document.getElementById("recent-orders--table");
            const newTbody = document.createElement("tbody");
            table.appendChild(newTbody);
            return populateTable(data);
        }
        tbody.innerHTML = "";
        data.forEach(project => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${project.projectId}</td>
                <td>${project.projectName}</td>
                <td><span class="status-badge ${project.status}">${project.status}</span></td>
                <td>${project.teamLead}</td>
                <td>${project.dueDate}</td>
                <td><button class="action-btn view">View</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Search functionality
    const searchInput = document.getElementById("project-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = teamProjects.filter(project =>
                project.projectName.toLowerCase().includes(searchTerm) ||
                project.projectId.toLowerCase().includes(searchTerm) ||
                project.teamLead.toLowerCase().includes(searchTerm)
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
        document.addEventListener("click", (e) => {
            if (!sortIcon.contains(e.target) && !sortOptions.contains(e.target)) {
                sortOptions.style.display = "none";
            }
        });
        const sortOptionElements = sortOptions.querySelectorAll("div");
        sortOptionElements.forEach(option => {
            option.addEventListener("click", () => {
                const filter = option.getAttribute("data-filter");
                let filteredData = teamProjects;
                if (filter !== "all") {
                    filteredData = teamProjects.filter(project => project.status === filter);
                }
                populateTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Initialize table
    populateTable(teamProjects);

    // Update insights data
    function updateInsights() {
        const teamMembers = document.querySelector(".insights .sales h1");
        const activeProjects = document.querySelector(".insights .expenses h1");
        const tasksCompleted = document.querySelector(".insights .income h1");
        if (teamMembers) teamMembers.textContent = "32";
        if (activeProjects) activeProjects.textContent = "7";
        if (tasksCompleted) tasksCompleted.textContent = "120";
    }
    updateInsights();

    // Add click handlers for action buttons
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("action-btn")) {
            const row = e.target.closest("tr");
            const projectId = row.cells[0].textContent;
            alert(`Viewing details for project: ${projectId}`);
        }
    });
}); 