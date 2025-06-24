// === UTILITY FUNCTIONS ===

const buildTableBody = async () => {
  const tbody = document.createElement("tbody");

  try {
    const res = await fetch('http://localhost:3000/api/admin/assigned-tasks');
    const tasks = await res.json();

    let bodyContent = '';
    for (const task of tasks) {
      bodyContent += `
        <tr>
          <td>${task.project_id}</td>
          <td>${task.project_name}</td>
          <td>${task.task_name}</td>
          <td>${task.due_on ? new Date(task.due_on).toLocaleDateString() : '-'}</td>
          <td>${getStatusBadge(task.status)}</td>
          <td>${task.employee_name}</td>
          <td class="primary">Details</td>
        </tr>
      `;
    }

    tbody.innerHTML = bodyContent;
  } catch (err) {
    console.error('Failed to load assigned tasks:', err);
    tbody.innerHTML = `<tr><td colspan="7">Error loading tasks</td></tr>`;
  }

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

const buildUpdatesList = () => {
  const updateData = UPDATE_DATA;

  const div = document.createElement("div");
  div.classList.add("updates");

  let updateContent = "";
  for (const update of updateData) {
    updateContent += `
      <div class="update">
        <div class="profile-photo">
          <img src="${update.imgSrc}" />
        </div>
        <div class="message">
          <p><b>${update.profileName}</b> ${update.message}</p>
          <small class="text-muted">${update.updatedTime}</small>
        </div>
      </div>
    `;
  }

  div.innerHTML = updateContent;

  return div;
};

const buildSalesAnalytics = (element) => {
  const salesAnalyticsData = SALES_ANALYTICS_DATA;

  for (const analytic of salesAnalyticsData) {
    const item = document.createElement("div");
    item.classList.add("item", analytic.itemClass);

    const itemHtml = `
      <div class="icon">
        <span class="material-icons-sharp"> ${analytic.icon} </span>
      </div>
      <div class="right">
        <div class="info">
          <h3>${analytic.title}</h3>
          <small class="text-muted"> Last 24 Hours </small>
        </div>
        <h5 class="${analytic.colorClass}">${analytic.percentage}%</h5>
        <h3>${analytic.sales}</h3>
      </div>
    `;

    item.innerHTML = itemHtml;
    element.appendChild(item);
  }
};

// === MAIN INITIALIZER ===
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Inject Assigned Task Table
  const tableBody = await buildTableBody();
  const recentOrdersTable = document.getElementById("recent-orders--table");
  if (recentOrdersTable) {
    recentOrdersTable.appendChild(tableBody);
  }

  // 2. Updates section
  const recentUpdates = document.querySelector(".recent-updates");
  if (recentUpdates) {
    recentUpdates.appendChild(buildUpdatesList());
  }

  // 3. Sales analytics
  const analytics = document.getElementById("analytics");
  if (analytics) buildSalesAnalytics(analytics);

  // 4. Role-based Summary
  const role = localStorage.getItem("userRole");
  if (role === "hr") {
    try {
      const res = await fetch('http://localhost:3000/api/hr/summary');
      const data = await res.json();

      document.querySelector(".sales h3").textContent = "Projects Completed";
      document.querySelector(".sales h1").textContent = data.completedProjects;

      document.querySelector(".expenses h3").textContent = "Today's Leave Requests";
      document.querySelector(".expenses h1").textContent = data.todaysLeaves;

      document.querySelector(".income h3").textContent = "Delayed Tasks";
      document.querySelector(".income h1").textContent = data.delayedTasks;
    } catch (err) {
      console.error("Failed to fetch HR summary:", err);
    }
  } else {
    try {
      const res = await fetch('http://localhost:3000/api/admin/summary');
      const data = await res.json();
      document.querySelector(".sales h1").textContent = data.totalTasks;
      document.querySelector(".income h1").textContent = data.completedTasks;
      document.querySelector(".expenses h1").textContent = data.totalProjects;
    } catch (err) {
      console.error("Failed to fetch admin summary:", err);
    }
  }

  // 5. Filter dropdown logic
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
});

// === Utility: Status badge renderer ===
const getStatusBadge = (status) => {
  const cls = status.toLowerCase();
  return `<span class="status-badge ${cls}">${status}</span>`;
};
