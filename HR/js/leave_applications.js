// Extended dummy data for leave applications
const LEAVE_APPLICATIONS_DATA = [
    { id: 1, applicantName: "Alice Johnson", subject: "Annual Leave Request", startDate: "2023-11-15", endDate: "2023-11-20", description: "Requesting annual leave for a family trip to the mountains. Will be unreachable by phone.", status: "pending" },
    { id: 2, applicantName: "Bob Williams", subject: "Sick Leave", startDate: "2023-11-08", endDate: "2023-11-08", description: "Feeling unwell, unable to come to work. Experiencing flu-like symptoms.", status: "pending" },
    { id: 3, applicantName: "Charlie Brown", subject: "Personal Leave", startDate: "2023-11-25", endDate: "2023-11-25", description: "Attending a personal appointment with a specialist. Will return next day.", status: "pending" },
    { id: 4, applicantName: "Diana Prince", subject: "Vacation Request", startDate: "2023-12-01", endDate: "2023-12-10", description: "Planning a vacation to the mountains. Need to recharge before year-end projects.", status: "pending" },
    { id: 5, applicantName: "Eve Adams", subject: "Maternity Leave", startDate: "2024-01-01", endDate: "2024-03-31", description: "Applying for maternity leave as per company policy. Expected due date is Jan 15th.", status: "pending" },
    { id: 6, applicantName: "Frank White", subject: "Paternity Leave", startDate: "2023-11-20", endDate: "2023-11-24", description: "Requesting paternity leave for newborn. My wife needs support during this time.", status: "pending" },
    { id: 7, applicantName: "Grace Lee", subject: "Bereavement Leave", startDate: "2023-11-10", endDate: "2023-11-12", description: "Requesting leave due to a family bereavement. Will provide necessary documents.", status: "pending" },
    { id: 8, applicantName: "Henry Green", subject: "Study Leave", startDate: "2023-12-05", endDate: "2023-12-07", description: "Applying for study leave to prepare for professional certification exam.", status: "pending" },
    { id: 9, applicantName: "Ivy King", subject: "Medical Appointment", startDate: "2023-11-28", endDate: "2023-11-28", description: "Need to attend a routine medical check-up. Will be back in the afternoon.", status: "pending" },
    { id: 10, applicantName: "Jack Black", subject: "Unpaid Leave", startDate: "2023-12-15", endDate: "2023-12-20", description: "Requesting unpaid leave for personal reasons. Have exhausted all paid leave.", status: "pending" },
    { id: 11, applicantName: "Karen Stone", subject: "Annual Leave", startDate: "2024-01-10", endDate: "2024-01-17", description: "Planning a trip to visit family abroad. Need to finalize travel arrangements.", status: "pending" },
    { id: 12, applicantName: "Liam Hall", subject: "Sick Leave", startDate: "2023-11-09", endDate: "2023-11-09", description: "Sudden onset of fever. Unable to perform duties today.", status: "pending" },
    { id: 13, applicantName: "Mia Clark", subject: "Personal Day", startDate: "2023-12-03", endDate: "2023-12-03", description: "Taking a personal day for a home renovation project.", status: "pending" },
    { id: 14, applicantName: "Noah Lewis", subject: "Conference Leave", startDate: "2024-02-01", endDate: "2024-02-03", description: "Attending the annual industry conference. Registration confirmed.", status: "pending" },
    { id: 15, applicantName: "Olivia Scott", subject: "Emergency Leave", startDate: "2023-11-18", endDate: "2023-11-18", description: "Urgent family matter requires immediate attention.", status: "pending" },
    { id: 16, applicantName: "Peter Young", subject: "Annual Leave", startDate: "2024-03-01", endDate: "2024-03-07", description: "Planning a short getaway. Will ensure all tasks are handed over.", status: "pending" },
    { id: 17, applicantName: "Quinn Wright", subject: "Sick Leave", startDate: "2023-11-11", endDate: "2023-11-11", description: "Food poisoning, cannot come to office.", status: "pending" },
    { id: 18, applicantName: "Rachel Hill", subject: "Personal Leave", startDate: "2023-12-26", endDate: "2023-12-27", description: "Extended holiday break for family gathering.", status: "pending" },
    { id: 19, applicantName: "Sam Baker", subject: "Training Leave", startDate: "2024-01-20", endDate: "2024-01-22", description: "Attending mandatory compliance training.", status: "pending" },
    { id: 20, applicantName: "Tina Adams", subject: "Annual Leave", startDate: "2024-04-01", endDate: "2024-04-05", description: "Spring break vacation with kids.", status: "pending" },
    { id: 21, applicantName: "Uma Devi", subject: "Sick Leave", startDate: "2023-11-13", endDate: "2023-11-14", description: "Recovering from minor surgery.", status: "pending" },
    { id: 22, applicantName: "Victor Roy", subject: "Personal Leave", startDate: "2023-12-10", endDate: "2023-12-10", description: "Attending a friend's wedding.", status: "pending" },
    { id: 23, applicantName: "Wendy Chen", subject: "Annual Leave", startDate: "2024-02-15", endDate: "2024-02-20", description: "Visiting relatives overseas.", status: "pending" },
    { id: 24, applicantName: "Xavier Bell", subject: "Study Leave", startDate: "2024-03-10", endDate: "2024-03-12", description: "Preparing for a professional development course.", status: "pending" },
    { id: 25, applicantName: "Yara Khan", subject: "Emergency Leave", startDate: "2023-11-22", endDate: "2023-11-22", description: "Unexpected plumbing issue at home.", status: "pending" },
];

let allApplications = [...LEAVE_APPLICATIONS_DATA]; // Original dataset
let filteredApplications = [...allApplications]; // Applications after search/filter
let currentPage = 1;
const applicationsPerPage = 10;

const getStatusBadge = (status) => {
    const cls = status.toLowerCase();
    return `<span class="status-badge ${cls}">${status}</span>`;
};

const updateSummaryCards = () => {
    const totalApplications = allApplications.length; // Use allApplications for total count
    const pendingCount = allApplications.filter(app => app.status === 'pending').length;
    const approvedCount = allApplications.filter(app => app.status === 'approved').length;
    const rejectedCount = allApplications.filter(app => app.status === 'rejected').length;

    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('approved-count').textContent = approvedCount;
    document.getElementById('rejected-count').textContent = rejectedCount;

    document.getElementById('pending-percentage').textContent = totalApplications > 0 ? `${((pendingCount / totalApplications) * 100).toFixed(0)}%` : '0%';
    document.getElementById('approved-percentage').textContent = totalApplications > 0 ? `${((approvedCount / totalApplications) * 100).toFixed(0)}%` : '0%';
    document.getElementById('rejected-percentage').textContent = totalApplications > 0 ? `${((rejectedCount / totalApplications) * 100).toFixed(0)}%` : '0%';

    // Update circle progress (simplified for demonstration)
    const salesCircle = document.querySelector('.sales .progress circle');
    const expensesCircle = document.querySelector('.expenses .progress circle');
    const incomeCircle = document.querySelector('.income .progress circle');

    const calculateStrokeOffset = (count) => {
        if (totalApplications === 0) return 110; // Full circle if no applications
        const percentage = (count / totalApplications);
        return 110 - (percentage * 110); // Assuming stroke-dasharray is 110
    };

    if (salesCircle) salesCircle.style.strokeDashoffset = calculateStrokeOffset(pendingCount);
    if (expensesCircle) expensesCircle.style.strokeDashoffset = calculateStrokeOffset(approvedCount);
    if (incomeCircle) incomeCircle.style.strokeDashoffset = calculateStrokeOffset(rejectedCount);
};


const buildApplicationsTable = () => {
    const tbody = document.querySelector("#leave-applications-table tbody");
    tbody.innerHTML = ""; // Clear existing rows

    const startIndex = (currentPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    const applicationsToDisplay = filteredApplications.slice(startIndex, endIndex);

    if (applicationsToDisplay.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No applications found.</td></tr>`;
        return;
    }

    let bodyContent = '';
    applicationsToDisplay.forEach(app => {
        bodyContent += `
        <tr data-id="${app.id}">
          <td>${app.applicantName}</td>
          <td>${app.subject}</td>
          <td>${new Date(app.startDate).toLocaleDateString()}</td>
          <td>${new Date(app.endDate).toLocaleDateString()}</td>
          <td>${getStatusBadge(app.status)}</td>
          <td class="primary view-details">Details</td>
        </tr>
      `;
    });
    tbody.innerHTML = bodyContent;

    // Add event listeners for details button
    tbody.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const appId = parseInt(row.dataset.id);
            showLeaveDetailModal(appId);
        });
    });

    setupPagination();
};

const setupPagination = () => {
    const paginationContainer = document.querySelector(".recent-orders .orders-header a"); // Re-using the "Show All" link's parent
    if (!paginationContainer) return;

    // Remove existing pagination if any
    let existingPaginationDiv = document.getElementById('pagination-controls');
    if (existingPaginationDiv) {
        existingPaginationDiv.remove();
    }

    const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

    if (totalPages <= 1) {
        // No pagination needed
        return;
    }

    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'pagination-controls';
    paginationDiv.style.display = 'flex';
    paginationDiv.style.justifyContent = 'center';
    paginationDiv.style.marginTop = '1rem';
    paginationDiv.style.gap = '0.5rem';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('span');
        pageLink.textContent = i;
        pageLink.classList.add('page-link');
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', () => {
            currentPage = i;
            buildApplicationsTable();
        });
        paginationDiv.appendChild(pageLink);
    }

    // Insert pagination before the "Show All" link
    paginationContainer.parentNode.insertBefore(paginationDiv, paginationContainer);
};


const showLeaveDetailModal = (appId) => {
    const application = allApplications.find(app => app.id === appId); // Use allApplications to find original data
    if (!application) return;

    const modal = document.getElementById('leave-detail-modal');
    document.getElementById('modal-applicant').textContent = application.applicantName;
    document.getElementById('modal-subject').textContent = application.subject;
    document.getElementById('modal-start-date').textContent = new Date(application.startDate).toLocaleDateString();
    document.getElementById('modal-end-date').textContent = new Date(application.endDate).toLocaleDateString();
    document.getElementById('modal-description').textContent = application.description;
    document.getElementById('modal-status').innerHTML = getStatusBadge(application.status);

    const approveBtn = document.getElementById('approve-btn');
    const rejectBtn = document.getElementById('reject-btn');

    // Store appId on buttons for easy access in event listeners
    approveBtn.dataset.appId = appId;
    rejectBtn.dataset.appId = appId;

    // Remove previous listeners to prevent multiple calls
    approveBtn.onclick = null;
    rejectBtn.onclick = null;

    approveBtn.addEventListener('click', (e) => updateApplicationStatus(parseInt(e.target.dataset.appId), 'approved'), { once: true });
    rejectBtn.addEventListener('click', (e) => updateApplicationStatus(parseInt(e.target.dataset.appId), 'rejected'), { once: true });


    // Hide/show buttons based on current status
    if (application.status === 'pending') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }

    modal.style.display = 'flex'; // Use flex to center the modal
};
const updateApplicationStatus = (appId, newStatus) => {
    const applicationIndex = allApplications.findIndex(app => app.id === appId);
    if (applicationIndex > -1) {
        allApplications[applicationIndex].status = newStatus;

        // Remove from filtered (shown) table if we are in pending view
        filteredApplications = filteredApplications.filter(app => app.id !== appId);

        updateSummaryCards();
        buildApplicationsTable();

        document.getElementById('leave-detail-modal').style.display = 'none';
    }
};


const applyApplicationFilter = (filter) => {
    let tempFiltered = [...allApplications]; // Start with all data

    // Apply search first
    const searchValue = document.getElementById("application-search")?.value.toLowerCase() || "";
    if (searchValue) {
        tempFiltered = tempFiltered.filter(app =>
            app.applicantName.toLowerCase().includes(searchValue) ||
            app.subject.toLowerCase().includes(searchValue) ||
            app.description.toLowerCase().includes(searchValue)
        );
    }

    // Then apply status filter
    if (filter !== 'all') {
        tempFiltered = tempFiltered.filter(app => app.status.toLowerCase() === filter.toLowerCase());
    }

    filteredApplications = tempFiltered; // Update the global filteredApplications
    currentPage = 1; // Reset to first page after filter/search
    buildApplicationsTable();
};

document.addEventListener("DOMContentLoaded", () => {
    updateSummaryCards();
    applyApplicationFilter('all'); // Initial load with all applications

    // Modal close functionality
    const modal = document.getElementById('leave-detail-modal');
    const closeButton = document.querySelector('.modal .close-button');
    closeButton.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Search functionality
    const searchInput = document.getElementById("application-search");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            applyApplicationFilter(document.querySelector('.dropdown-content div.active')?.dataset.filter || 'all');
        });
    }

    // Filter dropdown logic
    const sortIcon = document.getElementById("sort-icon");
    const sortOptions = document.getElementById("sort-options");

    if (sortIcon && sortOptions) {
        sortIcon.addEventListener("click", () => {
            sortOptions.style.display =
                sortOptions.style.display === "block" ? "none" : "block";
        });

        sortOptions.querySelectorAll("div").forEach((option) => {
            option.addEventListener("click", () => {
                // Remove active class from all options and add to the clicked one
                sortOptions.querySelectorAll("div").forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                const filter = option.getAttribute("data-filter");
                applyApplicationFilter(filter);
                sortOptions.style.display = "none";
            });
        });

        document.addEventListener("click", (e) => {
            if (
                !sortIcon.contains(e.target) &&
                !sortOptions.contains(e.target) &&
                sortOptions.style.display === "block"
            ) {
                sortOptions.style.display = "none";
            }
        });
    }

    // Sidebar & theme toggle (re-used from index.js, ensure it's not duplicated if index.js is also loaded)
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


    const showStatusList = (status) => {
        const list = allApplications.filter(app => app.status === status.toLowerCase());
        if (list.length === 0) {
            alert(`No ${status} applications.`);
            return;
        }

        const names = list.map(app => `• ${app.applicantName} (${app.subject})`).join('\n');
        alert(`${status.toUpperCase()} Applications:\n\n${names}`);
    };

    const statusCardMap = {
        pending: 'sales',
        approved: 'expenses',
        rejected: 'income',
    };

    Object.entries(statusCardMap).forEach(([status, className]) => {
        const card = document.querySelector(`.${className}`);
        if (card) {
            card.addEventListener('click', () => {
                applyApplicationFilter(status);
                showBackToAllButton();
            });
        }
    });


    const backToAllBtn = document.getElementById('back-to-all-btn');
    if (backToAllBtn) {
        backToAllBtn.addEventListener('click', () => {
            // Remove filter, restore full view
            document.querySelectorAll('.dropdown-content div').forEach(d => d.classList.remove('active'));
            applyApplicationFilter('pending');
            backToAllBtn.style.display = 'none';
        });
    }

    function showBackToAllButton() {
        const btn = document.getElementById('back-to-all-btn');
        if (btn) btn.style.display = 'inline-block';
    }

    


});
