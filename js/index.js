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
  document.getElementById("recent-orders--table").appendChild(tableBody);

  // 2. Updates section
  document.querySelector(".recent-updates").appendChild(buildUpdatesList());

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

  // 5. Profile info
  const name = localStorage.getItem("userName") || "User";
  document.querySelector(".profile .info p").innerHTML = `Hey, <b>${name}</b>`;
  document.querySelector(".profile .info small").textContent =
    role.charAt(0).toUpperCase() + role.slice(1);

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
});
document.addEventListener('DOMContentLoaded', () => {
  const name = localStorage.getItem('userName') || 'User';
  const role = localStorage.getItem('userRole') || '';

  document.querySelector(".profile .info p").innerHTML = `Hey, <b>${name}</b>`;
  document.querySelector(".profile .info small").textContent = role.charAt(0).toUpperCase() + role.slice(1);
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById('chatbot-toggle-btn');
  const panel = document.getElementById('chatbot-panel');
  const closeBtn = document.getElementById('close-btn');
  const messages = document.getElementById('messages');
  const inputForm = document.getElementById('input-area');
  const userInput = document.getElementById('user-input');

  const LOCAL_STORAGE_KEY = 'selfLearningBotQAData';
  let qaData = [];
  let learningMode = false;
  let pendingQuestion = '';

  toggleBtn.onclick = () => panel.classList.toggle('active');
  closeBtn.onclick = () => panel.classList.remove('active');

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

// === Utility: Status badge renderer ===
const getStatusBadge = (status) => {
  const cls = status.toLowerCase();
  return `<span class="status-badge ${cls}">${status}</span>`;
};
