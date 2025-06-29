// Employee Panel JavaScript

document.addEventListener("DOMContentLoaded", async () => {
    // Get employee user ID from session storage
    const employeeUserId = sessionStorage.getItem("emp_user_id");
    if (!employeeUserId) {
        alert("Login required");
        window.location.href = "../login.html";
        return;
    }

    console.log('🔍 Employee panel loaded for user:', employeeUserId);

    // Function to fetch employee statistics
    async function fetchEmployeeStats() {
        try {
            const response = await fetch(`/api/projects/employee-stats/${employeeUserId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error('Failed to fetch employee stats:', error);
            return null;
        }
    }

    // Function to fetch employee tasks
    async function fetchEmployeeTasks() {
        try {
            const response = await fetch(`/api/projects/employee-tasks/${employeeUserId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.tasks;
        } catch (error) {
            console.error('Failed to fetch employee tasks:', error);
            return [];
        }
    }

     function animateCountUp(el, target, duration = 500) {
        let start = 0;
        let startTime = null;

        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function animateCircularProgress(selector, percent, duration = 500) {
        const container = document.querySelector(selector);
        if (!container) return;

        const circle = container.querySelector("circle");
        const percentEl = container.querySelector(".number p");

        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = `${circumference}`;
        circle.style.strokeDashoffset = `${circumference}`;

        let startTime = null;

        function animate(time) {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const draw = percent * progress;

            circle.style.strokeDashoffset = circumference - (draw / 100 * circumference);
            percentEl.textContent = `${Math.floor(draw)}%`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Function to populate the table with real data
    function populateTable(tasks) {
        const tbody = document.querySelector("#recent-orders--table tbody");
        if (!tbody) return;

        tbody.innerHTML = "";

        if (tasks.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 2rem; color: #677483;">
                    No tasks assigned yet
                </td>
            `;
            tbody.appendChild(row);
            return;
        }

        tasks.forEach(task => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${task.task_id}</td>
                <td>${task.task_name}</td>
                <td>${task.proj_name || 'N/A'}</td>
                <td>${task.task_deadline ? new Date(task.task_deadline).toLocaleDateString() : 'N/A'}</td>
                <td><span class="status-badge ${task.status_text}">${task.status_text}</span></td>
                <td><span class="priority-badge ${task.priority_text}">${task.priority_text}</span></td>
                <td class="primary details-btn" style="cursor:pointer;">Details</td>
            `;
            tbody.appendChild(row);
        });

        // Add click event to each "Details" cell
        const detailButtons = tbody.querySelectorAll('.details-btn');
        detailButtons.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                showTaskDetails(tasks[i]);
            });
        });
    }

    // Search functionality
    const searchInput = document.getElementById("task-search");
    let allTasks = []; // Store all tasks for filtering

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = allTasks.filter(task =>
                task.task_name.toLowerCase().includes(searchTerm) ||
                (task.proj_name && task.proj_name.toLowerCase().includes(searchTerm)) ||
                task.task_id.toString().includes(searchTerm)
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
                let filteredData = allTasks;

                if (filter !== "all") {
                    filteredData = allTasks.filter(task =>
                        task.status_text === filter
                    );
                }

                populateTable(filteredData);
                sortOptions.style.display = "none";
            });
        });
    }

    // Update insights data with real data
    async function updateInsights() {
        const stats = await fetchEmployeeStats();
        if (!stats) {
            console.error('Failed to load employee stats');
            return;
        }

        const myTasks = document.querySelector(".insights .sales h1");
        const workHours = document.querySelector(".insights .expenses h1");
        const performance = document.querySelector(".insights .income h1");

        // Update task count
        if (myTasks) {
            animateCountUp(myTasks, stats.total_tasks);
            myTasks.textContent = stats.total_tasks;
        }

        // Update work hours (placeholder - could be calculated from attendance)
        if (workHours) {
            animateCountUp(workHours, 42); // Placeholder
            workHours.textContent = "42";
        }

        // Update performance based on task completion rate
        if (performance) {
            animateCountUp(performance, stats.task_completion_rate);
            performance.textContent = `${stats.task_completion_rate}%`;
        }

        // Animate progress circles
        animateCircularProgress(".insights .sales", stats.task_completion_rate);
        animateCircularProgress(".insights .expenses", 84); // Placeholder
        animateCircularProgress(".insights .income", stats.task_completion_rate);
    }

    // Initialize the page
    async function initializePage() {
        // Load tasks
        allTasks = await fetchEmployeeTasks();
        populateTable(allTasks);

        // Update insights
        await updateInsights();
    }

    // Initialize the page
    await initializePage();

    // Add click handlers for action buttons


    function showTaskDetails(task) {
        // Populate modal fields
        document.getElementById('modal-project-id').textContent = task.task_id;
        document.getElementById('modal-project-name').textContent = task.proj_name || 'N/A';
        document.getElementById('modal-task-name').textContent = task.task_name;
        document.getElementById('modal-due-on').textContent = task.task_deadline ? new Date(task.task_deadline).toLocaleDateString() : 'N/A';
        document.getElementById('modal-status').textContent = task.status_text;
        document.getElementById('modal-employee-name').textContent = "John Doe"; // Example static name

        document.getElementById('taskDetailsModal').style.display = 'flex';


        document.getElementById('closeTaskModal')?.addEventListener('click', () => {
            document.getElementById('taskDetailsModal').style.display = 'none';
        });
        document.getElementById('closeTaskModalBtn')?.addEventListener('click', () => {
            document.getElementById('taskDetailsModal').style.display = 'none';
        });
    }

    document.querySelector('.btn-send')?.addEventListener('click', () => {
        const comment = document.getElementById('task-comment').value.trim();
        const modal = document.getElementById('taskDetailsModal');

        if (comment) {
            const toast = document.getElementById("toast");
            toast.textContent = "Message Sent!";
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 2500);

            document.getElementById('task-comment').value = "";
            modal.style.display = "none";
            document.body.style.overflow = "";
        } else {
            alert("Please enter a comment.");
        }
    });

    const toggler = document.querySelector(".theme-toggler");
  const lightIcon = toggler.querySelector("span:nth-child(1)");
  const darkIcon = toggler.querySelector("span:nth-child(2)");

  // Apply saved theme on load
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    lightIcon.classList.remove("active");
    darkIcon.classList.add("active");
  } else {
    document.body.classList.remove("dark-theme");
    darkIcon.classList.remove("active");
    lightIcon.classList.add("active");
  }

  // Toggle theme on click
  toggler.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    if (isDark) {
      localStorage.setItem("theme", "dark");
      lightIcon.classList.remove("active");
      darkIcon.classList.add("active");
    } else {
      localStorage.setItem("theme", "light");
      darkIcon.classList.remove("active");
      lightIcon.classList.add("active");
    }
  });
}); 