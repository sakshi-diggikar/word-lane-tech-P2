// === UTILITY FUNCTIONS ===

const getStatusBadge = (status) => {
    const cls = status.toLowerCase();
    return `<span class="status-badge ${cls}">${status}</span>`;
};

// --- HARDCODED EMPLOYEE TASK DATA ---
// This data will be used to populate the "My Tasks" table
const EMPLOYEE_TASKS_DATA = [
    {
        project_id: "P001",
        project_name: "Website Redesign",
        task_name: "Design Homepage Layout",
        due_on: "2023-11-15",
        status: "Active",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P002",
        project_name: "Mobile App Development",
        task_name: "Implement User Authentication",
        due_on: "2023-11-20",
        status: "Pending",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P003",
        project_name: "Marketing Campaign",
        task_name: "Create Social Media Graphics",
        due_on: "2023-11-10",
        status: "Completed",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P004",
        project_name: "Internal Tool",
        task_name: "Develop Reporting Module",
        due_on: "2023-11-25",
        status: "Delayed",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P005",
        project_name: "Client Project X",
        task_name: "Review Requirements Document",
        due_on: "2023-11-12",
        status: "Active",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P006",
        project_name: "Website Redesign",
        task_name: "Develop Contact Form",
        due_on: "2023-11-18",
        status: "Pending",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P007",
        project_name: "Mobile App Development",
        task_name: "Fix Bug in Payment Gateway",
        due_on: "2023-11-08",
        status: "Completed",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P008",
        project_name: "Marketing Campaign",
        task_name: "Write Blog Post Draft",
        due_on: "2023-11-16",
        status: "Active",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P009",
        project_name: "Internal Tool",
        task_name: "User Acceptance Testing",
        due_on: "2023-11-30",
        status: "Pending",
        employee_name: "Alice Smith",
    },
    {
        project_id: "P010",
        project_name: "Client Project Y",
        task_name: "Prepare Presentation Slides",
        due_on: "2023-11-14",
        status: "Delayed",
        employee_name: "Alice Smith",
    },
];

const buildTableBody = async () => {
    const tbody = document.createElement("tbody");

    // Use hardcoded data instead of fetching from API for demonstration
    const tasks = EMPLOYEE_TASKS_DATA;

    let bodyContent = '';
    if (tasks.length === 0) {
        bodyContent = `<tr><td colspan="7">No tasks assigned yet.</td></tr>`;
    } else {
        for (const task of tasks) {
            bodyContent += `
          <tr>
            <td>${task.project_id}</td>
            <td>${task.project_name}</td>
            <td>${task.task_name}</td>
            <td>${task.due_on ? new Date(task.due_on).toLocaleDateString() : '-'}</td>
            <td>${getStatusBadge(task.status)}</td>
            <td>${task.employee_name || 'N/A'}</td>
            <td class="primary">Details</td>
          </tr>
        `;
        }
    }

    tbody.innerHTML = bodyContent;
    return tbody;
};

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
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Inject Assigned Task Table
    const tableBody = await buildTableBody();
    document.getElementById("recent-orders--table").appendChild(tableBody);

    // 2. Updates section (PLANKED - no call here)
    // document.querySelector(".recent-updates").appendChild(buildUpdatesList()); 

    // 3. Sales analytics (PLANKED - no call here)
    // const analytics = document.getElementById("analytics");
    // if (analytics) buildSalesAnalytics(analytics);

    // 4. Role-based Summary for Employee (using hardcoded values for now)
    const role = localStorage.getItem("userRole");

    // For demonstration, let's calculate summary from hardcoded data
    const newTasksCount = EMPLOYEE_TASKS_DATA.filter(task => task.status === 'Active').length;
    const pendingTasksCount = EMPLOYEE_TASKS_DATA.filter(task => task.status === 'Pending' || task.status === 'Delayed').length;
    const completedTasksCount = EMPLOYEE_TASKS_DATA.filter(task => task.status === 'Completed').length;

    // Update "New Tasks" card
    document.querySelector(".sales h3").textContent = "New Tasks";
    document.querySelector(".sales h1").textContent = newTasksCount;
    // Update progress circle percentage (example calculation)
    const totalTasks = EMPLOYEE_TASKS_DATA.length;
    const newTasksPercentage = totalTasks > 0 ? Math.round((newTasksCount / totalTasks) * 100) : 0;
    document.querySelector(".sales .progress .number p").textContent = `${newTasksPercentage}%`;


    // Update "Pending Tasks" card
    document.querySelector(".expenses h3").textContent = "Pending Tasks";
    document.querySelector(".expenses h1").textContent = pendingTasksCount;
    const pendingTasksPercentage = totalTasks > 0 ? Math.round((pendingTasksCount / totalTasks) * 100) : 0;
    document.querySelector(".expenses .progress .number p").textContent = `${pendingTasksPercentage}%`;


    // Update "Completed Tasks" card
    document.querySelector(".income h3").textContent = "Completed Tasks";
    document.querySelector(".income h1").textContent = completedTasksCount;
    const completedTasksPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    document.querySelector(".income .progress .number p").textContent = `${completedTasksPercentage}%`;


    // 5. Profile info
    const name = localStorage.getItem("userName") || "Employee"; // Default to 'Employee'
    document.querySelector(".profile .info p").innerHTML = `Hey, <b>${name}</b>`;
    document.querySelector(".profile .info small").textContent =
        (role && role.charAt(0).toUpperCase() + role.slice(1)) || "Employee"; // Display actual role or 'Employee'

    // 6. Filter dropdown logic
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

    // 7. Sidebar & theme toggle
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    menuBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "block";
    });

    closeBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "none";
    });

    themeToggler?.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme-variables");
        themeToggler
            .querySelector("span:nth-child(1)")
            ?.classList.toggle("active");
        themeToggler
            .querySelector("span:nth-child(2)")
            ?.classList.toggle("active");
    });

    // Chatbot Logic (copied from original index.js and inline script)
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const panel = document.getElementById('chatbot-panel');
    const chatbotCloseBtn = document.querySelector('#chatbot-panel #close-btn'); // Specific close button for chatbot
    const messages = document.getElementById('messages');
    const inputForm = document.getElementById('input-area');
    const userInput = document.getElementById('user-input');

    const LOCAL_STORAGE_KEY = 'selfLearningBotQAData';
    let qaData = [];
    let learningMode = false;
    let pendingQuestion = '';

    toggleBtn.onclick = () => panel.classList.toggle('active');
    chatbotCloseBtn.onclick = () => panel.classList.remove('active'); // Use specific close button

    function loadQAData() {
        try {
            const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            qaData = Array.isArray(saved) ? saved : [];
        } catch {
            qaData = [];
        }

        if (qaData.length === 0) {
            qaData = [
                { question: "How do I publish my book?", answer: "Submit your manuscript through our online portal." },
                { question: "What formats do you publish?", answer: "Print, eBook, and audiobook." },
                { question: "How much does publishing cost?", answer: "Packages start from ₹4999 depending on services." },
                { question: "Do you offer marketing services?", answer: "Yes, we offer press releases, PR, and online marketing." },
                { question: "How long does publishing take?", answer: "Typically 8–12 weeks after manuscript acceptance." },
                { question: "Can I sell internationally?", answer: "Yes, we distribute globally via Amazon, Ingram, and more." },
                { question: "Do you provide editing?", answer: "Yes, editing and proofreading are included or optional add-ons." },
                { question: "How to get ISBN?", answer: "We assign ISBNs for free with every published book." },
                { question: "Can I edit after publishing?", answer: "Minor changes are free, major ones may have a cost." },
                { question: "What royalties will I receive?", answer: "Usually 10–15% of net sales depending on the plan." },
            ];
        }
    }

    function saveQAData() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(qaData));
    }

    function addMessage(text, type = 'bot') {
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    function showInitialOptions() {
        addMessage("Welcome! Choose a question or type your own:");
        const btnContainer = document.createElement('div');
        btnContainer.className = 'question-buttons';

        qaData.slice(0, 10).forEach(qa => {
            const btn = document.createElement('button');
            btn.textContent = qa.question;
            btn.onclick = () => {
                addMessage(qa.question, 'user');
                setTimeout(() => addMessage(qa.answer), 300);
            };
            btnContainer.appendChild(btn);
        });

        const customBtn = document.createElement('button');
        customBtn.textContent = "Other Doubt";
        customBtn.onclick = () => {
            addMessage("Other Doubt", 'user');
            setTimeout(() => addMessage("Please type your question below."), 300);
        };
        btnContainer.appendChild(customBtn);

        messages.appendChild(btnContainer);
        messages.scrollTop = messages.scrollHeight;
    }

    inputForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        userInput.value = '';

        if (learningMode) {
            qaData.push({ question: pendingQuestion, answer: text });
            saveQAData();
            addMessage("Thanks! I’ve saved this answer.");
            learningMode = false;
            pendingQuestion = '';
            return;
        }

        const match = qaData.find(q => q.question.toLowerCase() === text.toLowerCase());
        if (match) {
            setTimeout(() => addMessage(match.answer), 300);
        } else {
            setTimeout(() => {
                addMessage(`I don't know the answer to "${text}". Please teach me the correct answer.`);
                learningMode = true;
                pendingQuestion = text;
            }, 300);
        }
    });

    loadQAData();
    showInitialOptions();
});
  