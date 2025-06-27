// Elements ref
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
        description: "Handles all frontend work, including UI/UX and client-side logic.",
        createdAt: new Date("2025-05-01T10:30:00"),
        leaderId: "101",
        projects: [
            {
                name: "Website Redesign",
                description: "Redesign the company website for a modern look and improved UX.",
                client: "Acme Corp",
                startdate: new Date("2025-05-01T10:30:00"),
                deadline: new Date("2025-06-01T10:30:00"),
                mentor: "Alice Smith",
                createdAt: new Date("2025-05-01T10:30:00"),
                priority: "High",
                status: "active",
                progress: 60,
                tasks: [
                    {
                        name: "Design Homepage",
                        details: "Create a modern homepage with responsive design.",
                        empid: "102",
                        createdAt: new Date("2025-05-02T10:30:00"),
                        deadline: new Date("2025-05-10T18:00:00"),
                        priority: "High",
                        status: "Completed",
                        progress: 100,
                        subtasks: [
                            {
                                name: "Wireframe",
                                details: "Draw wireframe for homepage layout.",
                                createdAt: new Date("2025-05-03T10:30:00"),
                                empids: ["102"],
                                deadline: new Date("2025-05-04T18:00:00"),
                                priority: "Medium",
                                status: "Completed",
                                progress: 100,
                                attachments: [
                                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                                ],
                                uploadedTaskFiles: [
                                    "https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf"
                                ],
                                completionDetails: "Created wireframe using Figma.",
                            }
                        ]
                    },
                    {
                        name: "Implement Navigation",
                        details: "Develop the navigation bar and menu.",
                        empid: "103",
                        createdAt: new Date("2025-05-05T09:00:00"),
                        deadline: new Date("2025-05-12T18:00:00"),
                        priority: "Medium",
                        status: "Pending",
                        progress: 50,
                        subtasks: [
                            {
                                name: "Dropdown Menu",
                                details: "Add dropdown functionality to the menu.",
                                createdAt: new Date("2025-05-06T10:00:00"),
                                empids: ["103"],
                                deadline: new Date("2025-05-08T18:00:00"),
                                priority: "Low",
                                status: "Pending",
                                progress: 50,
                                attachments: [],
                                uploadedTaskFiles: [],
                                completionDetails: "Dropdown logic half done.",
                            }
                        ]
                    }
                ]
            },
            {
                name: "Landing Page Optimization",
                description: "Optimize landing page for SEO and performance.",
                client: "Beta Ltd",
                startdate: new Date("2025-05-10T09:00:00"),
                deadline: new Date("2025-06-15T17:00:00"),
                mentor: "Bob",
                createdAt: new Date("2025-05-10T09:00:00"),
                priority: "Medium",
                status: "Pending",
                progress: 0,
                tasks: []
            }
        ]
    },
    {
        name: "Backend Team",
        description: "Responsible for server-side logic, APIs, and database management.",
        createdAt: new Date("2025-04-15T11:00:00"),
        leaderId: "104",
        projects: [
            {
                name: "API Development",
                description: "Develop RESTful APIs for the new mobile app.",
                client: "Gamma Inc",
                startdate: new Date("2025-05-20T09:00:00"),
                deadline: new Date("2025-07-01T17:00:00"),
                mentor: "David",
                createdAt: new Date("2025-05-20T09:00:00"),
                priority: "High",
                status: "active",
                progress: 30,
                tasks: [
                    {
                        name: "User Authentication",
                        details: "Implement JWT-based authentication.",
                        empid: "105",
                        createdAt: new Date("2025-05-21T10:00:00"),
                        deadline: new Date("2025-05-28T18:00:00"),
                        priority: "High",
                        status: "Pending",
                        progress: 0,
                        subtasks: [
                            {
                                name: "JWT Token Logic",
                                details: "Write logic for issuing and verifying JWT tokens.",
                                createdAt: new Date("2025-05-22T10:00:00"),
                                empids: ["105"],
                                deadline: new Date("2025-05-25T18:00:00"),
                                priority: "High",
                                status: "Pending",
                                progress: 0,
                                attachments: [],
                                uploadedTaskFiles: [],
                                completionDetails: "",
                            }
                        ]
                    }
                ]
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
`;
    modal.style.display = 'flex';
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
    </div>
    <div class="project-details" title="${desc.replace(/"/g, '&quot;')}">${descShort.replace(/\n/g, '<br>')}</div>
    <div style="font-size:0.97em;color:#7d8da1;margin-bottom:0.3em;">
        <b>Leader:</b>
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
    </div>
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

    // Progress bar (average of task progress)
    let progress = 0;
    if (project.tasks && project.tasks.length > 0) {
        const total = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        progress = Math.round(total / project.tasks.length);
    } else {
        progress = project.progress || 0;
    }

    card.innerHTML = `
                <div class="project-header">
                    <h3 style="font-size:1.25rem;">${project.name}</h3>
                    <span class="priority-label" style="margin-left:auto;padding:2px 12px;border-radius:8px;font-size:1em;background:${priorityColor};color:white;align-self:center;">
                        ${priority}
                    </span>
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

    // Progress bar (average of subtask progress)
    let progress = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const total = task.subtasks.reduce((sum, st) => sum + (st.progress || 0), 0);
        progress = Math.round(total / task.subtasks.length);
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

    // Add details button
    const detailsButton = document.createElement('button');
    detailsButton.className = 'details-btn';
    detailsButton.textContent = 'View Details';
    card.appendChild(detailsButton);

    // Handle details button click separately
    detailsButton.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent any default behavior
        e.stopPropagation(); // Prevent card click/navigation
        showSubtaskDetails(subtask); // Only show details
    });

    // Handle card click for navigation only
    card.addEventListener("click", function (e) {
        // Prevent click on dropdown menu or three-dots from opening details
        if (e.target.closest('.dropdown-menu') || e.target.classList.contains('three-dots')) return;
        showSubtaskDetails(subtask);
    });

    // Download all attachments handler (modal)
    if (subtask.attachments && subtask.attachments.length > 0) {
        const allAttachmentsBtn = card.querySelector('.download-all-attachments');
        if (allAttachmentsBtn) {
            allAttachmentsBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
                subtask.attachments.forEach(file => {
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
            };
        }
    }
    // Download all task files handler (modal)
    if (subtask.uploadedTaskFiles && subtask.uploadedTaskFiles.length > 0) {
        const allTaskFilesBtn = card.querySelector('.download-all-taskfiles');
        if (allTaskFilesBtn) {
            allTaskFilesBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
                subtask.uploadedTaskFiles.forEach(file => {
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
            };
        }
    }

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
    // createSubtaskBtn.hidden = false;
    // createSubtaskBtn.onclick = () => showModal('subtask');

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

// Close modal on cancel or X icon
closeModalBtn.addEventListener('click', () => {
    closeModal();
});
modalCloseIcon.addEventListener('click', () => {
    closeModal();
});

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
        const total = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        progress = Math.round(total / project.tasks.length);
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
            `;

    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = document.getElementById('close-project-details');
    closeBtn.onclick = () => modal.style.display = 'none';

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

// Function to show task details
function showTaskDetails(task) {
    const modal = taskDetailsModal;
    const content = document.getElementById("task-details-content");

    // Calculate progress
    let progress = 0;
    if (task.subtasks && task.subtasks.length > 0) {
        const total = task.subtasks.reduce((sum, st) => sum + (st.progress || 0), 0);
        progress = Math.round(total / task.subtasks.length);
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
            `;

    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = document.getElementById('close-task-details');
    closeBtn.onclick = () => modal.style.display = 'none';

    // Close on outside click
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
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

                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                    ${(subtask.attachments && subtask.attachments.length > 0) ? `
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Attachments</h3>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.2rem;">
                        ${subtask.attachments.map(file => `
                            <a href="#" class="download-attachment" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:#7380ec;color:white;border-radius:0.5rem;text-decoration:none;">
                                <span class="material-icons-sharp">attach_file</span>
                                ${file instanceof File ? file.name : file.split('/').pop()}
                            </a>
                        `).join('')}
                </div>
                ` : ''}
                ${(subtask.uploadedTaskFiles && subtask.uploadedTaskFiles.length > 0) ? `
                    <h3 style="color:#363949;margin-bottom:0.8rem;">Task Uploaded File(s)</h3>
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.2rem;">
                        ${subtask.uploadedTaskFiles.map((file, idx) => `
                            <a href="#" class="download-task-file" data-file-idx="${idx}" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1rem;background:#41f1b6;color:white;border-radius:0.5rem;text-decoration:none;">
                                <span class="material-icons-sharp">file_present</span>
                                ${file instanceof File ? file.name : (typeof file === 'string' ? file.split('/').pop() : 'file')}
                            </a>
                        `).join('')}
                </div>
                ` : ''}
                </div>

                <div style="background:#f8f9fa;padding:1.5rem;border-radius:1rem;margin-bottom:0.5rem;">
                    <div style="margin-bottom:1.5rem;">
                        <label style="font-weight:600;">Upload Task File:</label>
                    <input type="file" id="upload-task-file" multiple />
                    </div>
                    <div style="margin-bottom:1.5rem;">
                        <label for="progress-input" style="font-weight:600;">Task Completion (%):</label>
                        <input type="range" id="progress-input" min="0" max="100" value="${subtask.progress || 0}" style="width:100%;margin-top:0.5em;">
                        <span id="progress-value" style="font-size:1.1em;margin-left:0.7em;vertical-align:middle;">${subtask.progress || 0}%</span>
                    </div>
                    <div>
                        <label for="completion-details" style="font-weight:600;">What did you do in this task?</label>
                        <textarea id="completion-details" rows="3" style="width:100%;resize:vertical;">${subtask.completionDetails || ''}</textarea>
                    </div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem;">
                        <button id="submit-task-btn" style="background:#41f1b6;color:#fff;padding:0.4em 1em;border-radius:0.5em;border:none;font-size:0.98em;cursor:pointer;min-width:90px;">Submit</button>
                    </div>
                </div>
            `;

    modal.style.display = 'flex';

    // Progress bar value update
    const progressInput = content.querySelector('#progress-input');
    const progressValue = content.querySelector('#progress-value');
    if (progressInput && progressValue) {
        progressInput.addEventListener('input', function() {
            progressValue.textContent = progressInput.value + '%';
        });
    }

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
        const progressInput = content.querySelector('#progress-input');
        const completionDetails = content.querySelector('#completion-details');
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
        // Save progress and completion details
        if (progressInput) subtask.progress = parseInt(progressInput.value, 10);
        if (completionDetails) subtask.completionDetails = completionDetails.value.trim();
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
