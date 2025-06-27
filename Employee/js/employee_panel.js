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
    
                    <td class="primary details-btn" style="cursor:pointer;">Details</td>
                
            `;
            tbody.appendChild(row);

            
        });

        // ✨ Add click event to each "Details" cell
        const detailButtons = tbody.querySelectorAll('.details-btn');
        detailButtons.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                showTaskDetails(data[i]);
            });
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

         if (myTasks) animateCountUp(myTasks, 15);
        if (workHours) animateCountUp(workHours, 42);
        if (performance) animateCountUp(performance, 92);

        animateCircularProgress(".insights .sales", 73);
        animateCircularProgress(".insights .expenses", 84);
        animateCircularProgress(".insights .income", 92);

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


    function showTaskDetails(task) {
        // Populate modal fields
        document.getElementById('modal-project-id').textContent = task.taskId;
        document.getElementById('modal-project-name').textContent = task.project;
        document.getElementById('modal-task-name').textContent = task.taskName;
        document.getElementById('modal-due-on').textContent = task.dueDate;
        document.getElementById('modal-status').textContent = task.status;
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