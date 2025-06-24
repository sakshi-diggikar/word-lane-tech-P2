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

// Data structure: projects array, each project has tasks, each task has subtasks
let teams = [
    {
        name: "Frontend Team",
        description: "Handles all frontend work.",
        createdAt: new Date(),
        projects: [
            {
                name: "Website Redesign",
                description: "Redesign the company website.",
                client: "Acme Corp",
                startdate: new Date("2025-05-01T10:30:00"),
                deadline: new Date("2025-06-01T10:30:00"),
                mentor: "Alice Smith",
                createdAt: new Date("2025-05-01T10:30:00"),
                tasks: [
                    {
                        name: "Design Homepage",
                        details: "Create a modern homepage.",
                        createdAt: new Date("2025-05-02T10:30:00"),
                        subtasks: [
                            {
                                name: "Wireframe",
                                details: "Draw wireframe",
                                createdAt: new Date("2025-05-03T10:30:00")
                            }
                        ]
                    }
                ],
                status: "active",
                progress: 0
            }
        ]
    }
];

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
                    <h2 style="color:#7380ec;font-size:1.8rem;margin-bottom:0.5rem;">${team.name}</h2>
                </div>
                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Team Details</h3>
                    <p style="color:#677483;white-space:pre-line;margin-bottom:1rem;">${team.description || 'No description provided.'}</p>
                    <div style="display:grid;grid-template-columns:auto 1fr;gap:1rem;margin-top:1rem;">
                        <strong style="color:#363949;">Created:</strong>
                        <span style="color:#677483;">${team.createdAt ? formatDateTime(team.createdAt) : 'N/A'}</span>
                        <strong style="color:#363949;">Projects:</strong>
                        <span style="color:#677483;">${team.projects ? team.projects.length : 0}</span>
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
    card.setAttribute("aria-label", `Team: ${team.name}, description: ${team.description || 'No details'}`);

    let desc = team.description || '';
    let descShort = desc;
    if (desc.length > 160 || desc.split('\n').length > 2) {
        let lines = desc.split('\n');
        descShort = lines.slice(0, 2).join('\n');
        if (descShort.length > 160) descShort = descShort.slice(0, 160);
        descShort += '...';
    }
    card.innerHTML = `
                <div class="project-header">
                    <h3 style="font-size:1.25rem;">${team.name}</h3>
                    <span class="material-icons-sharp three-dots" tabindex="0" aria-haspopup="true" aria-label="Team options menu" style="margin-left:auto;">more_vert</span>
                    <div class="dropdown-menu" role="menu">
                        <button class="route-btn" role="menuitem">Route</button>
                        <button class="archive-btn" role="menuitem">Archive</button>
                        <button class="delete-btn" role="menuitem">Delete</button>
                    </div>
                </div>
                <div class="project-details" title="${desc.replace(/"/g, '&quot;')}">${descShort.replace(/\n/g, '<br>')}</div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;">
                    <div></div>
                    <div class="avatar-stack" style="display:flex;align-items:center;">
                        ${(team.projects || []).slice(0, 3).map((p, i) => `
                            <span class="avatar-dot" style="
                                display:inline-block;
                                width:26px;height:26px;
                                border-radius:50%;
                                background:${['#7380ec', '#41f1b6', '#ffbb55'][i % 3]};
                                border:2px solid #fff;
                                margin-left:-10px;
                                z-index:${10 - i};
                                box-shadow:0 1px 4px rgba(0,0,0,0.07);
                            " title="${p.name}"></span>
                        `).join('')}
                        <span style="margin-left:8px;font-weight:600;color:#7380ec;font-size:1.1em;">
                            ${team.projects ? team.projects.length : 0}
                        </span>
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;margin-top:0.4em;position:relative;">
                    <span style="font-size:0.97em;color:#7d8da1;margin-bottom:0.1em;">${team.createdAt ? formatDateTime(team.createdAt) : 'N/A'}</span>
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
        alert(`Team "${team.name}" archived.`);
        dropdown.classList.remove("show");
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
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

    // Hide all fields by default
    inputTeamName.style.display = 'none';
    document.getElementById('input-team-name-label').style.display = 'none';
    inputTeamDesc.style.display = 'none';
    document.getElementById('input-team-desc-label').style.display = 'none';
    inputName.style.display = 'none';
    document.getElementById('input-label').style.display = 'none';
    inputDescription.style.display = 'none';
    document.getElementById('input-description-label').style.display = 'none';
    inputClient.style.display = 'none';
    document.getElementById('input-client-label').style.display = 'none';
    inputStartDate.style.display = 'none';
    document.getElementById('input-startdate-label').style.display = 'none';
    inputDeadline.style.display = 'none';
    document.getElementById('input-deadline-label').style.display = 'none';
    priorityFieldWrapper.style.display = 'none'; // Project priority
    inputTaskName.style.display = 'none';
    document.getElementById('input-task-name-label').style.display = 'none';
    taskPriorityFieldWrapper.style.display = 'none'; // Task priority
    inputTaskDesc.style.display = 'none';
    document.getElementById('input-task-desc-label').style.display = 'none';
    inputTaskEmpid.style.display = 'none';
    document.getElementById('input-task-empid-label').style.display = 'none';
    inputTaskDeadline.style.display = 'none';
    document.getElementById('input-task-deadline-label').style.display = 'none';
    inputSubtaskName.style.display = 'none';
    document.getElementById('input-subtask-name-label').style.display = 'none';
    inputSubtaskDesc.style.display = 'none';
    document.getElementById('input-subtask-desc-label').style.display = 'none';
    inputSubtaskEmpid.style.display = 'none';
    document.getElementById('input-subtask-empid-label').style.display = 'none';
    inputSubtaskDeadline.style.display = 'none';
    document.getElementById('input-subtask-deadline-label').style.display = 'none';
    inputSubtaskPriority.style.display = 'none';
    subtaskPriorityFieldWrapper.style.display = 'none';
    inputSubtaskAttachment.style.display = 'none';
    document.getElementById('input-subtask-attachment-label').style.display = 'none';

    // Hide employee suggestion divs by default
    document.getElementById('task-empid-suggestions').style.display = 'none';
    document.getElementById('subtask-empid-suggestions').style.display = 'none';
    document.getElementById('selected-employees').style.display = 'none';

    if (type === 'project') {
        modalTitle.textContent = subtaskToEdit ? 'Update Project' : 'Create New Project';
        document.getElementById('create-btn').textContent = subtaskToEdit ? 'Update' : 'Create';
        inputName.style.display = 'block';
        document.getElementById('input-label').style.display = 'block';
        inputDescription.style.display = 'block';
        document.getElementById('input-description-label').style.display = 'block';
        inputClient.style.display = 'block';
        document.getElementById('input-client-label').style.display = 'block';
        inputStartDate.style.display = 'block';
        document.getElementById('input-startdate-label').style.display = 'block';
        inputDeadline.style.display = 'block';
        document.getElementById('input-deadline-label').style.display = 'block';
        priorityFieldWrapper.style.display = 'block';
        // Reset date fields and flatpickr
        inputStartDate.value = '';
        inputDeadline.value = '';
        if (inputStartDate._flatpickr) inputStartDate._flatpickr.clear();
        if (inputDeadline._flatpickr) inputDeadline._flatpickr.clear();
        inputName.focus();
        if (subtaskToEdit) {
            inputName.value = subtaskToEdit.name || '';
            inputDescription.value = subtaskToEdit.description || '';
            inputClient.value = subtaskToEdit.client || '';
            inputStartDate.value = subtaskToEdit.startdate ? (typeof subtaskToEdit.startdate === 'string' ? subtaskToEdit.startdate : subtaskToEdit.startdate.toISOString().slice(0, 16)) : '';
            inputDeadline.value = subtaskToEdit.deadline ? (typeof subtaskToEdit.deadline === 'string' ? subtaskToEdit.deadline : subtaskToEdit.deadline.toISOString().slice(0, 16)) : '';
            inputPriority.value = subtaskToEdit.priority || 'Medium';
            modalForm.setAttribute('data-editing-project', 'true');
            modalForm.setAttribute('data-editing-project-name', subtaskToEdit.name);
        } else {
            modalForm.removeAttribute('data-editing-project');
            modalForm.removeAttribute('data-editing-project-name');
        }
    } else if (type === 'team') {
        modalTitle.textContent = subtaskToEdit ? 'Update Team' : 'Create New Team';
        document.getElementById('create-btn').textContent = subtaskToEdit ? 'Update' : 'Create';
        inputTeamName.style.display = 'block';
        document.getElementById('input-team-name-label').style.display = 'block';
        inputTeamDesc.style.display = 'block';
        document.getElementById('input-team-desc-label').style.display = 'block';
        inputTeamName.focus();
        if (subtaskToEdit) {
            inputTeamName.value = subtaskToEdit.name || '';
            inputTeamDesc.value = subtaskToEdit.description || '';
            modalForm.setAttribute('data-editing-team', 'true');
            modalForm.setAttribute('data-editing-team-name', subtaskToEdit.name);
        } else {
            modalForm.removeAttribute('data-editing-team');
            modalForm.removeAttribute('data-editing-team-name');
        }
    } else if (type === 'task') {
        modalTitle.textContent = subtaskToEdit ? 'Update Task' : 'Create New Task';
        document.getElementById('create-btn').textContent = subtaskToEdit ? 'Update' : 'Create';
        inputTaskName.style.display = 'block';
        document.getElementById('input-task-name-label').style.display = 'block';
        taskPriorityFieldWrapper.style.display = 'block';
        inputTaskDesc.style.display = 'block';
        document.getElementById('input-task-desc-label').style.display = 'block';
        inputTaskEmpid.style.display = 'block';
        document.getElementById('input-task-empid-label').style.display = 'block';
        inputTaskDeadline.style.display = 'block';
        document.getElementById('input-task-deadline-label').style.display = 'block';
        document.getElementById('task-empid-suggestions').style.display = 'block';
        // Reset deadline field and flatpickr
        inputTaskDeadline.value = '';
        if (inputTaskDeadline._flatpickr) inputTaskDeadline._flatpickr.clear();
        inputTaskName.focus();
        if (subtaskToEdit) {
            inputTaskName.value = subtaskToEdit.name || '';
            inputTaskDesc.value = subtaskToEdit.details || '';
            inputTaskEmpid.value = subtaskToEdit.empid || '';
            inputTaskDeadline.value = subtaskToEdit.deadline ? (typeof subtaskToEdit.deadline === 'string' ? subtaskToEdit.deadline : subtaskToEdit.deadline.toISOString().slice(0, 16)) : '';
            inputTaskPriority.value = subtaskToEdit.priority || 'Medium';
            modalForm.setAttribute('data-editing-task', 'true');
            modalForm.setAttribute('data-editing-task-name', subtaskToEdit.name);
        } else {
            modalForm.removeAttribute('data-editing-task');
            modalForm.removeAttribute('data-editing-task-name');
        }
        setTimeout(setupTaskEmployeeAutocomplete, 100);
    } else if (type === 'subtask') {
        modalTitle.textContent = subtaskToEdit ? 'Update the Subtask' : 'Create New Subtask';
        document.getElementById('create-btn').textContent = subtaskToEdit ? 'Update' : 'Create';
        inputSubtaskName.style.display = 'block';
        document.getElementById('input-subtask-name-label').style.display = 'block';
        inputSubtaskDesc.style.display = 'block';
        document.getElementById('input-subtask-desc-label').style.display = 'block';
        inputSubtaskEmpid.style.display = 'block';
        document.getElementById('input-subtask-empid-label').style.display = 'block';
        inputSubtaskDeadline.style.display = 'block';
        document.getElementById('input-subtask-deadline-label').style.display = 'block';
        inputSubtaskPriority.style.display = 'block';
        subtaskPriorityFieldWrapper.style.display = 'block';
        inputSubtaskAttachment.style.display = 'block';
        document.getElementById('input-subtask-attachment-label').style.display = 'block';
        document.getElementById('subtask-empid-suggestions').style.display = 'block';
        document.getElementById('selected-employees').style.display = 'flex';
        inputSubtaskDeadline.value = '';
        if (inputSubtaskDeadline._flatpickr) inputSubtaskDeadline._flatpickr.clear();
        inputSubtaskName.focus();
        if (subtaskToEdit) {
            inputSubtaskName.value = subtaskToEdit.name || '';
            inputSubtaskDesc.value = subtaskToEdit.details || '';
            inputSubtaskEmpid.value = (Array.isArray(subtaskToEdit.empids) ? subtaskToEdit.empids.join(', ') : subtaskToEdit.empids || '');
            inputSubtaskDeadline.value = subtaskToEdit.deadline ? (typeof subtaskToEdit.deadline === 'string' ? subtaskToEdit.deadline : subtaskToEdit.deadline.toISOString().slice(0, 16)) : '';
            inputSubtaskPriority.value = subtaskToEdit.priority || 'Medium';
            // Attachments cannot be pre-filled for security reasons
            modalForm.setAttribute('data-editing-subtask', 'true');
            modalForm.setAttribute('data-editing-subtask-name', subtaskToEdit.name);
        } else {
            modalForm.removeAttribute('data-editing-subtask');
            modalForm.removeAttribute('data-editing-subtask-name');
        }
        setTimeout(setupEmployeeAutocomplete, 100);
    }

    document.querySelector('.modal-buttons').style.display = 'flex';
    modalForm.setAttribute('data-type', type);
    projectModal.setAttribute('aria-hidden', 'false');
    projectModal.classList.add('active');
}


// Close modal
function closeModal() {
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
}

// Form submit handler (create project, task or subtask)
modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = modalForm.getAttribute('data-type');
    const name = inputName.value.trim();
    const description = inputDescription.value.trim();
    const client = inputClient ? inputClient.value.trim() : "";
    const startdate = inputStartDate.value;
    const deadline = inputDeadline.value;

    function projectExistsInList(list, name) {
        return list.some(p => p.name.toLowerCase() === name.toLowerCase());
    }

    if (type === 'team') {
        const teamName = inputTeamName.value.trim();
        const teamDesc = inputTeamDesc.value.trim();
        const isEditingTeam = modalForm.getAttribute('data-editing-team') === 'true';
        const editingTeamName = modalForm.getAttribute('data-editing-team-name');
        if (!teamName) {
            alert('Please enter a team name.');
            inputTeamName.focus();
            return;
        }
        if (!isEditingTeam && teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())) {
            alert('Team with this name already exists.');
            inputTeamName.focus();
            return;
        }
        if (
            isEditingTeam &&
            teamName.toLowerCase() !== editingTeamName.toLowerCase() &&
            teams.some(t => t.name.toLowerCase() === teamName.toLowerCase())
        ) {
            alert('Team with this name already exists.');
            inputTeamName.focus();
            return;
        }
        if (isEditingTeam) {
            // Find and update the team
            const team = teams.find(t => t.name === editingTeamName);
            if (team) {
                team.name = teamName;
                team.description = teamDesc;
            }
            renderTeams();
            closeModal();
            return;
        }
        const newTeam = {
            name: teamName,
            description: teamDesc,
            createdAt: new Date(),
            projects: []
        };
        teams.unshift(newTeam);
        renderTeams();
        closeModal();
        return;
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
});

// Close modal on cancel or X icon
closeModalBtn.addEventListener('click', () => {
    closeModal();
});
modalCloseIcon.addEventListener('click', () => {
    closeModal();
});

// Open modal to create root level project
createProjectBtn.addEventListener("click", () => {
    showModal('project');
});

// Open modal to create team
createTeamBtn.addEventListener("click", () => {
    showModal('team');
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

// Sidebar and theme toggler
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

menuBtn.addEventListener("click", () => {
    sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
    sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme-variables");
    themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
    themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
    // Update ARIA attribute on toggle switch
    let isDark = document.body.classList.contains("dark-theme-variables");
    themeToggler.setAttribute("aria-checked", isDark ? "true" : "false");
});

// Initial render of projects
renderTeams();

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
setTimeout(setupEmployeeAutocomplete, 100);
