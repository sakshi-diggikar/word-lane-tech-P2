// Elements ref
const createProjectBtn = document.getElementById("create-project-btn");
const createTeamBtn = document.getElementById("create-team-btn");
const backToTeamsBtn = document.getElementById("back-to-teams-btn");
const teamCardsContainer = document.getElementById("team-cards");
const projectCardsContainer = document.getElementById("project-cards");

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

// Example employee list - will be populated from backend
let employees = [];

// Current navigation state
let currentTeam = null;
let currentProject = null;
let currentTask = null;

// Modal reference (will be set after DOM loads)
let projectModal = null;

// Add global for selected subtask IDs
let selectedSubtaskIds = [];

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
        console.log('🔍 Loading teams for admin:', adminUserId);
        const response = await fetch(`/api/projects/teams/${adminUserId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('🔍 Teams loaded:', data);
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
        <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${team.team_description || 'No description provided.'}</p>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
            <strong style="color:#363949;">Created:</strong>
            <span style="color:#677483;">${team.team_created_at ? formatDateTime(new Date(team.team_created_at)) : 'N/A'}</span>
            <strong style="color:#363949;">Projects:</strong>
            <span style="color:#677483;">${team.project_count || 0}</span>
            <strong style="color:#363949;">Leader:</strong>
            <span style="color:#677483;">
                ${team.leader_name ? `${team.leader_name} (${team.team_leader_id})` : 'N/A'}
            </span>
            <strong style="color:#363949;">Team ID:</strong>
            <span style="color:#677483;">${team.team_id || 'N/A'}</span>
            <strong style="color:#363949;">Created By:</strong>
            <span style="color:#677483;">${team.team_created_by || 'N/A'}</span>
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
            inputTeamName.value = team.team_name || '';
            inputTeamDesc.value = team.team_description || '';
            inputLeaderId.value = team.leader_name ? `${team.leader_name} (${team.team_leader_id})` : '';
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
    
    // Calculate team progress based on projects
    let teamProgress = 0;
    if (team.projects && team.projects.length > 0) {
        const totalProjects = team.projects.length;
        const completedProjects = team.projects.filter(p => p.proj_status === 2).length;
        teamProgress = Math.round((completedProjects / totalProjects) * 100);
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
                ${team.project_count || 0} Projects
            </span>
        </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-start;margin-top:0.3em;">
        <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
            <div style="width:${teamProgress}%;background:${teamProgress === 100 ? '#28a745' : '#7380ec'};height:100%;border-radius:8px;transition:width 0.3s;"></div>
        </div>
        <span style="font-size:0.9em;color:#7d8da1;margin-top:0.2em;">${teamProgress}% Complete</span>
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
        if (confirm(`Are you sure you want to delete team "${team.team_name}"? This will also delete all projects, tasks, and subtasks associated with this team.`)) {
            deleteTeam(team.team_id);
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
    card.setAttribute("aria-label", `Project: ${project.proj_name}, client: ${project.proj_client || 'N/A'}`);

    // Truncate description to 2 lines (approx 160 chars)
    let desc = project.proj_description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Priority (if available)
    let priority = project.proj_priority || project.priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    // Status
    let status = project.proj_status || project.status || 'Pending';
    if (typeof status === 'number') {
        status = status === 1 ? 'Active' : status === 2 ? 'Completed' : 'Pending';
    }
    let statusColor = status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e';

    // Dates
    let startDate = project.proj_start_date ? formatDateTime(project.proj_start_date) : 'N/A';
    let endDate = project.proj_deadline ? formatDateTime(project.proj_deadline) : 'N/A';
    let createdAt = project.proj_created_at ? formatDateTime(project.proj_created_at) : '';

    // Calculate project progress based on tasks
    let projectProgress = 0;
    if (project.tasks && project.tasks.length > 0) {
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter(t => t.task_status === 2).length;
        projectProgress = Math.round((completedTasks / totalTasks) * 100);
    }

    card.innerHTML = `
                <div class="project-header">
            <h3 style="font-size:1.25rem;">${project.proj_name}</h3>
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
            Client: ${project.proj_client ? project.proj_client : 'N/A'}
                </div>
                    <div class="project-dates" style="display:flex;flex-direction:column;align-items:flex-start;">
            <span title="Start date" style="font-size:0.97em;color:#7d8da1;"><b>Start:</b> ${startDate}</span>
            <span title="Due date" style="font-size:0.97em;color:#7d8da1;margin-top:0.3em;"><b>Due:</b> ${endDate}</span>
                    </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:0.3em;">
                    <div></div>
            <div class="task-count" style="display:flex;align-items:center;">
                <span style="font-weight:600;color:#7380ec;font-size:1.1em;">
                    ${project.tasks ? project.tasks.length : 0} Tasks
                        </span>
                    </div>
                </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;margin-top:0.3em;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                <div style="width:${projectProgress}%;background:${projectProgress === 100 ? '#28a745' : '#7380ec'};height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
            <span style="font-size:0.9em;color:#7d8da1;margin-top:0.2em;">${projectProgress}% Complete</span>
        </div>
        <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
            <b>Status:</b> ${status}
        </div>
        <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
            <b>Created At:</b> ${createdAt}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
            <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${statusColor};color:white;">
                        ${status}
                    </span>
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
        if (onOpen) onOpen(project);
        dropdown.classList.remove("show");
    });
    card.querySelector(".archive-btn").addEventListener("click", () => {
        alert(`Project "${project.proj_name}" archived.`);
        dropdown.classList.remove("show");
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete project "${project.proj_name}"? This will also delete all tasks and subtasks associated with this project.`)) {
            deleteProject(project.proj_id);
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
        e.preventDefault();
        e.stopPropagation();
        showProjectDetails(project);
    });

    // Handle card click for navigation only
    card.addEventListener("click", function (e) {
        if (
            e.target.closest('.dropdown-menu') ||
            e.target.classList.contains('three-dots') ||
            e.target.classList.contains('details-btn')
        ) {
            return;
        }
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
    card.setAttribute("aria-label", `Task: ${task.task_name}, details: ${task.task_description || 'No details'}`);

    // Truncate description to 2 lines
    let desc = task.task_description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Priority color (assuming priority is stored in task_priority or default to Medium)
    let priority = task.task_priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    // Status calculation
    let status = task.task_status === 1 ? 'Active' : task.task_status === 2 ? 'Completed' : 'Pending';
    const now = new Date();
    if (task.task_deadline && status !== 'Completed') {
        if (now > new Date(task.task_deadline)) status = 'Delayed';
    }

    // Progress bar (subtasks completed / total) - improved calculation
    let progress = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.subtask_status === 2).length;
        progress = Math.round((completed / task.subtasks.length) * 100);
    } else {
        progress = task.task_progress || 0;
    }

    // Employee name from database
    let empName = task.employee_name || task.employee_user_id || task.task_employee_id || "N/A";

    card.innerHTML = `
                <div class="task-header">
                    <h3 style="font-size:1.15rem;">${task.task_name}</h3>
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
                    <span style="font-size:0.97em;color:#7d8da1;"><b>Employee:</b> ${empName}</span>
                    <span title="Deadline" style="font-size:0.97em;color:#7d8da1;"><b>Deadline:</b> ${task.task_deadline ? formatDateTime(task.task_deadline) : 'N/A'}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:0.3em;">
                    <div></div>
                    <div class="subtask-count" style="display:flex;align-items:center;">
                        <span style="font-weight:600;color:#7380ec;font-size:1.1em;">
                            ${task.subtasks ? task.subtasks.length : 0} Subtasks
                        </span>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-start;margin-top:0.3em;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                        <div style="width:${progress}%;background:${progress === 100 ? '#28a745' : '#7380ec'};height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                    <span style="font-size:0.9em;color:#7d8da1;margin-top:0.2em;">${progress}% Complete</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
                    <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                        ${status}
                    </span>
                    <span style="font-size:0.97em;color:#7d8da1;text-align:right;">
                        ${task.task_created_at ? formatDateTime(task.task_created_at) : ''}
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
        if (confirm(`Are you sure you want to delete task "${task.task_name}"? This will also delete all subtasks associated with this task.`)) {
            deleteTask(task.task_id);
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
async function createSubtaskCard(subtask) {
    const card = document.createElement("div");
    card.classList.add("task-card");
    card.setAttribute("role", "listitem");
    card.tabIndex = 0;
    card.setAttribute("aria-label", `Subtask: ${subtask.subtask_name}, details: ${subtask.subtask_description || 'No details'}`);

    // Truncate description to 2 lines
    let desc = subtask.subtask_description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }

    // Priority color
    let priority = subtask.subtask_priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    // Status calculation
    let status = subtask.subtask_status === 1 ? 'Active' : subtask.subtask_status === 2 ? 'Completed' : 'Pending';
    const now = new Date();
    if (subtask.subtask_deadline && status !== 'Completed') {
        if (now > new Date(subtask.subtask_deadline)) status = 'Delayed';
    }

    // Progress bar - show 100% if completed, otherwise use subtask progress
    let progress = subtask.subtask_status === 2 ? 100 : (subtask.subtask_progress || 0);

    // Employee assignments: use assigned_employees from backend only
    let assignedEmployees = subtask.assigned_employees || 'Not assigned';

    // Load attachments for this subtask
    let attachments = [];
    let employeeAttachments = [];
    try {
        const response = await fetch(`/api/projects/subtask-attachments/${subtask.subtask_id}`);
        if (response.ok) {
            attachments = await response.json();
            // Separate admin attachments from employee attachments
            const adminUserId = getAdminUserId();
            employeeAttachments = attachments.filter(att => att.subatt_uploaded_by !== adminUserId);
            attachments = attachments.filter(att => att.subatt_uploaded_by === adminUserId);
        }
    } catch (error) {
        console.error('❌ Error loading attachments:', error);
    }

    console.log('🔍 Rendering subtask details with', attachments.length, 'admin attachments and', employeeAttachments.length, 'employee attachments');

    // Attachments display
    let attachmentLinks = '';
    if (attachments.length > 0) {
        attachmentLinks = `<a href="#" class="download-all-attachments" style="font-size:1.1em;color:#7380ec;text-decoration:underline;cursor:pointer;" title="Download all attachments">${attachments.length} file${attachments.length > 1 ? 's' : ''} attached <span class="material-icons-sharp" style="font-size:1em;vertical-align:middle;">download</span></a>`;
    }

    card.innerHTML = `
                <div class="task-header">
                    <h3 style="font-size:1.15rem;">${subtask.subtask_name}</h3>
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
                    <b>Employee(s):</b> ${assignedEmployees}
                </div>
                <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
                    <b>Deadline:</b> ${subtask.subtask_deadline ? formatDateTime(subtask.subtask_deadline) : 'N/A'}
                </div>
                ${attachmentLinks ? `<div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;"><b>Attachment(s):</b> ${attachmentLinks}</div>` : ''}
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                    <div class="progress-bar" style="background:#eee;border-radius:8px;height:10px;width:100%;margin:0.3rem 0 0.3rem 0;">
                        <div style="width:${progress}%;background:${progress === 100 ? '#28a745' : '#7380ec'};height:100%;border-radius:8px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.3em;">
                    <span class="status-label" style="padding:2px 12px;border-radius:8px;font-size:1em;background:${status === 'Completed' ? '#28a745' : status === 'Delayed' ? '#dc3545' : '#f0ad4e'};color:white;">
                        ${status}
                    </span>
                    <span style="font-size:0.97em;color:#7d8da1;text-align:right;">
                        ${subtask.subtask_created_at ? formatDateTime(subtask.subtask_created_at) : ''}
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
        if (confirm(`Are you sure you want to delete subtask "${subtask.subtask_name}"?`)) {
            deleteSubtask(subtask.subtask_id);
        }
        dropdown.classList.remove("show");
    });

    // Download all attachments handler (works for 1 or more files)
    if (attachments.length > 0) {
        card.querySelector('.download-all-attachments').addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            attachments.forEach(attachment => {
                const a = document.createElement('a');
                a.href = attachment.subatt_file_path;
                a.download = attachment.subatt_file_name;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
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

    card.__subtaskId = subtask.subtask_id;
    card.setAttribute('data-subtask-id', subtask.subtask_id);

    return card;
}

// renderTeams function to display teams
function renderTeams() {
    console.log('🔍 Rendering teams, count:', teams.length);
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
    teams.forEach((team, index) => {
        console.log(`🔍 Creating card for team ${index}:`, team);
        const card = createTeamCard(team, openTeamFolder);
        teamCardsContainer.appendChild(card);
    });
    console.log('🔍 Team cards created:', teamCardsContainer.children.length);
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
async function renderTasks() {
    sectionTitle.textContent = "Tasks";
    projectsView.hidden = true;
    tasksView.hidden = false;
    subtasksView.hidden = true;
    breadcrumb.hidden = false;
    currentTask = null;

    // Breadcrumb
    breadcrumbProject.textContent = currentProject.proj_name;
    breadcrumbProject.onclick = goBackToProjects;
    breadcrumbProject.onkeydown = (e) => { if (e.key === 'Enter') goBackToProjects(); };
    breadcrumbSubproject.hidden = true;
    breadcrumbCurrent.textContent = "Tasks";

    // Show and set back button
    backProjectsBtn.hidden = false;
    backProjectsBtn.innerHTML = `<span class="material-icons-sharp">arrow_back</span> Back to Projects`;
    backSubprojectBtn.hidden = true;

    // Title
    taskProjectTitle.textContent = `Tasks - ${currentProject.proj_name}`;

    // Load tasks from backend
    const tasks = await loadTasksByProject(currentProject.proj_id);
    
    // Load subtasks for each task to enable progress calculations
    for (let task of tasks) {
        try {
            const subtasksResponse = await fetch(`/api/projects/subtasks/${task.task_id}`);
            if (subtasksResponse.ok) {
                task.subtasks = await subtasksResponse.json();
            } else {
                task.subtasks = [];
            }
        } catch (error) {
            console.error(`❌ Error loading subtasks for task ${task.task_id}:`, error);
            task.subtasks = [];
        }
    }
    
    currentProject.tasks = tasks;

    // Show tasks for current project
    taskCardsContainer.innerHTML = "";
    (currentProject.tasks || []).forEach(task => {
        const card = createTaskCard(task, openTaskFolder);
        taskCardsContainer.appendChild(card);
    });
}

// Load tasks for current project
async function loadTasksForCurrentProject() {
    if (currentProject) {
        await renderTasks();
    }
}

// Load subtasks for current task
async function loadSubtasksForCurrentTask() {
    if (currentTask) {
        await renderSubtasks();
    }
}

// Load subtasks for a task from backend
async function loadSubtasksByTask(taskId) {
    console.log('🔍 Loading subtasks for task ID:', taskId);
    
    try {
        const response = await fetch(`/api/projects/subtasks/${taskId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const subtasks = await response.json();
        console.log('🔍 Subtasks loaded:', subtasks);
        return subtasks;
    } catch (error) {
        console.error('❌ Error loading subtasks for task:', error);
        showNotification(`Failed to load subtasks: ${error.message}`, 'error');
        return [];
    }
}

// Render subtasks list view
async function renderSubtasks() {
    sectionTitle.textContent = "Subtasks";
    projectsView.hidden = true;
    tasksView.hidden = true;
    subtasksView.hidden = false;
    breadcrumb.hidden = false;
    createSubtaskBtn.hidden = false;
    createSubtaskBtn.onclick = () => showModal('subtask');

    // Breadcrumb
    breadcrumbProject.textContent = currentProject.proj_name;
    breadcrumbProject.onclick = goBackToProjects;
    breadcrumbProject.onkeydown = (e) => { if (e.key === 'Enter') goBackToProjects(); };

    breadcrumbSubproject.hidden = false;
    breadcrumbSubproject.textContent = currentTask.task_name;
    breadcrumbSubproject.onclick = goBackToTasks;
    breadcrumbSubproject.onkeydown = (e) => { if (e.key === 'Enter') goBackToTasks(); };

    breadcrumbCurrent.textContent = "Subtasks";

    backProjectsBtn.hidden = true;
    backSubprojectBtn.hidden = true;
    backTasksBtn.hidden = false;
    backSubprojectBtn.innerHTML = `<span class="material-icons-sharp"> arrow_back </span> Back to Tasks`;

    // Title
    subtaskProjectTitle.textContent = `Subtasks - ${currentProject.proj_name} / ${currentTask.task_name}`;

    // Load subtasks from backend
    const subtasks = await loadSubtasksByTask(currentTask.task_id);
    currentTask.subtasks = subtasks;

    // Show subtasks for current task
    subtaskCardsContainer.innerHTML = "";
    for (const subtask of (currentTask.subtasks || [])) {
        const card = await createSubtaskCard(subtask);
        subtaskCardsContainer.appendChild(card);
    }

    addBulkDeleteButton();
    // Add checkboxes to each card
    Array.from(subtaskCardsContainer.children).forEach(card => {
        let subtaskId = card.__subtaskId;
        if (!subtaskId) {
            // Try to get from data attribute or fallback
            subtaskId = card.getAttribute('data-subtask-id');
        }
        if (!subtaskId && card.querySelector('h3')) {
            // Try to parse from title
            const h3 = card.querySelector('h3');
            subtaskId = h3 && h3.textContent && h3.textContent.match(/\((\d+)\)$/) ? RegExp.$1 : null;
        }
        // Add checkbox if not present
        if (!card.querySelector('.subtask-select-checkbox')) {
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'subtask-select-checkbox';
            cb.style = 'margin-right:0.7em;transform:scale(1.3);';
            cb.onclick = function(e) {
                e.stopPropagation();
                if (cb.checked) {
                    if (!selectedSubtaskIds.includes(subtaskId)) selectedSubtaskIds.push(subtaskId);
                } else {
                    selectedSubtaskIds = selectedSubtaskIds.filter(id => id !== subtaskId);
                }
            };
            card.insertBefore(cb, card.firstChild);
        }
    });
}

// Navigation functions
function openTeamFolder(team) {
    console.log('🔍 Team clicked:', team);
    console.log('🔍 Team ID:', team.team_id);
    console.log('🔍 Team name:', team.team_name);
    
    currentTeam = team;
    loadProjectsByTeam(team.team_id);
}

function openProjectFolder(project) {
    currentProject = project;
    renderTasks(); // This is now async but we don't need to await it here
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
            if (inputTeamName) inputTeamName.value = subtaskToEdit.team_name || '';
            if (inputTeamDesc) inputTeamDesc.value = subtaskToEdit.team_description || '';
            if (inputLeaderId) inputLeaderId.value = subtaskToEdit.leader_name ? `${subtaskToEdit.leader_name} (${subtaskToEdit.team_leader_id})` : '';
            modalForm.setAttribute('data-editing-team', 'true');
            modalForm.setAttribute('data-editing-team-name', subtaskToEdit.team_name);
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
        // Show project fields
        modalTitle.textContent = 'Create New Project';
        const createBtn = document.getElementById('create-btn');
        if (createBtn) createBtn.textContent = 'Create';
        if (inputName) inputName.style.display = 'block';
        const inputLabel = document.getElementById('input-label');
        if (inputLabel) inputLabel.style.display = 'block';
        if (inputDescription) inputDescription.style.display = 'block';
        const inputDescriptionLabel = document.getElementById('input-description-label');
        if (inputDescriptionLabel) inputDescriptionLabel.style.display = 'block';
        if (inputClient) inputClient.style.display = 'block';
        const inputClientLabel = document.getElementById('input-client-label');
        if (inputClientLabel) inputClientLabel.style.display = 'block';
        if (inputStartDate) inputStartDate.style.display = 'block';
        const inputStartDateLabel = document.getElementById('input-startdate-label');
        if (inputStartDateLabel) inputStartDateLabel.style.display = 'block';
        if (inputDeadline) inputDeadline.style.display = 'block';
        const inputDeadlineLabel = document.getElementById('input-deadline-label');
        if (inputDeadlineLabel) inputDeadlineLabel.style.display = 'block';
        if (priorityFieldWrapper) priorityFieldWrapper.style.display = 'block';
        if (inputName) inputName.focus();
    } else if (type === 'task') {
        // Show task fields
        modalTitle.textContent = 'Create New Task';
        const createBtn = document.getElementById('create-btn');
        if (createBtn) createBtn.textContent = 'Create';
        if (inputTaskName) inputTaskName.style.display = 'block';
        const inputTaskNameLabel = document.getElementById('input-task-name-label');
        if (inputTaskNameLabel) inputTaskNameLabel.style.display = 'block';
        if (taskPriorityFieldWrapper) taskPriorityFieldWrapper.style.display = 'block';
        if (inputTaskDesc) inputTaskDesc.style.display = 'block';
        const inputTaskDescLabel = document.getElementById('input-task-desc-label');
        if (inputTaskDescLabel) inputTaskDescLabel.style.display = 'block';
        if (inputTaskEmpid) inputTaskEmpid.style.display = 'block';
        const inputTaskEmpidLabel = document.getElementById('input-task-empid-label');
        if (inputTaskEmpidLabel) inputTaskEmpidLabel.style.display = 'block';
        if (inputTaskDeadline) inputTaskDeadline.style.display = 'block';
        const inputTaskDeadlineLabel = document.getElementById('input-task-deadline-label');
        if (inputTaskDeadlineLabel) inputTaskDeadlineLabel.style.display = 'block';
        if (inputTaskName) inputTaskName.focus();
        setTimeout(() => {
            setupTaskEmployeeAutocomplete();
        }, 100);
    } else if (type === 'subtask') {
        // Show subtask fields
        modalTitle.textContent = 'Create New Subtask';
        const createBtn = document.getElementById('create-btn');
        if (createBtn) createBtn.textContent = 'Create';
        
        console.log('🔍 DEBUG: Before resetting selectedEmployees');
        debugSelectedEmployees();
        
        // Reset selected employees array for new subtask creation
        selectedEmployees = [];
        console.log('🔍 Frontend: Subtask modal opened, selectedEmployees reset:', selectedEmployees);
        
        console.log('🔍 DEBUG: After resetting selectedEmployees');
        debugSelectedEmployees();
        
        if (inputSubtaskName) inputSubtaskName.style.display = 'block';
        const inputSubtaskNameLabel = document.getElementById('input-subtask-name-label');
        if (inputSubtaskNameLabel) inputSubtaskNameLabel.style.display = 'block';
        if (subtaskPriorityFieldWrapper) subtaskPriorityFieldWrapper.style.display = 'block';
        if (inputSubtaskDesc) inputSubtaskDesc.style.display = 'block';
        const inputSubtaskDescLabel = document.getElementById('input-subtask-desc-label');
        if (inputSubtaskDescLabel) inputSubtaskDescLabel.style.display = 'block';
        if (inputSubtaskEmpid) inputSubtaskEmpid.style.display = 'block';
        const inputSubtaskEmpidLabel = document.getElementById('input-subtask-empid-label');
        if (inputSubtaskEmpidLabel) inputSubtaskEmpidLabel.style.display = 'block';
        if (inputSubtaskDeadline) inputSubtaskDeadline.style.display = 'block';
        const inputSubtaskDeadlineLabel = document.getElementById('input-subtask-deadline-label');
        if (inputSubtaskDeadlineLabel) inputSubtaskDeadlineLabel.style.display = 'block';
        if (inputSubtaskPriority) inputSubtaskPriority.style.display = 'block';
        if (inputSubtaskAttachment) inputSubtaskAttachment.style.display = 'block';
        const inputSubtaskAttachmentLabel = document.getElementById('input-subtask-attachment-label');
        if (inputSubtaskAttachmentLabel) inputSubtaskAttachmentLabel.style.display = 'block';
        const subtaskEmpidSuggestions = document.getElementById('subtask-empid-suggestions');
        if (subtaskEmpidSuggestions) subtaskEmpidSuggestions.style.display = 'block';
        const selectedEmployeesDiv = document.getElementById('selected-employees');
        if (selectedEmployeesDiv) selectedEmployeesDiv.style.display = 'block';
        if (inputSubtaskName) inputSubtaskName.focus();
        setTimeout(() => {
            setupEmployeeAutocomplete();
            // Clear the selected employees display
            if (selectedEmployeesDiv) {
                selectedEmployeesDiv.innerHTML = '';
            }
        }, 100);
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
    console.log('🔍 DEBUG: Before closing modal');
    debugSelectedEmployees();
    
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
    
    // Reset selected employees array
    selectedEmployees = [];
    console.log('🔍 Frontend: Modal closed, selectedEmployees reset:', selectedEmployees);
    
    console.log('🔍 DEBUG: After closing modal');
    debugSelectedEmployees();
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
// loadTeams();

// loadTeams();

// flatpickr initialization - REMOVED (duplicate, handled in DOMContentLoaded)
// flatpickr("#input-startdate", {
//     enableTime: true,
//     dateFormat: "Y-m-d H:i",
//     allowInput: true,
//     wrap: false,
//     clickOpens: true,
//     minDate: "today",
//     plugins: [new confirmDatePlugin({})]
// });
// flatpickr("#input-deadline", {
//     enableTime: true,
//     dateFormat: "Y-m-d H:i",
//     allowInput: true,
//     wrap: false,
//     clickOpens: true,
//     minDate: "today",
//     plugins: [new confirmDatePlugin({})]
// });
// flatpickr("#input-task-deadline", {
//     enableTime: true,
//     dateFormat: "Y-m-d H:i",
//     allowInput: true,
//     wrap: false,
//     clickOpens: true,
//     minDate: "today",
//     plugins: [new confirmDatePlugin({})]
// });
// flatpickr("#input-subtask-deadline", {
//     enableTime: true,
//     dateFormat: "Y-m-d H:i",
//     allowInput: true,
//     wrap: false,
//     clickOpens: true,
//     minDate: "today",
//     plugins: [new confirmDatePlugin({})]
// });

// Function to show project details
function showProjectDetails(project) {
    const modal = projectDetailsModal;
    const content = document.getElementById("project-details-content");
    content.innerHTML = `
                <div style="margin-bottom: 2rem;">
            <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${project.proj_name}</h2>
                        </div>
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Project Details</h3>
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                <strong style="color:#363949;">Project ID:</strong>
                <span style="color:#677483;">${project.proj_id}</span>
                <strong style="color:#363949;">Name:</strong>
                <span style="color:#677483;">${project.proj_name}</span>
                <strong style="color:#363949;">Description:</strong>
                <span style="color:#677483;">${project.proj_description}</span>
                <strong style="color:#363949;">Status:</strong>
                <span style="color:#677483;">${project.proj_status}</span>
                        <strong style="color:#363949;">Start Date:</strong>
                <span style="color:#677483;">${project.proj_start_date ? formatDateTime(project.proj_start_date) : 'N/A'}</span>
                        <strong style="color:#363949;">Deadline:</strong>
                <span style="color:#677483;">${project.proj_deadline ? formatDateTime(project.proj_deadline) : 'N/A'}</span>
                <strong style="color:#363949;">Created At:</strong>
                <span style="color:#677483;">${project.proj_created_at ? formatDateTime(project.proj_created_at) : 'N/A'}</span>
                <strong style="color:#363949;">Updated At:</strong>
                <span style="color:#677483;">${project.proj_updated_at ? formatDateTime(project.proj_updated_at) : 'N/A'}</span>
                <strong style="color:#363949;">Created By (Admin ID):</strong>
                <span style="color:#677483;">${project.proj_created_by}</span>
                <strong style="color:#363949;">Team ID:</strong>
                <span style="color:#677483;">${project.team_id}</span>
                    </div>
                </div>
    `;
    modal.style.display = 'flex';
    // Close button handler
    const closeBtn = document.getElementById('close-project-details');
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
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
    let status = task.task_status === 1 ? 'Active' : task.task_status === 2 ? 'Completed' : 'Pending';
    const now = new Date();
    if (task.task_deadline && status !== 'Completed') {
        if (now > new Date(task.task_deadline)) status = 'Delayed';
    }

    // Priority color
    let priority = task.task_priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';

    content.innerHTML = `
                <div style="margin-bottom: 2rem;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                        <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${task.task_name}</h2>
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
                    <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${task.task_description || 'No details provided.'}</p>
                    
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                        <strong style="color:#363949;">Employee:</strong>
                        <span style="color:#677483;">
                            ${task.employee_name ? `${task.employee_name} (${task.employee_user_id})` : task.employee_user_id || task.task_employee_id || 'Not assigned'}
                        </span>
                        <strong style="color:#363949;">Deadline:</strong>
                        <span style="color:#677483;">${task.task_deadline ? formatDateTime(task.task_deadline) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Created:</strong>
                        <span style="color:#677483;">${task.task_created_at ? formatDateTime(task.task_created_at) : 'N/A'}</span>
                        
                        <strong style="color:#363949;">Task ID:</strong>
                        <span style="color:#677483;">${task.task_id || 'N/A'}</span>
                        
                        <strong style="color:#363949;">Project ID:</strong>
                        <span style="color:#677483;">${task.task_project_id || 'N/A'}</span>
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
            inputTaskName.value = task.task_name || '';
            inputTaskDesc.value = task.task_description || '';
            inputTaskEmpid.value = task.employee_name ? `${task.employee_name} (${task.employee_user_id})` : task.employee_user_id || task.task_employee_id || '';
            inputTaskDeadline.value = task.task_deadline ? toFlatpickrString(task.task_deadline) : '';
            inputTaskPriority.value = task.task_priority || 'Medium';
            // Change heading and button
            modalTitle.textContent = 'Update Task';
            document.getElementById('create-btn').textContent = 'Update';
        }, 100);
        modal.style.display = 'none';
    };
}

// Function to show subtask details
async function showSubtaskDetails(subtask) {
    console.log('🔍 Opening subtask details for:', subtask);
    const modal = subtaskDetailsModal;
    const content = document.getElementById("subtask-details-content");

    // Fetch latest subtask details from backend (with assigned employee names)
    let subtaskDetails = subtask;
    try {
        const response = await fetch(`/api/projects/subtask/${subtask.subtask_id}`);
        if (response.ok) {
            subtaskDetails = await response.json();
        }
    } catch (err) {
        console.error('❌ Failed to fetch subtask details:', err);
    }

    let status = subtaskDetails.subtask_status === 1 ? 'Active' : subtaskDetails.subtask_status === 2 ? 'Completed' : 'Pending';
    const now = new Date();
    if (subtaskDetails.subtask_deadline && status !== 'Completed') {
        if (now > new Date(subtaskDetails.subtask_deadline)) status = 'Delayed';
    }
    let priority = subtaskDetails.subtask_priority || 'Medium';
    let priorityColor = priority === 'High' ? '#ff4d4f' : priority === 'Medium' ? '#ffbb55' : '#41f1b6';
    
    // Employee assignments
    let assignedEmployees = subtaskDetails.assigned_employees || 'Not assigned';

    // Load attachments for this subtask
    let attachments = [];
    let employeeAttachments = [];
    try {
        const response = await fetch(`/api/projects/subtask-attachments/${subtask.subtask_id}`);
        if (response.ok) {
            attachments = await response.json();
            // Separate admin attachments from employee attachments
            const adminUserId = getAdminUserId();
            employeeAttachments = attachments.filter(att => att.subatt_uploaded_by !== adminUserId);
            attachments = attachments.filter(att => att.subatt_uploaded_by === adminUserId);
        }
    } catch (error) {
        console.error('❌ Error loading attachments:', error);
    }

    console.log('🔍 Rendering subtask details with', attachments.length, 'admin attachments and', employeeAttachments.length, 'employee attachments');

    content.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0;">${subtaskDetails.subtask_name}</h2>
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
            <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${subtaskDetails.subtask_description || 'No details provided.'}</p>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                <strong style="color:#363949;">Employee(s):</strong>
                <span style="color:#677483;">
                    ${assignedEmployees}
                </span>
                <strong style="color:#363949;">Deadline:</strong>
                <span style="color:#677483;">${subtaskDetails.subtask_deadline ? formatDateTime(subtaskDetails.subtask_deadline) : 'N/A'}</span>
                <strong style="color:#363949;">Created:</strong>
                <span style="color:#677483;">${subtaskDetails.subtask_created_at ? formatDateTime(subtaskDetails.subtask_created_at) : 'N/A'}</span>
                <strong style="color:#363949;">Subtask ID:</strong>
                <span style="color:#677483;">${subtaskDetails.subtask_id || 'N/A'}</span>
                <strong style="color:#363949;">Task ID:</strong>
                <span style="color:#677483;">${subtaskDetails.task_id || 'N/A'}</span>
            </div>
        </div>
        <!-- (rest of the modal rendering remains unchanged) -->
    `;
    // ... (rest of the modal logic remains unchanged)
    modal.style.display = 'flex';
    const closeBtn = document.getElementById('close-subtask-details');
    closeBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    // ... (rest of the handlers remain unchanged)
}

// Handle team update with backend API
async function handleTeamUpdate() {
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
    
    // Get the team ID from the form data
    const editingTeamName = modalForm.getAttribute('data-editing-team-name');
    const teamToUpdate = teams.find(t => t.team_name === editingTeamName);
    
    if (!teamToUpdate) {
        showNotification('Team not found for update', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/update-team/${teamToUpdate.team_id}`, {
            method: 'PUT',
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
            showNotification('Team updated successfully!', 'success');
            closeModal();
            // Reload teams to show the updated team
            await loadTeams();
        } else {
            showNotification(result.error || 'Failed to update team', 'error');
        }
    } catch (error) {
        console.error('Team update error:', error);
        showNotification('Failed to update team. Please try again.', 'error');
    }
}

// Close modal on cancel or X icon - REMOVED (duplicate, handled in DOMContentLoaded)
// closeModalBtn.addEventListener('click', () => {
//     closeModal();
// });
// modalCloseIcon.addEventListener('click', () => {
//     closeModal();
// });

// Helper function to check if a project/task/subtask exists in a list
function projectExistsInList(list, name) {
    return list && list.some(item => item.name && item.name.toLowerCase() === name.toLowerCase());
}

// --- 2. Fetch projects by team ---
async function loadProjectsByTeam(teamId) {
    console.log('🔍 Loading projects for team ID:', teamId);
    console.log('🔍 Current team object:', currentTeam);
    
    try {
        const url = `/api/projects/by-team/${teamId}`;
        console.log('🔍 Fetching from URL:', url);
        
        const res = await fetch(url);
        console.log('🔍 Response status:', res.status);
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const projects = await res.json();
        console.log('🔍 Projects received:', projects);
        
        // Load tasks for each project to enable progress calculations
        for (let project of projects) {
            try {
                const tasksResponse = await fetch(`/api/projects/tasks/${project.proj_id}`);
                if (tasksResponse.ok) {
                    project.tasks = await tasksResponse.json();
                } else {
                    project.tasks = [];
                }
            } catch (error) {
                console.error(`❌ Error loading tasks for project ${project.proj_id}:`, error);
                project.tasks = [];
            }
        }
        
        currentTeam.projects = projects;
        renderProjects();
    } catch (err) {
        console.error('❌ Error loading projects for team:', err);
        console.error('❌ Team ID was:', teamId);
        showNotification(`Failed to load projects for team: ${err.message}`, 'error');
    }
}

console.log('projects.js loaded');

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", async () => {
    const emp_user_id = sessionStorage.getItem("emp_user_id");
    if (!emp_user_id) {
        alert("Login required");
        window.location.href = "../login.html";
        return;
    }

    console.log('🔍 Page loaded, admin user ID:', emp_user_id);
    
    // Set modal reference after DOM is loaded
    projectModal = document.getElementById("modal");
    
    // Add event listeners for modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            closeModal();
        });
    }
    if (modalCloseIcon) {
        modalCloseIcon.addEventListener('click', () => {
            closeModal();
        });
    }
    
    // Add event listeners for create buttons
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
            showModal('project');
        });
    }
    if (createTeamBtn) {
        createTeamBtn.addEventListener('click', () => {
            console.log('Create Team button clicked');
            showModal('team');
        });
    }
    if (createTaskBtn) {
        createTaskBtn.addEventListener('click', () => {
            if (!currentProject) {
                alert('No project selected for creating a task.');
                return;
            }
            showModal('task');
        });
    }
    
    // Add event listeners for back buttons
    if (backToTeamsBtn) {
        backToTeamsBtn.addEventListener('click', () => {
            renderTeams();
        });
    }
    if (backProjectsBtn) {
        backProjectsBtn.addEventListener('click', () => {
            goBackToProjects();
        });
    }
    if (backSubprojectBtn) {
        backSubprojectBtn.addEventListener('click', () => {
            goBackToTasks();
        });
    }
    if (backTasksBtn) {
        backTasksBtn.addEventListener('click', () => {
            goBackToTasks();
        });
    }
    
    // Load employees and teams for this admin
    await Promise.all([loadEmployees(), loadTeams()]);
    
    // Initialize flatpickr date pickers
    if (typeof flatpickr !== 'undefined') {
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
    }
});

// Load employees from backend for autocomplete
async function loadEmployees() {
    try {
        const response = await fetch('/api/projects/employees');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        employees = data.map(emp => ({
            id: emp.emp_user_id,
            name: `${emp.emp_first_name} ${emp.emp_last_name}`
        }));
        console.log('🔍 Employees loaded:', employees);
    } catch (error) {
        console.error("Failed to load employees:", error);
    }
}

// Load tasks for a project
async function loadTasksByProject(projectId) {
    console.log('🔍 Loading tasks for project ID:', projectId);
    
    try {
        const response = await fetch(`/api/projects/tasks/${projectId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        console.log('🔍 Tasks loaded:', tasks);
        return tasks;
    } catch (error) {
        console.error('❌ Error loading tasks for project:', error);
        showNotification(`Failed to load tasks: ${error.message}`, 'error');
        return [];
    }
}

// Test function to debug selectedEmployees issue
function debugSelectedEmployees() {
    console.log('🔍 DEBUG: Current selectedEmployees state:');
    console.log('🔍 DEBUG: selectedEmployees array:', selectedEmployees);
    console.log('🔍 DEBUG: selectedEmployees length:', selectedEmployees.length);
    console.log('🔍 DEBUG: selectedEmployees type:', typeof selectedEmployees);
    console.log('🔍 DEBUG: Is selectedEmployees an array?', Array.isArray(selectedEmployees));
    if (selectedEmployees.length > 0) {
        console.log('🔍 DEBUG: First employee:', selectedEmployees[0]);
        console.log('🔍 DEBUG: All employee IDs:', selectedEmployees.map(e => e.id));
    }
}

let selectedEmployees = [];
function setupEmployeeAutocomplete() {
    const input = document.getElementById('input-subtask-empid');
    const suggestions = document.getElementById('subtask-empid-suggestions');
    const selectedDiv = document.getElementById('selected-employees');
    
    console.log('🔍 setupEmployeeAutocomplete called');
    console.log('🔍 Global employees array:', employees);
    console.log('🔍 Global employees length:', employees.length);
    
    // Filter employees to only show those with IDs starting with "emp"
    const employeeEmployees = employees.filter(emp => emp.id.startsWith('emp'));
    console.log('🔍 Filtered employeeEmployees:', employeeEmployees);
    console.log('🔍 Filtered employeeEmployees length:', employeeEmployees.length);
    
    console.log('🔍 Current selectedEmployees before setup:', selectedEmployees);
    console.log('🔍 Current selectedEmployees length:', selectedEmployees.length);

    // Helper to render selected chips
    function renderSelected() {
        console.log('🔍 renderSelected called, selectedEmployees:', selectedEmployees);
        selectedDiv.innerHTML = '';
        selectedEmployees.forEach(emp => {
            const chip = document.createElement('span');
            chip.className = 'selected-employee-chip';
            chip.textContent = `${emp.name} (${emp.id})`;
            chip.style.cssText = `
                display: inline-block;
                background: #7380ec;
                color: white;
                padding: 0.3em 0.8em;
                border-radius: 1rem;
                font-size: 0.9em;
                margin: 0.2em;
                position: relative;
            `;
            const remove = document.createElement('span');
            remove.className = 'remove-chip';
            remove.textContent = '×';
            remove.style.cssText = `
                margin-left: 0.5em;
                cursor: pointer;
                font-weight: bold;
                font-size: 1.1em;
            `;
            remove.onclick = () => {
                selectedEmployees = selectedEmployees.filter(e => e.id !== emp.id);
                console.log('🔍 Employee removed, new selectedEmployees:', selectedEmployees);
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
        
        const filtered = employeeEmployees.filter(emp =>
            emp.id.toLowerCase().includes(val) ||
            emp.name.toLowerCase().includes(val)
        ).filter(emp => !selectedEmployees.some(e => e.id === emp.id));
        
        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-suggestion';
            noResults.textContent = 'No employees found';
            noResults.style.color = '#999';
            noResults.style.fontStyle = 'italic';
            suggestions.appendChild(noResults);
        } else {
        filtered.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${emp.name}</span>
                        <span style="color: #7380ec; font-size: 0.9em;">${emp.id}</span>
                    </div>
                `;
            div.onclick = () => {
                    console.log('🔍 Employee clicked:', emp);
                    console.log('🔍 selectedEmployees before adding:', selectedEmployees);
                selectedEmployees.push(emp);
                    console.log('🔍 selectedEmployees after adding:', selectedEmployees);
                renderSelected();
                input.value = '';
                suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
            };
            suggestions.appendChild(div);
        });
        }
        
        suggestions.style.display = filtered.length > 0 || val.length > 0 ? 'block' : 'none';
    };

    // Hide suggestions on blur
    input.onblur = function () {
        setTimeout(() => { 
            suggestions.innerHTML = ''; 
            suggestions.style.display = 'none';
        }, 150);
    };

    // On Enter, select first suggestion if available
    input.onkeydown = function (e) {
        if (e.key === 'Enter' && suggestions.firstChild && !suggestions.firstChild.textContent.includes('No employees found')) {
            e.preventDefault();
            suggestions.firstChild.click();
        }
    };

    // If editing, pre-fill selected employees
    if (modalForm.getAttribute('data-editing-subtask') === 'true') {
        const editingName = modalForm.getAttribute('data-editing-subtask-name');
        const subtask = currentTask.subtasks.find(st => st.subtask_name === editingName);
        if (subtask && subtask.assigned_employees && subtask.assigned_employees !== 'Not assigned') {
            // Parse assigned employees from the string format "Name (ID), Name2 (ID2)"
            const employeeStrings = subtask.assigned_employees.split(', ');
            selectedEmployees = employeeStrings.map(empStr => {
                const match = empStr.match(/^(.+?) \((.+?)\)$/);
                if (match) {
                    return { name: match[1], id: match[2] };
                }
                return null;
            }).filter(emp => emp !== null);
            renderSelected();
        }
    } else {
        // Don't reset selectedEmployees here since we already reset it when modal opens
        // selectedEmployees = [];
        renderSelected();
    }
} // <-- This closes setupEmployeeAutocomplete properly

// Setup leader autocomplete for team creation
function setupLeaderAutocomplete() {
    const input = document.getElementById('input-leader-id');
    const suggestions = document.getElementById('leader-id-suggestions');
    
    if (!input || !suggestions) {
        console.warn('Leader autocomplete elements not found');
        return;
    }

    // Filter employees to only show those with IDs starting with "emp"
    const employeeEmployees = employees.filter(emp => emp.id.startsWith('emp'));

    // Helper to show suggestions
    input.oninput = function () {
        const val = input.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!val) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filtered = employeeEmployees.filter(emp =>
            emp.id.toLowerCase().includes(val) ||
            emp.name.toLowerCase().includes(val)
        );
        
        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-suggestion';
            noResults.textContent = 'No employees found';
            noResults.style.color = '#999';
            noResults.style.fontStyle = 'italic';
            suggestions.appendChild(noResults);
        } else {
        filtered.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'autocomplete-suggestion';
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${emp.name}</span>
                        <span style="color: #7380ec; font-size: 0.9em;">${emp.id}</span>
                    </div>
                `;
            div.onclick = () => {
                    input.value = `${emp.name} (${emp.id})`;
                    suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
                };
                suggestions.appendChild(div);
            });
        }
        
        suggestions.style.display = filtered.length > 0 || val.length > 0 ? 'block' : 'none';
    };

    // Hide suggestions on blur
    input.onblur = function () {
        setTimeout(() => { 
            suggestions.innerHTML = ''; 
            suggestions.style.display = 'none';
        }, 150);
    };

    // On Enter, select first suggestion if available
    input.onkeydown = function (e) {
        if (e.key === 'Enter' && suggestions.firstChild && !suggestions.firstChild.textContent.includes('No employees found')) {
            e.preventDefault();
            suggestions.firstChild.click();
        }
    };
}

// Setup task employee autocomplete for task creation
function setupTaskEmployeeAutocomplete() {
    const input = document.getElementById('input-task-empid');
    const suggestions = document.getElementById('task-empid-suggestions');
    
    if (!input || !suggestions) {
        console.warn('Task employee autocomplete elements not found');
        return;
    }

    // Filter employees to only show those with IDs starting with "emp"
    const employeeEmployees = employees.filter(emp => emp.id.startsWith('emp'));

    // Helper to show suggestions
    input.oninput = function () {
        const val = input.value.trim().toLowerCase();
        suggestions.innerHTML = '';
        if (!val) {
            suggestions.style.display = 'none';
            return;
        }
        
        const filtered = employeeEmployees.filter(emp =>
            emp.id.toLowerCase().includes(val) ||
            emp.name.toLowerCase().includes(val)
        );
        
        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-suggestion';
            noResults.textContent = 'No employees found';
            noResults.style.color = '#999';
            noResults.style.fontStyle = 'italic';
            suggestions.appendChild(noResults);
        } else {
            filtered.forEach(emp => {
                const div = document.createElement('div');
                div.className = 'autocomplete-suggestion';
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${emp.name}</span>
                        <span style="color: #7380ec; font-size: 0.9em;">${emp.id}</span>
                    </div>
                `;
                div.onclick = () => {
                    input.value = `${emp.name} (${emp.id})`;
                    suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
                };
                suggestions.appendChild(div);
            });
        }
        
        suggestions.style.display = filtered.length > 0 || val.length > 0 ? 'block' : 'none';
    };

    // Hide suggestions on blur
    input.onblur = function () {
        setTimeout(() => { 
            suggestions.innerHTML = ''; 
            suggestions.style.display = 'none';
        }, 150);
    };

    // On Enter, select first suggestion if available
    input.onkeydown = function (e) {
        if (e.key === 'Enter' && suggestions.firstChild && !suggestions.firstChild.textContent.includes('No employees found')) {
            e.preventDefault();
            suggestions.firstChild.click();
        }
    };
}

// Form submission handler
modalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const type = modalForm.getAttribute('data-type');
    
    if (type === 'team') {
        const isEditing = modalForm.getAttribute('data-editing-team') === 'true';
        if (isEditing) {
            await handleTeamUpdate();
        } else {
        await handleTeamCreation();
        }
    } else if (type === 'project') {
        // Handle project creation (DB logic)
        const name = inputName.value.trim();
        const description = inputDescription.value.trim();
        const client = inputClient.value.trim();
        const startdate = inputStartDate.value;
        const deadline = inputDeadline.value;
        const status = 1; // Default status (can be changed to a select if needed)
        const adminUserId = getAdminUserId();
        const teamId = currentTeam && currentTeam.team_id;
        
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
        if (!teamId) {
            alert('No team selected for creating a project.');
            closeModal();
            return;
        }
        
        // Send to backend
        try {
            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    proj_name: name,
                    proj_description: description,
                    proj_status: status,
                    proj_start_date: startdate,
                    proj_deadline: deadline,
                    proj_created_by: adminUserId,
                    team_id: teamId
                })
            });
            const result = await res.json();
            if (result.success) {
                showNotification('Project created successfully!', 'success');
        closeModal();
                // Reload projects for this team
                await loadProjectsByTeam(teamId);
            } else {
                showNotification(result.error || 'Failed to create project', 'error');
            }
        } catch (err) {
            showNotification('Failed to create project. Please try again.', 'error');
        }
    } else if (type === 'task') {
        // Handle task creation (DB logic)
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
        if (!taskEmpid) {
            alert('Please select an employee.');
            inputTaskEmpid.focus();
            return;
        }
        if (!currentProject) {
            alert('No project is open to add a task.');
            closeModal();
            return;
        }
        
        const adminUserId = getAdminUserId();
        if (!adminUserId) {
            alert('No admin user ID found. Please log in again.');
            return;
        }

        // Send to backend
        try {
            const res = await fetch('/api/projects/create-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_name: taskName,
                    task_description: taskDesc,
                    task_priority: taskPriority,
                    task_employee_id: taskEmpid,
                    task_deadline: taskDeadline,
                    project_id: currentProject.proj_id,
                    admin_user_id: adminUserId
                })
            });
            const result = await res.json();
            if (result.success) {
                showNotification('Task created successfully!', 'success');
        closeModal();
                // Reload tasks for this project
                await loadTasksForCurrentProject();
            } else {
                showNotification(result.error || 'Failed to create task', 'error');
            }
        } catch (err) {
            showNotification('Failed to create task. Please try again.', 'error');
        }
    } else if (type === 'subtask') {
        // Handle subtask creation with file uploads
        console.log('🔍 Starting subtask creation...');
        debugSelectedEmployees(); // Debug call
        console.log('🔍 Frontend: selectedEmployees array before processing:', selectedEmployees);
        console.log('🔍 Frontend: selectedEmployees length:', selectedEmployees.length);
        
        const subtaskName = inputSubtaskName.value.trim();
        const subtaskDesc = inputSubtaskDesc.value.trim();
        const subtaskDeadline = inputSubtaskDeadline.value;
        const subtaskPriority = inputSubtaskPriority.value;
        const subtaskEmpids = selectedEmployees.map(e => e.id);
        const subtaskAttachment = inputSubtaskAttachment.files ? Array.from(inputSubtaskAttachment.files) : [];
        
        console.log('🔍 Frontend: selectedEmployees array:', selectedEmployees);
        console.log('🔍 Frontend: subtaskEmpids array:', subtaskEmpids);
        console.log('🔍 Frontend: selectedEmployees length:', selectedEmployees.length);
        
        debugSelectedEmployees(); // Debug call before form submission
        
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
        
        const adminUserId = getAdminUserId();
        if (!adminUserId) {
            alert('No admin user ID found. Please log in again.');
            return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('subtask_name', subtaskName);
        formData.append('subtask_description', subtaskDesc);
        formData.append('task_id', currentTask.task_id);
        formData.append('employee_ids', JSON.stringify(subtaskEmpids));
        formData.append('subtask_deadline', subtaskDeadline);
        formData.append('subtask_priority', subtaskPriority);
        formData.append('admin_user_id', adminUserId);
        
        // Append files
        for (let i = 0; i < subtaskAttachment.length; i++) {
            formData.append('attachments', subtaskAttachment[i]);
        }

        // Send to backend
        try {
            console.log('🔍 Creating subtask with data:', {
                subtaskName,
                subtaskDesc,
                taskId: currentTask.task_id,
                subtaskEmpids,
                subtaskDeadline,
                subtaskPriority,
                adminUserId,
                fileCount: subtaskAttachment.length
            });
            
            console.log('🔍 Sending request to /api/projects/create-subtask');
            const res = await fetch('/api/projects/create-subtask', {
                method: 'POST',
                body: formData
            });
            
            console.log('🔍 Response status:', res.status);
            const result = await res.json();
            console.log('🔍 Response result:', result);
            
            if (result.success) {
                showNotification('Subtask created successfully!', 'success');
        closeModal();
                // Reload subtasks for this task
                console.log('🔍 Reloading subtasks...');
                await loadSubtasksForCurrentTask();
            } else {
                showNotification(result.error || 'Failed to create subtask', 'error');
            }
        } catch (err) {
            console.error('❌ Subtask creation error:', err);
            showNotification('Failed to create subtask. Please try again.', 'error');
        }
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

// Delete functions
async function deleteTeam(teamId) {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        showNotification('No admin user ID found. Please log in again.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/projects/delete-team/${teamId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                admin_user_id: adminUserId
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Team deleted successfully!', 'success');
            // Reload teams to reflect the deletion
            await loadTeams();
        } else {
            showNotification(result.error || 'Failed to delete team', 'error');
        }
    } catch (error) {
        console.error('Team deletion error:', error);
        showNotification('Failed to delete team. Please try again.', 'error');
    }
}

async function deleteProject(projectId) {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        showNotification('No admin user ID found. Please log in again.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/projects/delete-project/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                admin_user_id: adminUserId
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Project deleted successfully!', 'success');
            // Reload projects for current team
            if (currentTeam) {
                await loadProjectsByTeam(currentTeam.team_id);
            }
        } else {
            showNotification(result.error || 'Failed to delete project', 'error');
        }
    } catch (error) {
        console.error('Project deletion error:', error);
        showNotification('Failed to delete project. Please try again.', 'error');
    }
}

async function deleteTask(taskId) {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        showNotification('No admin user ID found. Please log in again.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/projects/delete-task/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                admin_user_id: adminUserId
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Task deleted successfully!', 'success');
            // Reload tasks for current project
            if (currentProject) {
                await loadTasksForCurrentProject();
            }
        } else {
            showNotification(result.error || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Task deletion error:', error);
        showNotification('Failed to delete task. Please try again.', 'error');
    }
}

async function deleteSubtask(subtaskId) {
    const adminUserId = getAdminUserId();
    if (!adminUserId) {
        showNotification('No admin user ID found. Please log in again.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/projects/delete-subtask/${subtaskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                admin_user_id: adminUserId
            })
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Subtask deleted successfully!', 'success');
            // Reload subtasks for current task
            if (currentTask) {
                await loadSubtasksForCurrentTask();
            }
        } else {
            showNotification(result.error || 'Failed to delete subtask', 'error');
        }
    } catch (error) {
        console.error('Subtask deletion error:', error);
        showNotification('Failed to delete subtask. Please try again.', 'error');
    }
}

// Add Delete Selected button to the UI
function addBulkDeleteButton() {
    let btn = document.getElementById('bulk-delete-subtasks-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'bulk-delete-subtasks-btn';
        btn.textContent = 'Delete Selected';
        btn.style = 'margin-bottom:1rem;background:#ff4d4f;color:white;padding:0.5em 1.2em;border:none;border-radius:0.5em;font-size:1em;cursor:pointer;';
        btn.onclick = async function() {
            if (selectedSubtaskIds.length === 0) {
                showNotification('No subtasks selected.', 'error');
                return;
            }
            if (!confirm(`Delete ${selectedSubtaskIds.length} subtasks? This cannot be undone!`)) return;
            try {
                const res = await fetch('/api/projects/delete-subtasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subtask_ids: selectedSubtaskIds })
                });
                const result = await res.json();
                if (result.success) {
                    showNotification(`Deleted: ${result.deleted}, Failed: ${result.failed}`, result.failed ? 'error' : 'success');
                    selectedSubtaskIds = [];
                    await renderSubtasks();
                } else {
                    showNotification(result.error || 'Bulk delete failed', 'error');
                }
            } catch (e) {
                showNotification('Bulk delete error: ' + e.message, 'error');
            }
        };
        // Insert above subtaskCardsContainer
        subtaskCardsContainer.parentNode.insertBefore(btn, subtaskCardsContainer);
    }
}

