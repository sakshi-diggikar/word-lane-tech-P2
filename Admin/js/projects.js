// Elements ref
const createProjectBtn = document.getElementById("create-project-btn");
const createTeamBtn = document.getElementById("create-team-btn");
const backToTeamsBtn = document.getElementById("back-to-teams-btn");
const teamCardsContainer = document.getElementById("team-cards");
const projectCardsContainer = document.getElementById("project-cards");

const projectModal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalForm = document.getElementById("modal-form");
const inputTeamName = document.getElementById("input-team-name");
const inputTeamDesc = document.getElementById("input-team-desc");
const inputLeaderId = document.getElementById("input-leader-id");
const leaderIdSuggestions = document.getElementById("leader-id-suggestions");
const inputPriority = document.getElementById("input-priority");
const inputName = document.getElementById("input-name");
const inputDescription = document.getElementById("input-description");
const inputClient = document.getElementById("input-client");
const inputStartDate = document.getElementById("input-startdate");
const inputDeadline = document.getElementById("input-deadline");
const closeModalBtn = document.getElementById("close-modal");
const modalCloseIcon = document.getElementById("modal-close");

const sectionTitle = document.getElementById("section-title");

const breadcrumb = document.getElementById("breadcrumb");
const breadcrumbProject = document.getElementById("breadcrumb-project");
const breadcrumbSubproject = document.getElementById("breadcrumb-subproject");
const breadcrumbCurrent = document.getElementById("breadcrumb-current");

const teamsView = document.getElementById("teams-view");
const projectsView = document.getElementById("projects-view");
const tasksView = document.getElementById("tasks-view");
const subtasksView = document.getElementById("subtasks-view");

const taskProjectTitle = document.getElementById("task-project-title");
const priorityFieldWrapper = document.getElementById("priority-field-wrapper");
const createTaskBtn = document.getElementById("create-task-btn");
const taskCardsContainer = document.getElementById("task-cards");
const inputTaskName = document.getElementById("input-task-name");
const inputTaskPriority = document.getElementById("input-task-priority");
const taskPriorityFieldWrapper = document.getElementById("task-priority-field-wrapper");
const inputTaskEmpid = document.getElementById("input-task-empid");
const inputTaskDesc = document.getElementById("input-task-desc");
const inputTaskDeadline = document.getElementById("input-task-deadline");

const subtaskCardsContainer = document.getElementById("subtask-cards");
const subtaskPriorityFieldWrapper = document.getElementById("subtask-priority-field-wrapper");
const inputSubtaskPriority = document.getElementById("input-subtask-priority");
const inputSubtaskAttachment = document.getElementById("input-subtask-attachment");
const createSubtaskBtn = document.getElementById("create-subtask-btn");
const subtaskProjectTitle = document.getElementById("subtask-project-title");
const inputSubtaskName = document.getElementById("input-subtask-name");
const inputSubtaskDesc = document.getElementById("input-subtask-desc");
const inputSubtaskEmpid = document.getElementById("input-subtask-empid");
const inputSubtaskDeadline = document.getElementById("input-subtask-deadline");

const backProjectsBtn = document.getElementById("back-projects-btn");
const backSubprojectBtn = document.getElementById("back-subproject-btn");
const backTasksBtn = document.getElementById("back-tasks-btn");

const subtaskDetailsModal = document.getElementById("subtask-details-modal");
const projectDetailsModal = document.getElementById("project-details-modal");
const taskDetailsModal = document.getElementById("task-details-modal");

// Data structure: teams array loaded from backend
let teams = [];

// Example employee list
const employees = [
    { id: "101", name: "Alice" },
    { id: "102", name: "Bob" },
    { id: "103", name: "Charlie" },
    { id: "104", name: "David" },
    { id: "105", name: "Eva" }
];

// Current navigation state
let currentTeam = null;
let currentProject = null;
let currentTask = null;

// Get admin user ID from session storage
function getAdminUserId() {
    return sessionStorage.getItem("emp_user_id");
}

// Load teams from backend
async function loadTeams() {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        console.error("No admin user ID found");
        return;
    }

    try {
        const response = await fetch(`/api/projects/teams/${adminUserId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        teams = data;
        renderTeams();
    } catch (error) {
        console.error("Failed to load teams:", error);
        showNotification("Failed to load teams", "error");
    }
}

// Show notification function
function showNotification(message, type = "success") {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    if (type === "success") {
        notification.style.background = "#28a745";
    } else if (type === "error") {
        notification.style.background = "#dc3545";
    } else {
        notification.style.background = "#17a2b8";
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = "translateX(0)";
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Format date/time
function formatDateTime(date) {
    if (!date) return '';
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function toFlatpickrString(date) {
    if (!date) return '';
    if (typeof date === 'string') date = new Date(date);
    // Pad with leading zeros
    const pad = n => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Add a modal for team details if not present
if (!document.getElementById('team-details-modal')) {
    const modal = document.createElement('div');
    modal.id = 'team-details-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '2000';
    modal.style.background = 'rgba(0,0,0,0.45)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.innerHTML = `
                <div class="modal-content" style="max-width:500px;width:96vw;padding:2rem 2.5rem;position:relative;border-radius:1.2rem;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,0.18);">
                    <span class="material-icons-sharp close-icon" id="close-team-details" style="position:absolute;top:12px;right:12px;cursor:pointer;font-size:1.7rem;color:#7380ec;">close</span>
                    <div id="team-details-content"></div>
                </div>
            `;
    document.body.appendChild(modal);
}
// Always set up the close handlers after modal is in DOM
const teamDetailsModal = document.getElementById('team-details-modal');
const closeTeamDetailsBtn = document.getElementById('close-team-details');
if (closeTeamDetailsBtn) {
    closeTeamDetailsBtn.onclick = function (e) {
        e.preventDefault();
        teamDetailsModal.style.display = 'none';
    };
}
teamDetailsModal.onclick = function (e) {
    if (e.target === teamDetailsModal) teamDetailsModal.style.display = 'none';
};

function showTeamDetails(team) {
    const modal = document.getElementById('team-details-modal');
    const content = document.getElementById('team-details-content');
    content.innerHTML = `
    <div style="margin-bottom: 2rem;">
        <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0.5rem;">${team.team_name}</h2>
    </div>
    <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
        <h3 style="color:#363949;margin-bottom:0.8rem;">Team Details</h3>
        <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${team.description || 'No description provided.'}</p>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
            <strong style="color:#363949;">Created:</strong>
            <span style="color:#677483;">${team.createdAt ? formatDateTime(team.createdAt) : 'N/A'}</span>
            <strong style="color:#363949;">Projects:</strong>
            <span style="color:#677483;">${team.projects ? team.projects.length : 0}</span>
            <strong style="color:#363949;">Leader:</strong>
            <span style="color:#677483;">
                ${
                    team.leaderId
                        ? (() => {
                            const emp = employees.find(e => e.id === team.leaderId);
                            return emp
                                ? `${emp.name} (${emp.id})`
                                : team.leaderId;
                        })()
                        : 'N/A'
                }
            </span>
        </div>
    </div>
    <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;">
        <h3 style="color:#363949;margin-bottom:0.8rem;">Members</h3>
        <div style="color:#677483;">(Members info can be added here)</div>
    </div>
    <div style="margin-top:2rem;display:flex;justify-content:center;align-items:center;">
        <button id="update-team-btn" style="background:#7380ec;color:#fff;padding:0.5em 1.2em;border-radius:0.5em;border:none;font-size:1em;cursor:pointer;min-width:120px;">Update Team</button>
    </div>
`;
    modal.style.display = 'flex';

    // Add update button handler
    content.querySelector('#update-team-btn').onclick = function () {
        showModal('team', team); // Pass the team object for update
        setTimeout(() => {
            inputTeamName.value = team.name || '';
            inputTeamDesc.value = team.description || '';
            // Change heading and button
            modalTitle.textContent = 'Update Team';
            document.getElementById('create-btn').textContent = 'Update';
        }, 100);
        modal.style.display = 'none';
    };
}
// createTeamCard function to generate team card HTML
function createTeamCard(team, onOpen) {
    const card = document.createElement("div");
    card.classList.add("project-card");
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Team: ${team.team_name}, description: ${team.team_description || 'No details'}`);

    let desc = team.team_description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }
    
    card.innerHTML = `
    <div class="project-header">
        <h3 style="font-size:1.25rem;">${team.team_name}</h3>
        <span class="material-icons-sharp three-dots" tabindex="0" aria-haspopup="true" aria-label="Team options menu" style="margin-left:auto;">more_vert</span>
        <div class="dropdown-menu" role="menu">
            <button class="route-btn" role="menuitem">Route</button>
            <button class="archive-btn" role="menuitem">Archive</button>
            <button class="delete-btn" role="menuitem">Delete</button>
        </div>
    </div>
    <div class="project-details" title="${desc.replace(/"/g, '&quot;')}">${descShort.replace(/\n/g, '<br>')}</div>
    <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
        <b>Leader:</b>
        ${team.leader_name ? `${team.leader_name} (${team.team_leader_id})` : 'N/A'}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div></div>
        <div class="avatar-stack" style="display:flex;align-items:center;">
            <span style="margin-left:8px;font-weight:600;color:#7380ec;font-size:1.1em;">
                ${team.project_count || 0}
            </span>
        </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;margin-top:0.4em;position:relative;">
        <span style="font-size:0.97em;color:#7d8da1;margin-bottom:0.1em;">${team.team_created_at ? formatDateTime(new Date(team.team_created_at)) : 'N/A'}</span>
    </div>
`;

    // Dropdown menu toggle and actions (Route, Archive, Delete)
    const dots = card.querySelector(".three-dots");
    const dropdown = card.querySelector(".dropdown-menu");
    dots.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            if (menu !== dropdown) menu.classList.remove("show");
        });
        dropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => dropdown.classList.remove("show"));
    card.querySelector(".route-btn").addEventListener("click", () => {
        if (onOpen) onOpen(team);
        dropdown.classList.remove("show");
    });
    card.querySelector(".archive-btn").addEventListener("click", () => {
        alert(`Team "${team.team_name}" archived.`);
        dropdown.classList.remove("show");
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete team "${team.team_name}"?`)) {
            // TODO: Add backend API call to delete team
            teams = teams.filter(t => t !== team);
            renderTeams();
        }
        dropdown.classList.remove("show");
    });

    // Add details button at bottom right below date/time
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'View Details';
    detailsButton.style.position = 'absolute';
    detailsButton.style.right = '20px';
    detailsButton.style.bottom = '8px';
    detailsButton.style.marginTop = '0';
    detailsButton.style.alignSelf = 'flex-end';
    card.style.position = 'relative';
    card.appendChild(detailsButton);

    // Handle card click for navigation only
    card.addEventListener("click", function (e) {
        if (e.target.closest('.dropdown-menu') ||
            e.target.classList.contains('three-dots') ||
            e.target.classList.contains('details-btn')) {
            return;
        }
        onOpen(team);
    });

    // Handle details button click
    detailsButton.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showTeamDetails(team);
    });

    return card;
}

// Create project card element
function createProjectCard(project, onOpen) {
    const card = document.createElement("div");
    card.classList.add("project-card");
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Project: ${project.name}, client: ${project.client || 'N/A'}`);

    // Truncate description to 2 lines (approx 160 chars)
    let priority = project.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    let desc = project.description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Status calculation
    let status = project.status || 'Pending';
    const now = new Date();
    if (project.deadline && status !== 'Completed') {
        if (now > project.deadline) status = 'Delayed';
    }

    // Progress bar (tasks completed / total)
    let progress = 0;
    if (project.tasks && project.tasks.length > 0) {
        const completed = project.tasks.filter(t => t.completed).length;
        progress = Math.round((completed / project.tasks.length) * 100);
    } else {
        progress = project.progress || 0;
    }

    card.innerHTML = `
                <div class="project-header">
                    <h3 style="font-size:1.25rem;">${project.name}</h3>
                    <span class="priority-label" style="margin-left:auto;padding:2px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;align-self:center;">
                        ${priority}
                    </span>
                    <span class="material-icons-sharp three-dots" tabindex="0" aria-haspopup="true" aria-label="Project options menu" style="margin-left:8px;">more_vert</span>
                    <div class="dropdown-menu" role="menu">
                        <button class="route-btn" role="menuitem">Route</button>
                        <button class="archive-btn" role="menuitem">Archive</button>
                        <button class="delete-btn" role="menuitem">Delete</button>
                    </div>
                </div>
                <div class="project-details" title="${desc.replace(/"/g, '&quot;')}" style="margin-bottom:0.4em;">${descShort.replace(/\n/g, '<br>')}</div>
                <div class="project-client" style="color:#7380ec;font-weight:600;margin-bottom:0.5em;">
                    Client: ${project.client ? project.client : 'N/A'}
                </div>
                <div class="project-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:0.2em;">
                    <div class="project-dates" style="display:flex;flex-direction:column;align-items:flex-start;">
                        <span title="Start date" style="font-size:0.97em;color:#7d8da1;"><b>Start:</b> ${project.startdate ? formatDateTime(project.startdate) : 'N/A'}</span>
                        <span title="Due date" style="font-size:0.97em;color:#7d8da1;margin-top:0.3em;"><b>Due:</b> ${project.deadline ? formatDateTime(project.deadline) : 'N/A'}</span>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                    <div></div>
                    <div class="task-avatars" style="display:flex;align-items:center;gap:0.3em;">
                        <div class="avatar-stack" style="display:flex;align-items:center;">
                            ${(project.tasks || []).slice(0, 3).map((t, i) => `
                                <span class="avatar-dot" style="
                                    display:inline-block;
                                    width:26px;height:26px;
                                    border-radius:50%;
                                    background:${['#7380ec', '#41f1b6', '#ffbb55'][i % 3]};
                                    border:2px solid #fff;
                                    margin-left:-10px;
                                    z-index:${10 - i};
                                    box-shadow:0 1px 4px rgba(0,0,0,0.07);
                                " title="${t.name}"></span>
                            `).join('')}
                        </div>
                        <span style="margin-left:8px;font-weight:600;color:#7380ec;font-size:1.1em;">
                            ${project.tasks ? project.tasks.length : 0}
                        </span>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                        <div style="width:${progress}%;background:#7380ec;height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
                    <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                        ${status}
                    </span>
                    <span style="font-size:0.97em;color:#7d8da1;text-align:right;">
                        ${project.createdAt ? formatDateTime(project.createdAt) : ''}
                    </span>
                </div>
            `;

    // Dropdown menu toggle
    const dots = card.querySelector(".three-dots");
    const dropdown = card.querySelector(".dropdown-menu");

    dots.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            if (menu !== dropdown) menu.classList.remove("show");
        });
        dropdown.classList.toggle("show");
    });

    // Only add this ONCE globally, not per card
    if (!window._dropdownGlobalHandlerAdded) {
        document.addEventListener("click", function (e) {
            document.querySelectorAll(".dropdown-menu").forEach(menu => {
                menu.classList.remove("show");
            });
        });
        window._dropdownGlobalHandlerAdded = true;
    }

    // Archive button
    card.querySelector(".archive-btn").addEventListener("click", () => {
        alert(`Project "${project.name}" archived.`);
        dropdown.classList.remove("show");
    });

    // Delete button
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete project "${project.name}"?`)) {
            currentTeam.projects = currentTeam.projects.filter(p => p !== project);
            renderProjects();
        }
        dropdown.classList.remove("show");
    });

    // Add details button
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'View Details';
    card.appendChild(detailsButton);

    // Handle details button click separately
    detailsButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Prevent card click/navigation
        showProjectDetails(project); // Only show details
    });

    // Handle card click for navigation only
    card.addEventListener("click", function (e) {
        // Don't navigate if clicking on dropdown, three-dots, or details button
        if (
            e.target.closest('.dropdown-menu') ||
            e.target.classList.contains('three-dots') ||
            e.target.classList.contains('details-btn')
        ) {
            return;
        }
        // Only navigate
        onOpen(project);
    });

    return card;
}

// Create task card element
function createTaskCard(task, onOpen) {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Task: ${task.name}, details: ${task.details || 'No details'}`);

    // Truncate description to 2 lines
    let desc = task.details || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Priority color
    let priority = task.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';


    // Status calculation
    let status = task.status || 'Pending';
    const now = new Date();
    if (task.deadline && status !== 'Completed') {
        if (now > task.deadline) status = 'Delayed';
    }

    // Progress bar (subtasks completed / total)
    let progress = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.completed).length;
        progress = Math.round((completed / task.subtasks.length) * 100);
    } else {
        progress = task.progress || 0;
    }

    // Placeholder for employee name (UI only)
    let empName = task.empid ? "Employee Name" : "N/A";


    card.innerHTML = `
                <div class="task-header">
                    <h3 style="font-size:1.15rem;">${task.name}</h3>
                    <span class="priority-label" style="margin-left:auto;padding:2px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;align-self:center;">
                        ${priority}
                    </span>
                    <span class="material-icons-sharp three-dots" tabindex="0" aria-haspopup="true" aria-label="Task options menu" style="margin-left:8px;">more_vert</span>
                    <div class="dropdown-menu" role="menu">
                        <button class="route-btn" role="menuitem">Route</button>
                        <button class="archive-btn" role="menuitem">Archive</button>
                        <button class="delete-btn" role="menuitem">Delete</button>
                    </div>
                </div>
                <div class="task-details" title="${desc.replace(/"/g, '&quot;')}" style="margin-bottom:0.4em;">${descShort.replace(/\n/g, '<br>')}</div>
                <div class="task-footer" style="display:flex;flex-direction:column;align-items:flex-start;margin-top:0.2em;">
                    <span style="font-size:0.97em;color:#7d8da1;"><b>Employee ID:</b> ${task.empid ? task.empid : 'N/A'}</span>
                    <span title="Deadline" style="font-size:0.97em;color:#7d8da1;"><b>Deadline:</b> ${task.deadline ? formatDateTime(task.deadline) : 'N/A'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                    <div></div>
                    <div class="subtask-avatars" style="display:flex;align-items:center;gap:0.3em;">
                        <div class="avatar-stack" style="display:flex;align-items:center;">
                            ${(task.subtasks || []).slice(0, 3).map((st, i) => `
                                <span class="avatar-dot" style="
                                    display:inline-block;
                                    width:26px;height:26px;
                                    border-radius:50%;
                                    background:${['#7380ec', '#41f1b6', '#ffbb55'][i % 3]};
                                    border:2px solid #fff;
                                    margin-left:-10px;
                                    z-index:${10 - i};
                                    box-shadow:0 1px 4px rgba(0,0,0,0.07);
                                " title="${st.name}"></span>
                            `).join('')}
                        </div>
                        <span style="margin-left:8px;font-weight:600;color:#7380ec;font-size:1.1em;">
                            ${task.subtasks ? task.subtasks.length : 0}
                        </span>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                        <div style="width:${progress}%;background:#7380ec;height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
                    <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                        ${status}
                    </span>
                    <span style="font-size:0.97em;color:#7d8da1;text-align:right;">
                        ${task.createdAt ? formatDateTime(task.createdAt) : ''}
                    </span>
                </div>
            `;

    // Dropdown menu toggle
    const dots = card.querySelector(".three-dots");
    const dropdown = card.querySelector(".dropdown-menu");

    dots.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            if (menu !== dropdown) menu.classList.remove("show");
        });
        dropdown.classList.toggle("show");
    });

    // Remove this from inside the function:
    // document.addEventListener("click", () => {
    //     dropdown.classList.remove("show");
    // });

    // Instead, add this ONCE after all card functions, outside any function:
    if (!window._dropdownGlobalHandlerAdded) {
        document.addEventListener("click", function (e) {
            document.querySelectorAll(".dropdown-menu").forEach(menu => {
                menu.classList.remove("show");
            });
        });
        window._dropdownGlobalHandlerAdded = true;
    }

    // Delete button for task
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete task "${task.name}"?`)) {
            currentProject.tasks = currentProject.tasks.filter(t => t !== task);
            renderTasks();
        }
        dropdown.classList.remove("show");
    });

    // Add details button
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'View Details';
    card.appendChild(detailsButton);

    // Handle details button click separately
    detailsButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Prevent card click/navigation
        showTaskDetails(task); // Only show details
    });

    // Handle card click for navigation only
    card.addEventListener("click", function (e) {
        // Don't navigate if clicking on dropdown, three-dots, or details button
        if (
            e.target.closest('.dropdown-menu') ||
            e.target.classList.contains('three-dots') ||
            e.target.classList.contains('details-btn')
        ) {
            return;
        }
        // Only navigate
        onOpen(task);
    });

    return card;
}

// Create subtask card element
function createSubtaskCard(subtask) {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Subtask: ${subtask.name}, details: ${subtask.details || 'No details'}`);

    // Truncate description to 2 lines
    let desc = subtask.details || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Priority color
    let priority = subtask.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    // Status calculation
    let status = subtask.status || 'Pending';
    const now = new Date();
    if (subtask.deadline && status !== 'Completed') {
        if (now > subtask.deadline) status = 'Delayed';
    }

    // Progress bar (optional)
    let progress = subtask.progress || 0;

    // Employee IDs (array or string)
    let empids = Array.isArray(subtask.empids) ? subtask.empids : (subtask.empids ? [subtask.empids] : []);
    let empidsDisplay = empids.length ? empids.join(', ') : 'N/A';

    // Attachments (array of File objects or file names)
    let attachments = subtask.attachments || [];
    let attachmentLinks = '';
    if (attachments.length > 0) {
        attachmentLinks = `<a href="#" class="download-all-attachments" style="font-size:1.1em;color:#7380ec;text-decoration:underline;cursor:pointer;" title="Download all attachments">${attachments.length} file${attachments.length > 1 ? 's' : ''} attached <span class="material-icons-sharp" style="font-size:1em;vertical-align:middle;">download</span></a>`;
    }

    // Uploaded task files (from submit in subtask details)
    let uploadedTaskFiles = subtask.uploadedTaskFiles || [];
    let uploadedTaskFilesLinks = '';
    if (uploadedTaskFiles.length > 0) {
        uploadedTaskFilesLinks = `
            <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
                <b>Task File(s):</b>
                <a href="#" class="download-all-taskfiles" style="font-size:1.1em;color:#41f1b6;text-decoration:underline;cursor:pointer;" title="Download all task files">
                    ${uploadedTaskFiles.length} file${uploadedTaskFiles.length > 1 ? 's' : ''} uploaded
                    <span class="material-icons-sharp" style="font-size:1em;vertical-align:middle;">download</span>
                </a>
            </div>
        `;
    }

    card.innerHTML = `
                <div class="task-header">
                    <h3 style="font-size:1.15rem;">${subtask.name}</h3>
                    <span class="priority-label" style="margin-left:auto;padding:2px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;align-self:center;">
                        ${priority}
                    </span>
                    <span class="material-icons-sharp three-dots" tabindex="0" aria-haspopup="true" aria-label="Subtask options menu" style="margin-left:8px;">more_vert</span>
                    <div class="dropdown-menu" role="menu">
                        <button class="route-btn" role="menuitem">Route</button>
                        <button class="archive-btn" role="menuitem">Archive</button>
                        <button class="delete-btn" role="menuitem">Delete</button>
                    </div>
                </div>
                <div class="task-details" title="${desc.replace(/"/g, '&quot;')}" style="margin-bottom:0.4em;">${descShort.replace(/\n/g, '<br>')}</div>
                <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
                    <b>Employee ID(s):</b> ${empidsDisplay}
                </div>
                <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
                    <b>Deadline:</b> ${subtask.deadline ? formatDateTime(subtask.deadline) : 'N/A'}
                </div>
                ${attachmentLinks ? `<div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;"><b>Attachment(s):</b> ${attachmentLinks}</div>` : ''}
                ${uploadedTaskFilesLinks}
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                        <div style="width:${progress}%;background:#7380ec;height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
                    <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                        ${status}
                    </span>
                    <span style="font-size:0.97em;color:#7d8da1;text-align:right;">
                        ${subtask.createdAt ? formatDateTime(subtask.createdAt) : ''}
                    </span>
                </div>
            `;

    // Dropdown menu toggle
    const dots = card.querySelector(".three-dots");
    const dropdown = card.querySelector(".dropdown-menu");

    dots.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            if (menu !== dropdown) menu.classList.remove("show");
        });
        dropdown.classList.toggle("show");
    });

    // Remove this from inside the function:
    // document.addEventListener("click", () => {
    //     dropdown.classList.remove("show");
    // });

    // Instead, add this ONCE after all card functions, outside any function:
    if (!window._dropdownGlobalHandlerAdded) {
        document.addEventListener("click", function (e) {
            document.querySelectorAll(".dropdown-menu").forEach(menu => {
                menu.classList.remove("show");
            });
        });
        window._dropdownGlobalHandlerAdded = true;
    }

    // Delete button for subtask
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete subtask "${subtask.name}"?`)) {
            currentTask.subtasks = currentTask.subtasks.filter(st => st !== subtask);
            renderSubtasks();
        }
        dropdown.classList.remove("show");
    });

    // Download all attachments handler (works for 1 or more files)
    if (attachments.length > 0) {
        card.querySelector('.download-all-attachments').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            attachments.forEach(file => {
                let url, filename;
                if (file instanceof File) {
                    url = URL.createObjectURL(file);
                    filename = file.name;
                } else {
                    url = file;
                    filename = typeof file === 'string' ? file.split('/').pop() : 'attachment';
                }
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (file instanceof File) {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            });
        });
    }

    // Download all task files handler
    if (uploadedTaskFiles.length > 0) {
        card.querySelector('.download-all-taskfiles').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            uploadedTaskFiles.forEach(file => {
                let url, filename;
                if (file instanceof File) {
                    url = URL.createObjectURL(file);
                    filename = file.name;
                } else {
                    url = file;
                    filename = typeof file === 'string' ? file.split('/').pop() : 'taskfile';
                }
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (file instanceof File) {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            });
        });
    }

    // --- Single click to show subtask details modal ---
    card.addEventListener("click", function (e) {
        // Prevent click on dropdown menu or three-dots from opening details
        if (e.target.closest('.dropdown-menu') || e.target.classList.contains('three-dots')) return;
        showSubtaskDetails(subtask);
    });
    // --------------------------------------------------

    return card;
}

// renderTeams function to display teams
function renderTeams() {
    sectionTitle.textContent = "Teams";
    teamsView.hidden = false;
    projectsView.hidden = true;
    tasksView.hidden = true;
    subtasksView.hidden = true;
    breadcrumb.hidden = true;
    currentTeam = null;
    currentProject = null;
    currentTask = null;

    teamCardsContainer.innerHTML = "";
    teams.forEach(team => {
        const card = createTeamCard(team, openTeamFolder);
        teamCardsContainer.appendChild(card);
    });
}

// Render projects list view (root level)
function renderProjects() {
    sectionTitle.textContent = "Projects";
    teamsView.hidden = true;
    projectsView.hidden = false;
    tasksView.hidden = true;
    subtasksView.hidden = true;
    breadcrumb.hidden = false;
    currentProject = null;
    currentTask = null;

    // Show back to teams button
    backProjectsBtn.hidden = false;
    backProjectsBtn.textContent = "Back to Teams";

    projectCardsContainer.innerHTML = "";
    (currentTeam.projects || []).forEach(project => {
        const card = createProjectCard(project, openProjectFolder);
        projectCardsContainer.appendChild(card);
    });
}


// Render tasks list view
function renderTasks() {
    sectionTitle.textContent = "Tasks";
    projectsView.hidden = true;
    tasksView.hidden = false;
    subtasksView.hidden = true;
    breadcrumb.hidden = false;
    currentTask = null;

    // Breadcrumb
    breadcrumbProject.textContent = currentProject.name;
    breadcrumbProject.onclick = goBackToProjects;
    breadcrumbProject.onkeydown = (e) => { if (e.key === 'Enter') goBackToProjects(); };
    breadcrumbSubproject.hidden = true;
    breadcrumbCurrent.textContent = "Tasks";

    // Show and set back button
    backProjectsBtn.hidden = false;
    backProjectsBtn.innerHTML = `<span class="material-icons-sharp">arrow_back</span> Back to Projects`;
    backSubprojectBtn.hidden = true;

    // Title
    taskProjectTitle.textContent = `Tasks - ${currentProject.name}`;

    // Show tasks for current project
    taskCardsContainer.innerHTML = "";
    (currentProject.tasks || []).forEach(task => {
        const card = createTaskCard(task, openTaskFolder);
        taskCardsContainer.appendChild(card);
    });
}

// Render subtasks list view
function renderSubtasks() {
    sectionTitle.textContent = "Subtasks";
    projectsView.hidden = true;
    tasksView.hidden = true;
    subtasksView.hidden = false;
    breadcrumb.hidden = false;
    createSubtaskBtn.hidden = false;
    createSubtaskBtn.onclick = () => showModal('subtask');

    // Breadcrumb
    breadcrumbProject.textContent = currentProject.name;
    breadcrumbProject.onclick = goBackToProjects;
    breadcrumbProject.onkeydown = (e) => { if (e.key === 'Enter') goBackToProjects(); };

    breadcrumbSubproject.hidden = false;
    breadcrumbSubproject.textContent = currentTask.name;
    breadcrumbSubproject.onclick = goBackToTasks;
    breadcrumbSubproject.onkeydown = (e) => { if (e.key === 'Enter') goBackToTasks(); };

    breadcrumbCurrent.textContent = "Subtasks";

    backProjectsBtn.hidden = true;
    backSubprojectBtn.hidden = true;
    backTasksBtn.hidden = false;
    backSubprojectBtn.innerHTML = `<span class="material-icons-sharp"> arrow_back </span> Back to Tasks`;

    // Title
    subtaskProjectTitle.textContent = `Subtasks - ${currentProject.name} / ${currentTask.name}`;

    // Show subtasks for current task
    subtaskCardsContainer.innerHTML = "";
    (currentTask.subtasks || []).forEach(subtask => {
        const card = createSubtaskCard(subtask);
        subtaskCardsContainer.appendChild(card);
    });
}

// Navigation functions
function openTeamFolder(team) {
    currentTeam = team;
    renderProjects();
}

function openProjectFolder(project) {
    currentProject = project;
    renderTasks();
}

function openTaskFolder(task) {
    currentTask = task;
    renderSubtasks();
}

function goBackToProjects() {
    renderProjects();
}

function goBackToTasks() {
    renderTasks();
}

// Show modal for creating project, task or subtask
function showModal(type, subtaskToEdit = null) {
    modalForm.reset();
    // Hide all fields by default (with null checks)
    if (inputTeamName) inputTeamName.style.display = 'none';
    const teamNameLabel = document.getElementById('input-team-name-label');
    if (teamNameLabel) teamNameLabel.style.display = 'none';
    if (inputTeamDesc) inputTeamDesc.style.display = 'none';
    const teamDescLabel = document.getElementById('input-team-desc-label');
    if (teamDescLabel) teamDescLabel.style.display = 'none';
    if (inputLeaderId) inputLeaderId.style.display = 'none';
    const leaderIdLabel = document.getElementById('input-leader-id-label');
    if (leaderIdLabel) leaderIdLabel.style.display = 'none';
    if (leaderIdSuggestions) leaderIdSuggestions.style.display = 'none';
    if (inputName) inputName.style.display = 'none';
    const inputLabel = document.getElementById('input-label');
    if (inputLabel) inputLabel.style.display = 'none';
    if (inputDescription) inputDescription.style.display = 'none';
    const inputDescriptionLabel = document.getElementById('input-description-label');
    if (inputDescriptionLabel) inputDescriptionLabel.style.display = 'none';
    if (inputClient) inputClient.style.display = 'none';
    const inputClientLabel = document.getElementById('input-client-label');
    if (inputClientLabel) inputClientLabel.style.display = 'none';
    if (inputStartDate) inputStartDate.style.display = 'none';
    const inputStartDateLabel = document.getElementById('input-startdate-label');
    if (inputStartDateLabel) inputStartDateLabel.style.display = 'none';
    if (inputDeadline) inputDeadline.style.display = 'none';
    const inputDeadlineLabel = document.getElementById('input-deadline-label');
    if (inputDeadlineLabel) inputDeadlineLabel.style.display = 'none';
    if (priorityFieldWrapper) priorityFieldWrapper.style.display = 'none';
    if (inputTaskName) inputTaskName.style.display = 'none';
    const inputTaskNameLabel = document.getElementById('input-task-name-label');
    if (inputTaskNameLabel) inputTaskNameLabel.style.display = 'none';
    if (taskPriorityFieldWrapper) taskPriorityFieldWrapper.style.display = 'none';
    if (inputTaskDesc) inputTaskDesc.style.display = 'none';
    const inputTaskDescLabel = document.getElementById('input-task-desc-label');
    if (inputTaskDescLabel) inputTaskDescLabel.style.display = 'none';
    if (inputTaskEmpid) inputTaskEmpid.style.display = 'none';
    const inputTaskEmpidLabel = document.getElementById('input-task-empid-label');
    if (inputTaskEmpidLabel) inputTaskEmpidLabel.style.display = 'none';
    if (inputTaskDeadline) inputTaskDeadline.style.display = 'none';
    const inputTaskDeadlineLabel = document.getElementById('input-task-deadline-label');
    if (inputTaskDeadlineLabel) inputTaskDeadlineLabel.style.display = 'none';
    if (inputSubtaskName) inputSubtaskName.style.display = 'none';
    const inputSubtaskNameLabel = document.getElementById('input-subtask-name-label');
    if (inputSubtaskNameLabel) inputSubtaskNameLabel.style.display = 'none';
    if (inputSubtaskDesc) inputSubtaskDesc.style.display = 'none';
    const inputSubtaskDescLabel = document.getElementById('input-subtask-desc-label');
    if (inputSubtaskDescLabel) inputSubtaskDescLabel.style.display = 'none';
    if (inputSubtaskEmpid) inputSubtaskEmpid.style.display = 'none';
    const inputSubtaskEmpidLabel = document.getElementById('input-subtask-empid-label');
    if (inputSubtaskEmpidLabel) inputSubtaskEmpidLabel.style.display = 'none';
    if (inputSubtaskDeadline) inputSubtaskDeadline.style.display = 'none';
    const inputSubtaskDeadlineLabel = document.getElementById('input-subtask-deadline-label');
    if (inputSubtaskDeadlineLabel) inputSubtaskDeadlineLabel.style.display = 'none';
    if (inputSubtaskPriority) inputSubtaskPriority.style.display = 'none';
    if (subtaskPriorityFieldWrapper) subtaskPriorityFieldWrapper.style.display = 'none';
    if (inputSubtaskAttachment) inputSubtaskAttachment.style.display = 'none';
    const inputSubtaskAttachmentLabel = document.getElementById('input-subtask-attachment-label');
    if (inputSubtaskAttachmentLabel) inputSubtaskAttachmentLabel.style.display = 'none';
    const taskEmpidSuggestions = document.getElementById('task-empid-suggestions');
    if (taskEmpidSuggestions) taskEmpidSuggestions.style.display = 'none';
    const subtaskEmpidSuggestions = document.getElementById('subtask-empid-suggestions');
    if (subtaskEmpidSuggestions) subtaskEmpidSuggestions.style.display = 'none';
    const selectedEmployeesDiv = document.getElementById('selected-employees');
    if (selectedEmployeesDiv) selectedEmployeesDiv.style.display = 'none';

    const taskEmployeeSelect = document.getElementById('task-employee-select');
    const taskEmployeeSelectLabel = document.getElementById('task-employee-select-label');
    if (taskEmployeeSelect) taskEmployeeSelect.style.display = 'none';
    if (taskEmployeeSelectLabel) taskEmployeeSelectLabel.style.display = 'none';

    if (type === 'team') {
        // Fetch employees for leader suggestion if not already loaded
        if (!window._employeesLoadedForTeam) {
            fetch('/api/hr/employees')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        employees.length = 0;
                        data.forEach(emp => employees.push({
                            id: emp.emp_user_id || emp.id,
                            name: (emp.emp_first_name || emp.emp_fname || '') + ' ' + (emp.emp_last_name || emp.emp_lname || '')
                        }));
                        window._employeesLoadedForTeam = true;
                    }
                });
        }
        // Hide task employee select and label
        const taskEmployeeSelect = document.getElementById('task-employee-select');
        const taskEmployeeSelectLabel = document.getElementById('task-employee-select-label');
        if (taskEmployeeSelect) taskEmployeeSelect.style.display = 'none';
        if (taskEmployeeSelectLabel) taskEmployeeSelectLabel.style.display = 'none';
        // Show only team fields
        modalTitle.textContent = subtaskToEdit ? 'Update Team' : 'Create New Team';
        const createBtn = document.getElementById('create-btn');
        if (createBtn) createBtn.textContent = subtaskToEdit ? 'Update' : 'Create';
        if (inputTeamName) inputTeamName.style.display = 'block';
        const teamNameLabel = document.getElementById('input-team-name-label');
        if (teamNameLabel) teamNameLabel.style.display = 'block';
        if (inputTeamDesc) inputTeamDesc.style.display = 'block';
        const teamDescLabel = document.getElementById('input-team-desc-label');
        if (teamDescLabel) teamDescLabel.style.display = 'block';
        if (inputLeaderId) {
            inputLeaderId.style.display = 'block';
            inputLeaderId.style.display = '';
            inputLeaderId.removeAttribute('hidden');
        }
        const leaderIdLabel = document.getElementById('input-leader-id-label');
        if (leaderIdLabel) {
            leaderIdLabel.style.display = '';
            leaderIdLabel.removeAttribute('hidden');
        }
        if (leaderIdSuggestions) {
            leaderIdSuggestions.style.display = 'block';
        }
        if (inputTeamName) inputTeamName.focus();
        if (subtaskToEdit) {
            if (inputTeamName) inputTeamName.value = subtaskToEdit.name || '';
            if (inputTeamDesc) inputTeamDesc.value = subtaskToEdit.description || '';
            if (inputLeaderId) inputLeaderId.value = subtaskToEdit.leaderId || '';
            modalForm.setAttribute('data-editing-team', 'true');
            modalForm.setAttribute('data-editing-team-name', subtaskToEdit.name);
        } else {
            if (inputLeaderId) inputLeaderId.value = '';
            modalForm.removeAttribute('data-editing-team');
            modalForm.removeAttribute('data-editing-team-name');
        }
        setTimeout(() => {
            setupLeaderAutocomplete();
            if (inputLeaderId) inputLeaderId.focus();
        }, 100);
    } else if (type === 'project') {
        const isEditingProject = modalForm.getAttribute('data-editing-project') === 'true';
        const editingProjectName = modalForm.getAttribute('data-editing-project-name');
        if (!name) {
            alert('Please enter a project name.');
            inputName.focus();
            return;
        }
        if (!client) {
            alert('Please enter a client name.');
            inputClient.focus();
            return;
        }
        if (!startdate) {
            alert('Please select a start date.');
            inputStartDate.focus();
            return;
        }
        if (!deadline) {
            alert('Please select a deadline.');
            inputDeadline.focus();
            return;
        }
        if (!currentTeam) {
            alert('No team selected for creating a project.');
            closeModal();
            return;
        }
        if (!isEditingProject && projectExistsInList(currentTeam.projects, name)) {
            alert('Project with this name already exists.');
            inputName.focus();
            return;
        }
        if (
            isEditingProject &&
            name.toLowerCase() !== editingProjectName.toLowerCase() &&
            projectExistsInList(currentTeam.projects, name)
        ) {
            alert('Project with this name already exists.');
            inputName.focus();
            return;
        }
        if (isEditingProject) {
            // Find and update the project
            const project = currentTeam.projects.find(p => p.name === editingProjectName);
            if (project) {
                project.name = name;
                project.description = description;
                project.client = client;
                project.startdate = new Date(startdate);
                project.deadline = new Date(deadline);
                project.priority = inputPriority.value;
            }
            renderProjects();
            closeModal();
            return;
        }
        const newProject = {
            name,
            description,
            client,
            startdate: new Date(startdate),
            deadline: new Date(deadline),
            mentor: 'Unassigned',
            createdAt: new Date(),
            tasks: [],
            status: 'active',
            progress: 0,
            priority: inputPriority.value
        };
        currentTeam.projects.unshift(newProject);
        renderProjects();
        closeModal();
    } else if (type === 'task') {
        const taskName = inputTaskName.value.trim();
        const taskDesc = inputTaskDesc.value.trim();
        const taskDeadline = inputTaskDeadline.value;
        const taskPriority = inputTaskPriority.value;
        let taskEmpidRaw = inputTaskEmpid.value.trim();
        let taskEmpid = taskEmpidRaw;
        const match = taskEmpidRaw.match(/\(([^)]+)\)$/);
        if (match) {
            taskEmpid = match[1];
        }
        const isEditingTask = modalForm.getAttribute('data-editing-task') === 'true';
        const editingTaskName = modalForm.getAttribute('data-editing-task-name');
        if (!taskName) {
            alert('Please enter a task name.');
            inputTaskName.focus();
            return;
        }
        if (!taskDeadline) {
            alert('Please select a task deadline.');
            inputTaskDeadline.focus();
            return;
        }
        if (!currentProject) {
            alert('No project is open to add a task.');
            closeModal();
            return;
        }
        if (!isEditingTask && projectExistsInList(currentProject.tasks, taskName)) {
            alert('Task with this name already exists in this project.');
            inputTaskName.focus();
            return;
        }
        if (
            isEditingTask &&
            taskName.toLowerCase() !== editingTaskName.toLowerCase() &&
            projectExistsInList(currentProject.tasks, taskName)
        ) {
            alert('Task with this name already exists in this project.');
            inputTaskName.focus();
            return;
        }
        if (isEditingTask) {
            // Find and update the task
            const task = currentProject.tasks.find(t => t.name === editingTaskName);
            if (task) {
                task.name = taskName;
                task.details = taskDesc;
                task.empid = taskEmpid;
                task.deadline = new Date(taskDeadline);
                task.priority = taskPriority;
            }
            renderTasks();
            closeModal();
            return;
        }
        const newTask = {
            name: taskName,
            details: taskDesc,
            empid: taskEmpid,
            deadline: new Date(taskDeadline),
            createdAt: new Date(),
            subtasks: [],
            status: 'active',
            progress: 0,
            priority: taskPriority
        };
        currentProject.tasks.unshift(newTask);
        renderTasks();
        closeModal();
    } else if (type === 'subtask') {
        const subtaskName = inputSubtaskName.value.trim();
        const subtaskDesc = inputSubtaskDesc.value.trim();
        // const subtaskEmpid = inputSubtaskEmpid.value.trim();
        const subtaskDeadline = inputSubtaskDeadline.value;
        const subtaskPriority = inputSubtaskPriority.value;
        const subtaskEmpids = selectedEmployees.map(e => e.id);
        const subtaskAttachment = inputSubtaskAttachment.files ? Array.from(inputSubtaskAttachment.files) : [];
        if (!subtaskName) {
            alert('Please enter a subtask name.');
            inputSubtaskName.focus();
            return;
        }
        if (!selectedEmployees.length) {
            alert('Please select at least one employee.');
            inputSubtaskEmpid.focus();
            return;
        }
        if (!subtaskDeadline) {
            alert('Please select a subtask deadline.');
            inputSubtaskDeadline.focus();
            return;
        }
        if (!currentTask) {
            alert('No Task is open to add subtask.');
            closeModal();
            return;
        }
        const isEditing = modalForm.getAttribute('data-editing-subtask') === 'true';
        const editingName = modalForm.getAttribute('data-editing-subtask-name');
        if (!isEditing && projectExistsInList(currentTask.subtasks, subtaskName)) {
            alert('Subtask with this name already exists in this task.');
            inputSubtaskName.focus();
            return;
        }
        // If editing, allow the same name as the one being edited
        if (
            isEditing &&
            subtaskName.toLowerCase() !== editingName.toLowerCase() &&
            projectExistsInList(currentTask.subtasks, subtaskName)
        ) {
            alert('Subtask with this name already exists in this task.');
            inputSubtaskName.focus();
            return;
        }
        if (isEditing) {
            // Find and update the subtask
            const subtask = currentTask.subtasks.find(st => st.name === editingName);
            if (subtask) {
                subtask.name = subtaskName;
                subtask.details = subtaskDesc;
                subtask.empids = subtaskEmpids;
                subtask.deadline = new Date(subtaskDeadline);
                subtask.priority = subtaskPriority;
                // Optionally update attachments if new ones are uploaded
                if (subtaskAttachment.length > 0) {
                    subtask.attachments = subtaskAttachment;
                }
            }
            renderSubtasks();
            closeModal();
            return;
        } else {
            const newSubtask = {
                name: subtaskName,
                details: subtaskDesc,
                empids: subtaskEmpids,
                deadline: new Date(subtaskDeadline),
                createdAt: new Date(),
                priority: subtaskPriority,
                attachments: subtaskAttachment
            };
            currentTask.subtasks.unshift(newSubtask);
            renderSubtasks();
            closeModal();
        }
    }
    projectModal.setAttribute('aria-hidden', 'false');
    projectModal.classList.add('active');
    projectModal.style.display = 'flex';
    const modalButtons = projectModal.querySelector('.modal-buttons');
    if (modalButtons) {
        modalButtons.style.display = 'flex';
    } else {
        console.warn('No .modal-buttons found inside #modal!');
    }
    modalForm.setAttribute('data-type', type);
}

// Close modal function
function closeModal() {
    projectModal.style.display = 'none';
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    modalForm.reset();
    modalForm.removeAttribute('data-type');
    modalForm.removeAttribute('data-editing-team');
    modalForm.removeAttribute('data-editing-team-name');
    modalForm.removeAttribute('data-editing-project');
    modalForm.removeAttribute('data-editing-project-name');
    modalForm.removeAttribute('data-editing-task');
    modalForm.removeAttribute('data-editing-task-name');
    modalForm.removeAttribute('data-editing-subtask');
    modalForm.removeAttribute('data-editing-subtask-name');
}

// Open modal to create root level project
createProjectBtn.addEventListener("click", () => {
    showModal('project');
});

// Open modal to create team
createTeamBtn.addEventListener("click", () => {
    console.log('Create Team button clicked');
    showModal('team');
    // Fallback: force modal to display in case of CSS issues
    projectModal.style.display = 'flex';
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
});

// Open modal to create task
createTaskBtn.addEventListener("click", () => {
    if (!currentProject) {
        alert('No project selected for creating a task.');
        return;
    }
    showModal('task');
});


// Open modal to create subtask (when in subtasks view)
// You may want to add a "create subtask" button in subtasks view and use:
// showModal('subtask');

// Back buttons event listeners
backToTeamsBtn.addEventListener("click", () => {
    renderTeams();
});

backProjectsBtn.addEventListener("click", () => {
    goBackToProjects();
});

backSubprojectBtn.addEventListener("click", () => {
    goBackToTasks();
});

backTasksBtn.addEventListener("click", () => {
    goBackToTasks();
});

// Initial render of projects
// Load teams from backend instead of using dummy data
loadTeams();

flatpickr("#input-startdate", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    allowInput: true,
    wrap: false,
    clickOpens: true,
    minDate: "today",
    plugins: [new confirmDatePlugin({})]
});
flatpickr("#input-deadline", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    allowInput: true,
    wrap: false,
    clickOpens: true,
    minDate: "today",
    plugins: [new confirmDatePlugin({})]
});
flatpickr("#input-task-deadline", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    allowInput: true,
    wrap: false,
    clickOpens: true,
    minDate: "today",
    plugins: [new confirmDatePlugin({})]
});
flatpickr("#input-subtask-deadline", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    allowInput: true,
    wrap: false,
    clickOpens: true,
    minDate: "today",
    plugins: [new confirmDatePlugin({})]
});

// Function to show project details
function showProjectDetails(project) {
    const modal = projectDetailsModal;
    const content = document.getElementById("project-details-content");

    // Calculate progress
    let progress = 0;
    if (project.tasks && project.tasks.length > 0) {
        const completed = project.tasks.filter(t => t.completed).length;
        progress = Math.round((completed / project.tasks.length) * 100);
    }

    // Status calculation
    let status = project.status || 'Pending';
    const now = new Date();
    if (project.deadline && status !== 'Completed') {
        if (now > project.deadline) status = 'Delayed';
    }

    // Priority color
    let priority = project.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    content.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                        <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${project.name}</h2>
                        <div style="display:flex;align-items:center;gap:0.7rem;">
                            <span class="priority-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;">
                                ${priority}
                            </span>
                            <span class="status-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                                ${status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Project Details</h3>
                    <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${project.description || 'No description provided.'}</p>
                    
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                        <strong style="color:#363949;">Client:</strong>
                        <span style="color:#677483;">${project.client || 'N/A'}</span>
                        
                        <strong style="color:#363949;">Start Date:</strong>
                        <span style="color:#677483;">${project.startdate ? formatDateTime(project.startdate) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Deadline:</strong>
                        <span style="color:#677483;">${project.deadline ? formatDateTime(project.deadline) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Created:</strong>
                        <span style="color:#677483;">${project.createdAt ? formatDateTime(project.createdAt) : 'N/A'}</span>
                    </div>
                </div>



                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Progress</h3>
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:12px;width:100%;margin:0.5rem 0;">
                        <div style="width:${progress}%;background:#7380ec;height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:0.5rem;">
                        <span style="color:#677483;">${progress}% Complete</span>
                        <span style="color:#677483;">${project.tasks ? project.tasks.length : 0} Tasks</span>
                    </div>
                </div>
                <div style="margin-top:2rem;display:flex;justify-content:center;align-items:center;">
                    <button id="update-project-btn" style="background:#7380ec;color:#fff;padding:0.5em 1.2em;border-radius:0.5em;border:none;font-size:1em;cursor:pointer;min-width:120px;">Update Project</button>
                </div>
            `;

    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = document.getElementById('close-project-details');
    closeBtn.onclick = () => modal.style.display = 'none';

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // Update button handler
    content.querySelector('#update-project-btn').onclick = function () {
        showModal('project', project);
        setTimeout(() => {
            inputName.value = project.name || '';
            inputDescription.value = project.description || '';
            inputClient.value = project.client || '';
            inputStartDate.value = project.startdate ? toFlatpickrString(project.startdate) : '';
            inputDeadline.value = project.deadline ? toFlatpickrString(project.deadline) : '';
            inputPriority.value = project.priority || 'Medium';
            modalTitle.textContent = 'Update Project';
            document.getElementById('create-btn').textContent = 'Update';
        }, 100);
        modal.style.display = 'none';
    };
}

// Function to show task details
function showTaskDetails(task) {
    const modal = taskDetailsModal;
    const content = document.getElementById("task-details-content");

    // Calculate progress
    let progress = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.completed).length;
        progress = Math.round((completed / task.subtasks.length) * 100);
    }

    // Status calculation
    let status = task.status || 'Pending';
    const now = new Date();
    if (task.deadline && status !== 'Completed') {
        if (now > task.deadline) status = 'Delayed';
    }

    // Priority color
    let priority = task.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    content.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                        <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${task.name}</h2>
                        <div style="display:flex;align-items:center;gap:0.7rem;">
                            <span class="priority-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;">
                                ${priority}
                            </span>
                            <span class="status-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                                ${status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Task Details</h3>
                    <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${task.details || 'No details provided.'}</p>
                    
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                        <strong style="color:#363949;">Employee:</strong>
                        <span style="color:#677483;">
                            ${(() => {
            const emp = employees.find(e => e.id === task.empid);
            return task.empid
                ? emp
                    ? `${emp.name} (${emp.id})`
                    : `${task.empid} (Unknown)`
                : 'Not assigned';
        })()
        }
                        </span>
                        <strong style="color:#363949;">Deadline:</strong>
                        <span style="color:#677483;">${task.deadline ? formatDateTime(task.deadline) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Created:</strong>
                        <span style="color:#677483;">${task.createdAt ? formatDateTime(task.createdAt) : 'N/A'}</span>
                    </div>
                </div>

                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Progress</h3>
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:12px;width:100%;margin:0.5rem 0;">
                        <div style="width:${progress}%;background:#7380ec;height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:0.5rem;">
                        <span style="color:#677483;">${progress}% Complete</span>
                        <span style="color:#677483;">${task.subtasks ? task.subtasks.length : 0} Subtasks</span>
                    </div>
                </div>
                <div style="margin-top:2rem;display:flex;justify-content:center;align-items:center;">
                    <button id="update-task-btn" style="background:#7380ec;color:#fff;padding:0.5em 1.2em;border-radius:0.5em;border:none;font-size:1em;cursor:pointer;min-width:120px;">Update Task</button>
                </div>
            `;

    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = document.getElementById('close-task-details');
    closeBtn.onclick = () => modal.style.display = 'none';

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };

    // Update button handler
    content.querySelector('#update-task-btn').onclick = function () {
        showModal('task', task); // Pass the task object for update
        setTimeout(() => {
            inputTaskName.value = task.name || '';
            inputTaskDesc.value = task.details || '';
            inputTaskEmpid.value = task.empid || '';
            inputTaskDeadline.value = task.deadline ? toFlatpickrString(task.deadline) : '';
            inputTaskPriority.value = task.priority || 'Medium';
            // Change heading and button
            modalTitle.textContent = 'Update Task';
            document.getElementById('create-btn').textContent = 'Update';
        }, 100);
        modal.style.display = 'none';
    };
}

// Function to show subtask details
function showSubtaskDetails(subtask) {
    const modal = subtaskDetailsModal;
    const content = document.getElementById("subtask-details-content");

    let status = subtask.status || 'Pending';
    const now = new Date();
    if (subtask.deadline && status !== 'Completed') {
        if (now > subtask.deadline) status = 'Delayed';
    }
    let priority = subtask.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';
    let empids = Array.isArray(subtask.empids) ? subtask.empids : (subtask.empids ? [subtask.empids] : []);
    // Use the same logic as the main employee display for empidsDisplay
    let empidsDisplay = empids.length
        ? empids.map(id => {
            const emp = employees.find(e => e.id === id);
            return `<span style="display:inline-block;margin-right:1em;"><b>${id}</b> (${emp ? emp.name : 'Unknown'})</span>`;
        }).join('')
        : 'Not assigned';

    content.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                        <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${subtask.name}</h2>
                        <div style="display:flex;align-items:center;gap:0.7rem;">
                            <span class="priority-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;">
                                ${priority}
                            </span>
                            <span class="status-label" style="padding:4px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                                ${status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Subtask Details</h3>
                    <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${subtask.details || 'No details provided.'}</p>
                    
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                        <strong style="color:#363949;">Employee(s):</strong>
                        <span style="color:#677483;">
                            ${empidsDisplay}
                        </span>
                        
                        <strong style="color:#363949;">Deadline:</strong>
                        <span style="color:#677483;">${subtask.deadline ? formatDateTime(subtask.deadline) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Created:</strong>
                        <span style="color:#677483;">${subtask.createdAt ? formatDateTime(subtask.createdAt) : 'N/A'}</span>
                    </div>
                </div>

                ${subtask.attachments && subtask.attachments.length > 0 ? `
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Attachments</h3>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${subtask.attachments.map(file => `
                            <a href="#" class="download-attachment" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:#7380ec;color:white;border-radius:0.5rem;text-decoration:none;">
                                <span class="material-icons-sharp">attach_file</span>
                                ${file instanceof File ? file.name : file.split('/').pop()}
                            </a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${(subtask.uploadedTaskFiles && subtask.uploadedTaskFiles.length > 0) ? `
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.2rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Task Uploaded File(s)</h3>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                        ${subtask.uploadedTaskFiles.map((file, idx) => `
                            <a href="#" class="download-task-file" data-file-idx="${idx}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:#41f1b6;color:white;border-radius:0.5rem;text-decoration:none;">
                                <span class="material-icons-sharp">file_present</span>
                                ${file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : 'file')}
                            </a>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div style="margin-top:2rem;">
                    <label style="font-weight:600;margin-left:1.5rem;">Upload Task File:</label>
                    <input type="file" id="upload-task-file" multiple />
                    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1rem;">
                        <button id="submit-task-btn" style="background:#41f1b6;color:#fff;padding:0.4em 1em;border-radius:0.5em;border:none;font-size:0.98em;cursor:pointer;min-width:90px;">Submit</button>
                        <button id="update-subtask-btn" style="background:#7380ec;color:#fff;padding:0.4em 1em;border-radius:0.5em;border:none;font-size:0.98em;cursor:pointer;min-width:90px;">Update</button>
                    </div>
                </div>
            `;

    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = document.getElementById('close-subtask-details');
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Attachment download handlers
    if (subtask.attachments) {
        content.querySelectorAll('.download-attachment').forEach((link, index) => {
            link.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = subtask.attachments[index];
                let url, filename;
                if (file instanceof File) {
                    url = URL.createObjectURL(file);
                    filename = file.name;
                } else {
                    url = file;
                    filename = file.split('/').pop();
                }
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (file instanceof File) {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            };
        });
    }

    if (subtask.uploadedTaskFiles && subtask.uploadedTaskFiles.length > 0) {
        content.querySelectorAll('.download-task-file').forEach(link => {
            link.onclick = function (e) {
                e.preventDefault();
                e.stopPropagation();
                const idx = parseInt(link.getAttribute('data-file-idx'), 10);
                const file = subtask.uploadedTaskFiles[idx];
                let url, filename;
                if (file instanceof File) {
                    url = URL.createObjectURL(file);
                    filename = file.name;
                } else {
                    url = file;
                    filename = typeof file === 'string' ? file.split('/').pop() : 'taskfile';
                }
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (file instanceof File) {
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            };
        });
    }

    // Submit button handler
    content.querySelector('#submit-task-btn').onclick = function () {
        const uploadInput = content.querySelector('#upload-task-file');
        if (!uploadInput.files || uploadInput.files.length === 0) {
            alert('Please select at least one file to upload.');
            uploadInput.focus();
            return;
        }
        // Save uploaded files to subtask.uploadedTaskFiles (create array if not present)
        if (!subtask.uploadedTaskFiles) subtask.uploadedTaskFiles = [];
        Array.from(uploadInput.files).forEach(file => {
            subtask.uploadedTaskFiles.push(file);
        });
        // Show a toast at bottom right
        let toast = document.createElement('div');
        toast.textContent = 'Submitted successfully!';
        toast.style.position = 'fixed';
        toast.style.bottom = '32px';
        toast.style.right = '32px';
        toast.style.background = '#41f1b6';
        toast.style.color = '#fff';
        toast.style.padding = '1em 2em';
        toast.style.borderRadius = '0.7em';
        toast.style.fontWeight = 'bold';
        toast.style.zIndex = 9999;
        toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.13)';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 2000);
        // Close the modal
        modal.style.display = 'none';
        renderSubtasks();
    };

    // Update subtask button handler
    content.querySelector('#update-subtask-btn').onclick = function () {
        showModal('subtask', subtask); // Pass the subtask object for update
        setTimeout(() => {
            inputSubtaskName.value = subtask.name || '';
            inputSubtaskDesc.value = subtask.details || '';
            inputSubtaskEmpid.value = (Array.isArray(subtask.empids) ? subtask.empids.join(', ') : subtask.empids || '');
            inputSubtaskDeadline.value = subtask.deadline ? toFlatpickrString(subtask.deadline) : '';
            inputSubtaskPriority.value = subtask.priority || 'Medium';
            // Change heading and button
            modalTitle.textContent = 'Update the Subtask';
            document.getElementById('create-btn').textContent = 'Update';
        }, 100);
        modal.style.display = 'none';
    };
}

function setupTaskEmployeeAutocomplete() {
    const input = document.getElementById('input-task-empid');
    const suggestions = document.getElementById('task-empid-suggestions');
    if (!input || !suggestions) return;

    // Helper to show suggestions
    input.oninput = function () {
        const val = input.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!val) return;
        const filtered = employees.filter(emp =>
            emp.id.includes(val) ||
            emp.name.toLowerCase().includes(val)
        );
        filtered.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = `${emp.name} (${emp.id})`;
            div.onclick = () => {
                input.value = `${emp.name} (${emp.id})`;
                suggestions.innerHTML = '';
            };
            suggestions.appendChild(div);
        });
    };

    // Hide suggestions on blur
    input.onblur = function () {
        setTimeout(() => { suggestions.innerHTML = ''; }, 150);
    };

    // On Enter, select first suggestion if available
    input.onkeydown = function (e) {
        if (e.key === 'Enter' && suggestions.firstChild) {
            suggestions.firstChild.click();
            e.preventDefault();
        }
    };
}

let selectedEmployees = [];
function setupEmployeeAutocomplete() {
    const input = document.getElementById('input-subtask-empid');
    const suggestions = document.getElementById('subtask-empid-suggestions');
    const selectedDiv = document.getElementById('selected-employees');
    // let selectedEmployees = [];

    // Helper to render selected chips
    function renderSelected() {
        selectedDiv.innerHTML = '';
        selectedEmployees.forEach(emp => {
            const chip = document.createElement('span');
            chip.className = 'selected-employee-chip';
            chip.textContent = `${emp.name} (${emp.id})`;
            const remove = document.createElement('span');
            remove.className = 'remove-chip';
            remove.textContent = '×';
            remove.onclick = () => {
                selectedEmployees = selectedEmployees.filter(e => e.id !== emp.id);
                renderSelected();
            };
            chip.appendChild(remove);
            selectedDiv.appendChild(chip);
        });
    }

    // Helper to show suggestions
    input.oninput = function () {
        const val = input.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!val) return;
        const filtered = employees.filter(emp =>
            emp.id.includes(val) ||
            emp.name.toLowerCase().includes(val)
        ).filter(emp => !selectedEmployees.some(e => e.id === emp.id));
        filtered.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = `${emp.name} (${emp.id})`;
            div.onclick = () => {
                selectedEmployees.push(emp);
                renderSelected();
                input.value = '';
                suggestions.innerHTML = '';
            };
            suggestions.appendChild(div);
        });
    };

    // Hide suggestions on blur
    input.onblur = function () {
        setTimeout(() => { suggestions.innerHTML = ''; }, 150);
    };

    // On Enter, select first suggestion if available
    input.onkeydown = function (e) {
        if (e.key === 'Enter' && suggestions.firstChild) {
            suggestions.firstChild.click();
            e.preventDefault();
        }
    };

    // If editing, pre-fill selected employees
    if (modalForm.getAttribute('data-editing-subtask') === 'true') {
        const editingName = modalForm.getAttribute('data-editing-subtask-name');
        const subtask = currentTask.subtasks.find(st => st.name === editingName);
        if (subtask && Array.isArray(subtask.empids)) {
            selectedEmployees = subtask.empids.map(id => {
                const emp = employees.find(e => e.id === id);
                return emp ? emp : { id, name: id };
            });
            renderSelected();
        }
    } else {
        selectedEmployees = [];
        renderSelected();
    }
}

function setupLeaderAutocomplete() {
    if (!inputLeaderId || !leaderIdSuggestions) return;

    inputLeaderId.oninput = function () {
        const val = inputLeaderId.value.trim().toLowerCase();
        leaderIdSuggestions.innerHTML = '';
        if (!val) return;
        const filtered = employees.filter(emp =>
            emp.id.includes(val) ||
            emp.name.toLowerCase().includes(val)
        );
        filtered.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
            div.textContent = `${emp.name} (${emp.id})`;
            div.onclick = () => {
                inputLeaderId.value = `${emp.name} (${emp.id})`;
                leaderIdSuggestions.innerHTML = '';
            };
            leaderIdSuggestions.appendChild(div);
        });
        leaderIdSuggestions.style.display = filtered.length ? 'block' : 'none';
    };

    inputLeaderId.onblur = function () {
        setTimeout(() => { leaderIdSuggestions.innerHTML = ''; }, 150);
    };

    inputLeaderId.onkeydown = function (e) {
        if (e.key === 'Enter' && leaderIdSuggestions.firstChild) {
            leaderIdSuggestions.firstChild.click();
            e.preventDefault();
        }
    };
}

// Form submission handler
modalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const type = modalForm.getAttribute('data-type');
    
    if (type === 'team') {
        await handleTeamCreation();
    } else if (type === 'project') {
        // Handle project creation (existing logic)
        const name = inputName.value.trim();
        const description = inputDescription.value.trim();
        const client = inputClient.value.trim();
        const startdate = inputStartDate.value;
        const deadline = inputDeadline.value;
        
        if (!name) {
            alert('Please enter a project name.');
            inputName.focus();
            return;
        }
        if (!client) {
            alert('Please enter a client name.');
            inputClient.focus();
            return;
        }
        if (!startdate) {
            alert('Please select a start date.');
            inputStartDate.focus();
            return;
        }
        if (!deadline) {
            alert('Please select a deadline.');
            inputDeadline.focus();
            return;
        }
        if (!currentTeam) {
            alert('No team selected for creating a project.');
            closeModal();
            return;
        }
        
        // Add project to current team (for now, just add to local array)
        const newProject = {
            name,
            description,
            client,
            startdate: new Date(startdate),
            deadline: new Date(deadline),
            mentor: 'Unassigned',
            createdAt: new Date(),
            tasks: [],
            status: 'active',
            progress: 0,
            priority: inputPriority.value
        };
        currentTeam.projects.unshift(newProject);
        renderProjects();
        closeModal();
    } else if (type === 'task') {
        // Handle task creation (existing logic)
        const taskName = inputTaskName.value.trim();
        const taskDesc = inputTaskDesc.value.trim();
        const taskDeadline = inputTaskDeadline.value;
        const taskPriority = inputTaskPriority.value;
        let taskEmpidRaw = inputTaskEmpid.value.trim();
        let taskEmpid = taskEmpidRaw;
        const match = taskEmpidRaw.match(/\(([^)]+)\)$/);
        if (match) {
            taskEmpid = match[1];
        }
        
        if (!taskName) {
            alert('Please enter a task name.');
            inputTaskName.focus();
            return;
        }
        if (!taskDeadline) {
            alert('Please select a task deadline.');
            inputTaskDeadline.focus();
            return;
        }
        if (!currentProject) {
            alert('No project is open to add a task.');
            closeModal();
            return;
        }
        
        const newTask = {
            name: taskName,
            details: taskDesc,
            empid: taskEmpid,
            deadline: new Date(taskDeadline),
            createdAt: new Date(),
            subtasks: [],
            status: 'active',
            progress: 0,
            priority: taskPriority
        };
        currentProject.tasks.unshift(newTask);
        renderTasks();
        closeModal();
    } else if (type === 'subtask') {
        // Handle subtask creation (existing logic)
        const subtaskName = inputSubtaskName.value.trim();
        const subtaskDesc = inputSubtaskDesc.value.trim();
        const subtaskDeadline = inputSubtaskDeadline.value;
        const subtaskPriority = inputSubtaskPriority.value;
        const subtaskEmpids = selectedEmployees.map(e => e.id);
        const subtaskAttachment = inputSubtaskAttachment.files ? Array.from(inputSubtaskAttachment.files) : [];
        
        if (!subtaskName) {
            alert('Please enter a subtask name.');
            inputSubtaskName.focus();
            return;
        }
        if (!selectedEmployees.length) {
            alert('Please select at least one employee.');
            inputSubtaskEmpid.focus();
            return;
        }
        if (!subtaskDeadline) {
            alert('Please select a subtask deadline.');
            inputSubtaskDeadline.focus();
            return;
        }
        if (!currentTask) {
            alert('No Task is open to add subtask.');
            closeModal();
            return;
        }
        
        const newSubtask = {
            name: subtaskName,
            details: subtaskDesc,
            empids: subtaskEmpids,
            deadline: new Date(subtaskDeadline),
            createdAt: new Date(),
            priority: subtaskPriority,
            attachments: subtaskAttachment
        };
        currentTask.subtasks.unshift(newSubtask);
        renderSubtasks();
        closeModal();
    }
});

// Handle team creation with backend API
async function handleTeamCreation() {
    const teamName = inputTeamName.value.trim();
    const teamDescription = inputTeamDesc.value.trim();
    let leaderIdRaw = inputLeaderId.value.trim();
    let leaderId = leaderIdRaw;
    
    // Extract leader ID from format "Name (ID)"
    const match = leaderIdRaw.match(/\(([^)]+)\)$/);
    if (match) {
        leaderId = match[1];
    }
    
    if (!teamName) {
        alert('Please enter a team name.');
        inputTeamName.focus();
        return;
    }
    
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        alert('No admin user ID found. Please log in again.');
        return;
    }
    
    try {
        const response = await fetch('/api/projects/create-team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                team_name: teamName,
                team_description: teamDescription,
                leader_id: leaderId || null,
                admin_user_id: adminUserId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Team created successfully!', 'success');
            closeModal();
            // Reload teams to show the new team
            await loadTeams();
        } else {
            showNotification(result.error || 'Failed to create team', 'error');
        }
    } catch (error) {
        console.error('Team creation error:', error);
        showNotification('Failed to create team. Please try again.', 'error');
    }
}

// Close modal on cancel or X icon
closeModalBtn.addEventListener('click', () => {
    closeModal();
});
modalCloseIcon.addEventListener('click', () => {
    closeModal();
});
