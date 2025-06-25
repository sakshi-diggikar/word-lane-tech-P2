// Dummy data for HR dashboard
const HR_DASHBOARD_DATA = {
    totalLeaveApplications: 25,
    totalTasksCompleted: 150,
    totalTasksPending: 30,
    assignedTasks: [
        { project_id: "P001", project_name: "Website Redesign", task_name: "Design Mockups", due_on: "2025-07-10", status: "pending", employee_name: "Alice Johnson" },
        { project_id: "P002", project_name: "Mobile App Dev", task_name: "Implement Login", due_on: "2025-07-05", status: "completed", employee_name: "Bob Smith" },
        { project_id: "P003", project_name: "CRM Integration", task_name: "API Setup", due_on: "2025-07-15", status: "active", employee_name: "Charlie Brown" },
        { project_id: "P004", project_name: "Marketing Campaign", task_name: "Content Creation", due_on: "2025-07-20", status: "delayed", employee_name: "Diana Prince" },
        { project_id: "P005", project_name: "Database Migration", task_name: "Schema Design", due_on: "2025-07-08", status: "pending", employee_name: "Ethan Hunt" },
        { project_id: "P006", project_name: "HR Portal", task_name: "Attendance Module", due_on: "2025-07-25", status: "active", employee_name: "Fiona Gallagher" },
        { project_id: "P007", project_name: "Security Audit", task_name: "Vulnerability Scan", due_on: "2025-07-12", status: "completed", employee_name: "Grace Hopper" },
        { project_id: "P008", project_name: "Client Onboarding", task_name: "Documentation", due_on: "2025-07-18", status: "pending", employee_name: "Harry Potter" },
        { project_id: "P009", project_name: "Internal Tool", task_name: "UI/UX Review", due_on: "2025-07-03", status: "delayed", employee_name: "Ivy League" },
        { project_id: "P010", project_name: "Performance Review", task_name: "Data Collection", due_on: "2025-07-30", status: "active", employee_name: "Jack Sparrow" },
    ]
};

// === UTILITY FUNCTIONS ===

const getStatusBadge = (status) => {
    const cls = status.toLowerCase();
    return `<span class="status-badge ${cls}">${status}</span>`;
};

const buildAssignedTasksTable = () => {
    const tbody = document.querySelector("#recent-orders--table tbody");
    if (!tbody) return;

    let bodyContent = '';
    HR_DASHBOARD_DATA.assignedTasks.forEach((task, index) => {
        bodyContent += `
            <tr data-index="${index}">
                <td>${task.project_id}</td>
                <td>${task.project_name}</td>
                <td>${task.task_name}</td>
                <td>${task.due_on ? new Date(task.due_on).toLocaleDateString() : '-'}</td>
                <td>${getStatusBadge(task.status)}</td>
                <td>${task.employee_name}</td>
                <td class="primary view-details" style="cursor: pointer;">Details</td>
            </tr>
        `;
    });

    tbody.innerHTML = bodyContent;

    // Attach click handlers after rendering
    document.querySelectorAll('.view-details').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const task = HR_DASHBOARD_DATA.assignedTasks[i];
            showTaskDetails(task);
        });
    });
};


// Function to show modal
function showTaskDetails(task) {
    document.getElementById('modal-project-id').textContent = task.project_id;
    document.getElementById('modal-project-name').textContent = task.project_name;
    document.getElementById('modal-task-name').textContent = task.task_name;
    document.getElementById('modal-due-on').textContent = new Date(task.due_on).toLocaleDateString();
    document.getElementById('modal-status').textContent = task.status;
    document.getElementById('modal-employee-name').textContent = task.employee_name;

    document.getElementById('taskDetailsModal').style.display = 'flex';
}

const applyTaskFilter = (filter) => {
    const rows = document.querySelectorAll("#recent-orders--table tbody tr");
    rows.forEach(row => {
        const statusText = row.querySelector(".status-badge")?.textContent.toLowerCase() || "";
        if (filter === 'all' || statusText.includes(filter.toLowerCase())) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
};

const searchInput = document.getElementById("task-search");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll("#recent-orders--table tbody tr");

        rows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            row.style.display = rowText.includes(searchValue) ? "" : "none";
        });
    });
}

// === MAIN INITIALIZER ===
document.addEventListener("DOMContentLoaded", () => {
    // 1. Update Dashboard Cards
    document.getElementById('total-leave-applications').textContent = HR_DASHBOARD_DATA.totalLeaveApplications;
    document.getElementById('total-tasks-completed').textContent = `Total Completed Tasks: ${HR_DASHBOARD_DATA.totalTasksCompleted}`;
    document.getElementById('total-tasks-pending').textContent = `Total Pending Tasks: ${HR_DASHBOARD_DATA.totalTasksPending}`;

    // 2. Build Assigned Task Table
    buildAssignedTasksTable();

    // 3. Filter dropdown logic
    const sortIcon = document.getElementById("sort-icon");
    const sortOptions = document.getElementById("sort-options");

    if (sortIcon && sortOptions) {
        sortIcon.addEventListener("click", () => {
            sortOptions.style.display =
                sortOptions.style.display === "block" ? "none" : "block";
        });

        sortOptions.querySelectorAll("div").forEach((option) => {
            option.addEventListener("click", () => {
                const filter = option.getAttribute("data-filter");
                applyTaskFilter(filter);
                sortOptions.style.display = "none";
            });
        });

        document.addEventListener("click", (e) => {
            if (
                !sortIcon.contains(e.target) &&
                !sortOptions.contains(e.target)
            ) {
                sortOptions.style.display = "none";
            }
        });
    }

    // 4. Sidebar & theme toggle (basic functionality, assuming no theme toggler in HR dashboard)
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");

    menuBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "block";
    });

    closeBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "none";
    });

    //THEME TOGGLER
    const toggler = document.querySelector('.theme-toggler');
    const lightIcon = toggler.querySelectorAll('span')[0];
    const darkIcon = toggler.querySelectorAll('span')[1];

    toggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
        lightIcon.classList.toggle('active');
        darkIcon.classList.toggle('active');
    });

    //MODAL CLOSE
    document.getElementById('closeTaskModal')?.addEventListener('click', () => {
        document.getElementById('taskDetailsModal').style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('taskDetailsModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    const modal = document.getElementById('taskDetailsModal');

    document.getElementById('closeTaskModal')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    document.getElementById('closeTaskModalBtn')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });


    document.getElementById('total-projects').textContent = HR_DASHBOARD_DATA.assignedTasks.length;


    function showToast(message = "Message Sent!") {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    document.querySelector('.btn-send')?.addEventListener('click', () => {
        const comment = document.getElementById('task-comment').value.trim();
        const modal = document.getElementById('taskDetailsModal');

        if (comment) {
            showToast("Message sent successfully!");

            // Reset textarea
            document.getElementById('task-comment').value = "";

            // Close modal
            modal.style.display = "none";

            // Enable page scroll
            document.body.style.overflow = "";
        } else {
            showToast("Please enter a comment before sending.");
        }
    });




});
