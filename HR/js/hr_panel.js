// HR Panel JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Sample data for leave applications
    const leaveApplications = [
        {
            employeeId: "EMP001",
            employeeName: "Alice Johnson",
            leaveType: "sick",
            fromDate: "2024-01-15",
            toDate: "2024-01-17",
            status: "pending"
        },
        {
            employeeId: "EMP002",
            employeeName: "Bob Smith",
            leaveType: "annual",
            fromDate: "2024-01-20",
            toDate: "2024-01-25",
            status: "approved"
        },
        {
            employeeId: "EMP003",
            employeeName: "Carol Davis",
            leaveType: "casual",
            fromDate: "2024-01-18",
            toDate: "2024-01-18",
            status: "rejected"
        },
        {
            employeeId: "EMP004",
            employeeName: "David Wilson",
            leaveType: "maternity",
            fromDate: "2024-02-01",
            toDate: "2024-05-01",
            status: "pending"
        },
        {
            employeeId: "EMP005",
            employeeName: "Eva Brown",
            leaveType: "sick",
            fromDate: "2024-01-22",
            toDate: "2024-01-24",
            status: "approved"
        }
    ];

    // Function to populate the table
    function populateTable(data) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
        
        data.forEach(application => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${application.employeeId}</td>
                <td>${application.employeeName}</td>
                <td><span class="leave-type-badge ${application.leaveType}">${application.leaveType}</span></td>
                <td>${application.fromDate}</td>
                <td>${application.toDate}</td>
                <td><span class="status-badge ${application.status}">${application.status}</span></td>
                <td>
                    ${application.status === 'pending' ? 
                        `<button class="action-btn approve">Approve</button>
                         <button class="action-btn reject">Reject</button>` :
                        `<button class="action-btn view">View</button>`
                    }
                </td>
            `;
            tbody.appendChild(row);
        });

        // Add event listeners for action buttons
        addActionButtonListeners();
    }

    // Function to add event listeners for action buttons
    function addActionButtonListeners() {
        const approveButtons = document.querySelectorAll(".action-btn.approve");
        const rejectButtons = document.querySelectorAll(".action-btn.reject");
        const viewButtons = document.querySelectorAll(".action-btn.view");

        approveButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const row = e.target.closest("tr");
                const employeeId = row.cells[0].textContent;
                const employeeName = row.cells[1].textContent;
                
                if (confirm(`Approve leave application for ${employeeName}?`)) {
                    const application = leaveApplications.find(app => app.employeeId === employeeId);
                    if (application) {
                        application.status = "approved";
                        populateTable(leaveApplications);
                    }
                }
            });
        });

        rejectButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const row = e.target.closest("tr");
                const employeeId = row.cells[0].textContent;
                const employeeName = row.cells[1].textContent;
                
                if (confirm(`Reject leave application for ${employeeName}?`)) {
                    const application = leaveApplications.find(app => app.employeeId === employeeId);
                    if (application) {
                        application.status = "rejected";
                        populateTable(leaveApplications);
                    }
                }
            });
        });

        viewButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const row = e.target.closest("tr");
                const employeeId = row.cells[0].textContent;
                alert(`Viewing details for leave application: ${employeeId}`);
            });
        });
    }

    // Search functionality
    const searchInput = document.getElementById("application-search");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = leaveApplications.filter(application => 
                application.employeeName.toLowerCase().includes(searchTerm) ||
                application.employeeId.toLowerCase().includes(searchTerm) ||
                application.leaveType.toLowerCase().includes(searchTerm)
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
                let filteredData = leaveApplications;

                if (filter !== "all") {
                    filteredData = leaveApplications.filter(application => 
                        application.status === filter
                    );
                }

                populateTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Initialize table
    populateTable(leaveApplications);

    // Update insights data
    function updateInsights() {
        const totalEmployees = document.querySelector(".insights .sales h1");
        const leaveRequests = document.querySelector(".insights .expenses h1");
        const attendanceRate = document.querySelector(".insights .income h1");

        if (totalEmployees) totalEmployees.textContent = "850";
        if (leaveRequests) leaveRequests.textContent = "23";
        if (attendanceRate) attendanceRate.textContent = "94%";
    }

    updateInsights();

    // Simulate new leave applications
    setInterval(() => {
        const newApplication = {
            employeeId: "EMP" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            employeeName: "New Employee",
            leaveType: ["sick", "casual", "annual", "maternity"][Math.floor(Math.random() * 4)],
            fromDate: "2024-01-" + (Math.floor(Math.random() * 10) + 20),
            toDate: "2024-01-" + (Math.floor(Math.random() * 10) + 25),
            status: "pending"
        };
        
        leaveApplications.unshift(newApplication);
        if (leaveApplications.length > 10) {
            leaveApplications.pop();
        }
        
        populateTable(leaveApplications);
    }, 60000);
}); 