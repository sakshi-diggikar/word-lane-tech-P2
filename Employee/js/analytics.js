document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const cardsView = document.getElementById('cardsView');
    const dynamicContent = document.getElementById('dynamicContent');
    const backButton = document.getElementById('backButton');
    const sectionTitle = document.getElementById('sectionTitle');
    const dataTable = document.getElementById('dataTable');
    const tableFilters = document.querySelector('.table-filters');
    const searchInput = document.getElementById('searchInput');
    const mainChartCtx = document.getElementById('mainChart').getContext('2d');
    const secondaryChartCtx = document.getElementById('secondaryChart').getContext('2d');
    const analyticsCharts = document.querySelector('.analytics-charts');

    // Global variables for leave data
    let currentEmployeeId = 'emp001'; // Default, will be updated from session
    let leaveApplications = [];
    let leaveStats = { pending: 0, approved: 0, rejected: 0, total: 0 };

    // Updated cardsData with filters and no graphs for profile
    const cardsData = [
        {
            id: 'attendance-analytics',
            title: 'Attendance Analytics',
            icon: 'fa-calendar-check',
            value: '22/26',
            badge: 'success',
            badgeText: '84.6%',
            description: 'Self View: Track attendance & punctuality',
            tableHeaders: ['Date', 'Day', 'Status', 'Check-In Time', 'Check-Out Time', 'Total Hours', 'Remarks'],
            tableData: [
                ['2025-06-01', 'Monday', 'Present', '09:03 AM', '06:02 PM', '8h 59m', '-'],
                ['2025-06-02', 'Tuesday', 'Absent', '-', '-', '-', 'Sick Leave'],
                ['2025-06-03', 'Wednesday', 'Present', '09:10 AM', '06:00 PM', '8h 50m', 'Late check-in'],
                ['2025-06-04', 'Thursday', 'Present', '08:58 AM', '06:12 PM', '9h 14m', '-'],
                ['2025-06-05', 'Friday', 'Present', '09:05 AM', '06:01 PM', '8h 56m', '-'],
                ['2025-06-08', 'Monday', 'Present', '08:55 AM', '06:10 PM', '9h 15m', '-'],
                ['2025-06-09', 'Tuesday', 'Present', '09:12 AM', '06:05 PM', '8h 53m', 'Late check-in'],
                ['2025-06-10', 'Wednesday', 'Present', '09:00 AM', '06:00 PM', '9h 00m', '-'],
                ['2025-06-11', 'Thursday', 'Present', '08:50 AM', '06:15 PM', '9h 25m', '-'],
                ['2025-06-12', 'Friday', 'Present', '09:02 AM', '06:03 PM', '9h 01m', '-']
            ],
            filters: [
                {
                    id: 'status-filter',
                    label: 'Status',
                    options: ['All', 'Present', 'Absent', 'Late']
                },
                {
                    id: 'month-filter',
                    label: 'Month',
                    options: ['All', 'June 2025', 'May 2025', 'April 2025']
                }
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['Present', 'Absent', 'Leave'],
                    datasets: [{
                        label: 'Days Count',
                        data: [22, 2, 2],
                        backgroundColor: ['#41f1b6', '#ff7782', '#ffbb55']
                    }]
                },
                options: { responsive: true }
            },
            secondaryChart: {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Avg Check-In Time (hh.mm)',
                        data: [9.1, 9.05, 8.95, 9.2],
                        borderColor: '#7380ec',
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            }
        },
        {
            id: 'task-completion-analytics',
            title: 'Task Completion Analytics',
            icon: 'fa-tasks',
            value: '87%',
            badge: 'success',
            badgeText: '+5%',
            description: 'Your task performance for this month',
            tableHeaders: ['Task Name', 'Project', 'Assigned By', 'Deadline', 'Status', 'Completion %'],
            tableData: [
                ['Login API', 'Ecom App', 'Ankit Rao', '2025-06-12', 'Completed', '100%'],
                ['Checkout Flow', 'Ecom App', 'Ankit Rao', '2025-06-15', 'In Progress', '80%'],
                ['Unit Tests', 'Ecom App', 'Priya Seth', '2025-06-18', 'Pending', '0%'],
                ['Dashboard UI', 'Analytics', 'Rahul Mehta', '2025-06-10', 'Completed', '100%'],
                ['API Documentation', 'Ecom App', 'Ankit Rao', '2025-06-20', 'In Progress', '60%'],
                ['Bug Fixes', 'Analytics', 'Rahul Mehta', '2025-06-05', 'Completed', '100%']
            ],
            filters: [
                {
                    id: 'status-filter',
                    label: 'Status',
                    options: ['All', 'Completed', 'In Progress', 'Pending']
                },
                {
                    id: 'project-filter',
                    label: 'Project',
                    options: ['All', 'Ecom App', 'Analytics']
                }
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Pending', 'In Progress'],
                    datasets: [{
                        data: [15, 3, 2],
                        backgroundColor: ['#41f1b6', '#ffbb55', '#7380ec']
                    }]
                },
                options: { responsive: true }
            },
            secondaryChart: {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Completion %',
                        data: [40, 55, 70, 87],
                        borderColor: '#ffbb55',
                        tension: 0.4
                    }]
                },
                options: { responsive: true }
            }
        },
        {
            id: 'leave-analytics',
            title: 'Leave Application Analytics',
            icon: 'fa-plane-departure',
            value: '0 Days',
            badge: 'warning',
            badgeText: '0 Pending',
            description: 'Your leave activity this month',
            tableHeaders: ['Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Applied On'],
            tableData: [], // Will be populated from API
            filters: [
                {
                    id: 'status-filter',
                    label: 'Status',
                    options: ['All', 'Approved', 'Pending', 'Rejected']
                },
                {
                    id: 'type-filter',
                    label: 'Leave Type',
                    options: ['All', 'Casual', 'Sick', 'Earned', 'Annual']
                }
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['Casual', 'Sick', 'Earned', 'Annual'],
                    datasets: [{
                        label: 'Days Taken',
                        data: [0, 0, 0, 0],
                        backgroundColor: ['#7380ec', '#ff7782', '#ffbb55', '#41f1b6']
                    }]
                },
                options: { responsive: true }
            },
            secondaryChart: {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Leaves Taken',
                        data: [0, 0, 0, 0, 0, 0],
                        borderColor: '#7380ec',
                        tension: 0.3
                    }]
                },
                options: { responsive: true }
            }
        },
        {
            id: 'profile-overview',
            title: 'Profile Overview',
            icon: 'fa-user-circle',
            value: 'EMP-1023',
            badge: 'success',
            badgeText: 'Active',
            description: 'Personal & organizational details',
            tableHeaders: ['Field', 'Value'],
            tableData: [
                ['Name', 'Prerna Patil'],
                ['Emp ID', 'EMP-1023'],
                ['Designation', 'Software Engineer'],
                ['Department', 'Development'],
                ['DOJ', '15 Feb 2022'],
                ['Manager', 'Ravi Kumar'],
                ['Email', 'prerna.patil@example.com'],
                ['Phone', '+91 98765 43210'],
                ['Address', '201, Sunshine Apartments, Mumbai'],
                ['Emergency Contact', 'Rajesh Patil (+91 98765 12340)']
            ],
            filters: [], // No filters for profile
            showCharts: false // Flag to hide charts for profile
        }
    ];

    // Chart instances
    let mainChart = null;
    let secondaryChart = null;
    let currentCard = null;

    // Initialize the page
    async function init() {
        await loadEmployeeData();
        await loadLeaveApplications();
        renderCards();
        setupEventListeners();
        startLeaveStatusPolling();
    }

    // Load employee data
    async function loadEmployeeData() {
        try {
            const employeeUserId = sessionStorage.getItem("emp_user_id") || "emp001";
            currentEmployeeId = employeeUserId;
        } catch (error) {
            console.error('Error loading employee data:', error);
        }
    }

    // Load leave applications
    async function loadLeaveApplications() {
        try {
            const response = await leaveAPI.getEmployeeLeaves(currentEmployeeId);
            if (response.success) {
                leaveApplications = response.leaves || [];
                
                // Check for status changes and show notifications
                checkLeaveStatusChanges(leaveApplications);
                
                // Update leave analytics
                updateLeaveAnalytics();
            } else {
                console.error('Failed to load leave applications:', response.message);
            }
        } catch (error) {
            console.error('Error loading leave applications:', error);
        }
    }

    // Update leave analytics with real data
    function updateLeaveAnalytics() {
        const leaveCard = cardsData.find(card => card.id === 'leave-analytics');
        if (!leaveCard) return;

        // Calculate statistics
        leaveStats = {
            pending: leaveApplications.filter(leave => leave.leave_status === 'Pending').length,
            approved: leaveApplications.filter(leave => leave.leave_status === 'Approved').length,
            rejected: leaveApplications.filter(leave => leave.leave_status === 'Rejected').length,
            total: leaveApplications.length
        };

        // Calculate total days
        const totalDays = leaveApplications
            .filter(leave => leave.leave_status === 'Approved')
            .reduce((total, leave) => {
                const start = new Date(leave.leave_start_date);
                const end = new Date(leave.leave_end_date);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return total + days;
            }, 0);

        // Update card values
        leaveCard.value = `${totalDays} Days`;
        leaveCard.badgeText = `${leaveStats.pending} Pending`;

        // Update table data
        leaveCard.tableData = leaveApplications.map(leave => {
            const start = new Date(leave.leave_start_date);
            const end = new Date(leave.leave_end_date);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            const appliedDate = new Date(leave.leave_created_at).toLocaleDateString();
            
            return [
                'Annual Leave', // Default type since we don't have it in the current schema
                start.toLocaleDateString(),
                end.toLocaleDateString(),
                days.toString(),
                leave.leave_reason,
                leave.leave_status,
                appliedDate
            ];
        });

        // Update charts
        const leaveTypes = ['Casual', 'Sick', 'Earned', 'Annual'];
        const leaveTypeData = leaveTypes.map(type => {
            // For now, all leaves are counted as Annual since we don't have type in schema
            return type === 'Annual' ? totalDays : 0;
        });

        leaveCard.mainChart.data.datasets[0].data = leaveTypeData;

        // Update monthly data (simplified - just current month)
        const currentMonth = new Date().getMonth();
        const monthlyData = [0, 0, 0, 0, 0, 0];
        monthlyData[currentMonth] = totalDays;
        leaveCard.secondaryChart.data.datasets[0].data = monthlyData;

        // Re-render cards if leave card is currently displayed
        if (currentCard && currentCard.id === 'leave-analytics') {
            renderCards();
            showCardDetails(leaveCard);
        }
    }

    // Poll for leave status changes
    function startLeaveStatusPolling() {
        setInterval(async () => {
            const previousStats = { ...leaveStats };
            await loadLeaveApplications();
            
            // Check for status changes and show notifications
            if (leaveStats.approved > previousStats.approved) {
                const newApproved = leaveStats.approved - previousStats.approved;
                showNotification(`${newApproved} leave application(s) approved!`, 'success');
            }
            
            if (leaveStats.rejected > previousStats.rejected) {
                const newRejected = leaveStats.rejected - previousStats.rejected;
                showNotification(`${newRejected} leave application(s) rejected.`, 'error');
            }
        }, 30000); // Check every 30 seconds
    }

    // Show notification function
    function showNotification(message, type = 'success') {
        const statusNotification = document.getElementById('status-notification');
        const statusMessage = document.getElementById('status-notification-message');
        
        if (statusMessage) statusMessage.textContent = message;
        if (statusNotification) {
            statusNotification.className = `status-notification ${type}`;
            statusNotification.classList.add('show');
            
            setTimeout(() => {
                statusNotification.classList.remove('show');
            }, type === 'error' ? 5000 : 3000);
        } else {
            // Fallback to alert if notification element not found
            alert(message);
        }
    }

    // Render all cards
    function renderCards() {
        cardsView.innerHTML = '';
        cardsData.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            if (card.id === 'profile-overview') {
                cardElement.classList.add('profile-card'); // Add special class
            }
            cardElement.dataset.id = card.id;

            cardElement.innerHTML = `
                <div class="card-header">
                    <div class="card-icon">
                        <i class="fas ${card.icon}"></i>
                    </div>
                    <div>
                        <h3 class="card-title">${card.title}</h3>
                        <p class="card-subtitle">${card.description}</p>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-stats">
                        <h2 class="card-value">${card.value}</h2>
                        
                    </div>
                </div>
            `;

            cardsView.appendChild(cardElement);
            const valueEl = cardElement.querySelector('.card-value');
            animateEmpId(valueEl, card.value); // Works with "EMP-1023"
            animateCountUp(valueEl, card.value);

            createLoopingBadge(cardElement, card.badge, card.badgeText);
        });
    }

   function animateEmpId(el, value, duration = 1000) {
    const match = value.match(/^([^\d]+)(\d+)$/); // Match prefix and number
    if (!match) {
        el.textContent = value;
        return;
    }

    const prefix = match[1]; // e.g., "EMP-"
    const number = parseInt(match[2]); // e.g., 1023
    let currentText = "";
    let step = 0;

    // Step 1: Type prefix like "E" -> "EM" -> "EMP-"
    const typeInterval = setInterval(() => {
        currentText += prefix[step];
        el.textContent = currentText;
        step++;

        if (step >= prefix.length) {
            clearInterval(typeInterval);
            animateCountUpWithPrefix(el, prefix, number, duration); // Step 2
        }
    }, 120);
}


    function createLoopingBadge(cardElement, badgeType, badgeText) {
        cardElement.style.position = 'relative';

        const loopBadge = () => {
            const bubble = document.createElement('div');
            bubble.className = `card-notify-circle ${badgeType}`;
            bubble.textContent = badgeText;
            bubble.style.opacity = '0';
            cardElement.appendChild(bubble);

            setTimeout(() => {
                bubble.style.animation = 'none';
                void bubble.offsetWidth;
                bubble.style.animation = 'swipeIn 0.5s ease-out forwards';
            }, 2000); // Delay before appearing

            setTimeout(() => {
                bubble.style.animation = 'swipeOut 0.5s ease forwards';
                setTimeout(() => {
                    bubble.remove();
                    loopBadge(); // 🔁 Repeat
                }, 5000);
            }, 5000); // Total time before removing
        };

        loopBadge(); // First launch
    }

   function animateCountUpWithPrefix(el, prefix, endValue, duration = 500) {
    let start = 0;
    let startTime = null;

    function update(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * endValue);
        el.textContent = `${prefix}${value}`;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}


    function animateCountUp(el, endValue, duration = 500) {
        const isPercent = typeof endValue === 'string' && endValue.trim().endsWith('%');
        const target = parseFloat(endValue);
        let start = 0;
        let startTime = null;

        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            el.textContent = isPercent ? `${value}%` : value;
            if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
    }
    // Setup event listeners
    function setupEventListeners() {
        // Card click event
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function () {
                const cardId = this.dataset.id;
                currentCard = cardsData.find(c => c.id === cardId);
                showCardDetails(currentCard);
            });
        });

        // Back button event
        backButton.addEventListener('click', function () {
            cardsView.style.display = 'grid';
            dynamicContent.style.display = 'none';

            // Destroy charts
            if (mainChart) mainChart.destroy();
            if (secondaryChart) secondaryChart.destroy();
        });

        // Search functionality
        searchInput.addEventListener('input', filterTable);

        // Listen for leave application submissions
        window.addEventListener('leaveApplicationSubmitted', async () => {
            await loadLeaveApplications();
            showNotification('Leave application added to your analytics!', 'success');
        });

        // Listen for leave status updates
        window.addEventListener('leaveStatusUpdated', async () => {
            await loadLeaveApplications();
            showNotification('Leave status updated!', 'success');
        });
    }

    // Show card details
    function showCardDetails(cardData) {

        const tableWrapper = dataTable.closest('.table-wrapper');
        if (tableWrapper) {
            if (cardData.id === 'profile-overview') {
                tableWrapper.classList.add('no-scroll-profile', 'profile-table');
            } else {
                tableWrapper.classList.remove('no-scroll-profile', 'profile-table');
            }
        }


        cardsView.style.display = 'none';
        dynamicContent.style.display = 'block';
        sectionTitle.textContent = cardData.title;

        // Render filters
        renderFilters(cardData);

        // Render table
        renderTable(cardData);

        // Render charts (if not profile card)
        if (cardData.showCharts !== false) {
            analyticsCharts.style.display = 'grid';
            renderCharts(cardData);
        } else {
            analyticsCharts.style.display = 'none';
        }


        dynamicContent.scrollTo(0, 0);
    }

    // Render filters for the current card
    function renderFilters(cardData) {
        tableFilters.innerHTML = '';

        if (cardData.filters && cardData.filters.length > 0) {
            cardData.filters.forEach(filter => {
                const filterGroup = document.createElement('div');
                filterGroup.className = 'filter-group';

                const label = document.createElement('label');
                label.textContent = filter.label;
                label.htmlFor = filter.id;
                filterGroup.appendChild(label);

                const select = document.createElement('select');
                select.id = filter.id;

                filter.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });

                select.addEventListener('change', () => {
                    filterTable();
                });

                filterGroup.appendChild(select);
                tableFilters.appendChild(filterGroup);
            });
        }
    }

    // Render table with pagination
    function renderTable(cardData) {
        dataTable.innerHTML = '';


        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        cardData.tableHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        dataTable.appendChild(thead);

        // Create table body with filtered data
        const tbody = document.createElement('tbody');
        const filteredData = filterTableData(cardData.tableData);

        filteredData.slice(0, 20).forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        dataTable.appendChild(tbody);

        // Add pagination if needed
        if (filteredData.length > 20) {
            addPagination(filteredData);



        }

    }

    // Filter table data based on selected filters
    function filterTableData(data) {
        if (!currentCard || !currentCard.filters || currentCard.filters.length === 0) {
            return data;
        }

        return data.filter(row => {
            return currentCard.filters.every(filter => {
                const select = document.getElementById(filter.id);
                if (!select || select.value === 'All') return true;

                // Get the column index to filter on
                const columnIndex = currentCard.tableHeaders.indexOf(filter.label === 'Status' ? 'Status' :
                    filter.label === 'Leave Type' ? 'Leave Type' :
                        filter.label === 'Project' ? 'Project' : -1);

                if (columnIndex === -1) return true;

                return row[columnIndex].includes(select.value);
            });
        });
    }

    // Filter table rows based on search input
    function filterTable() {
        const term = searchInput.value.toLowerCase();
        const rows = dataTable.querySelectorAll('tbody tr');
        const filteredData = filterTableData(currentCard.tableData);

        rows.forEach((row, index) => {
            if (index < filteredData.length) {
                const text = filteredData[index].join(' ').toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Add pagination controls
    function addPagination(tableData) {
        const pagination = document.createElement('div');
        pagination.className = 'table-pagination';
        pagination.innerHTML = `
            <span class="pagination-info">Showing 1-20 of ${tableData.length}</span>
            <div class="pagination-controls">
                <button class="pagination-btn prev-btn" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-indicator">1/${Math.ceil(tableData.length / 20)}</span>
                <button class="pagination-btn next-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;

        dataTable.parentElement.appendChild(pagination);

        // Pagination event listeners
        let currentPage = 1;
        const totalPages = Math.ceil(tableData.length / 20);
        const prevBtn = pagination.querySelector('.prev-btn');
        const nextBtn = pagination.querySelector('.next-btn');
        const pageIndicator = pagination.querySelector('.page-indicator');
        const infoSpan = pagination.querySelector('.pagination-info');

        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTablePage();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTablePage();
            }
        });

        function updateTablePage() {
            const start = (currentPage - 1) * 20;
            const end = start + 20;
            const pageData = filterTableData(currentCard.tableData).slice(start, end);

            const tbody = dataTable.querySelector('tbody');
            tbody.innerHTML = '';

            pageData.forEach(rowData => {
                const row = document.createElement('tr');
                rowData.forEach(cellData => {
                    const td = document.createElement('td');
                    td.textContent = cellData;
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });

            // Update controls
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
            pageIndicator.textContent = `${currentPage}/${totalPages}`;
            infoSpan.textContent = `Showing ${start + 1}-${Math.min(end, tableData.length)} of ${tableData.length}`;

            // Apply search filter again
            filterTable();
        }
    }

    // Render charts
    function renderCharts(cardData) {
        if (mainChart) mainChart.destroy();
        if (secondaryChart) secondaryChart.destroy();

        mainChart = new Chart(mainChartCtx, cardData.mainChart);
        secondaryChart = new Chart(secondaryChartCtx, cardData.secondaryChart);
    }

    // Initialize the application
    init();

    
    const themeToggler = document.querySelector('.theme-toggler');
    const lightIcon = themeToggler?.querySelector('span:nth-child(1)');
    const darkIcon = themeToggler?.querySelector('span:nth-child(2)');

    // Toggle theme on click
    if (themeToggler) {
        themeToggler.addEventListener('click', () => {
            document.body.classList.toggle('dark');

            // Toggle icon styles
            lightIcon?.classList.toggle('active');
            darkIcon?.classList.toggle('active');

            // Save preference
            const isDark = document.body.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        darkIcon?.classList.add('active');
        lightIcon?.classList.remove('active');
    } else {
        lightIcon?.classList.add('active');
        darkIcon?.classList.remove('active');
    }

    // Check for leave status changes and show notifications
    function checkLeaveStatusChanges(currentLeaves) {
        if (!window.previousLeaveStatuses) {
            window.previousLeaveStatuses = {};
            currentLeaves.forEach(leave => {
                window.previousLeaveStatuses[leave.leave_id] = leave.leave_status;
            });
            return;
        }

        currentLeaves.forEach(leave => {
            const previousStatus = window.previousLeaveStatuses[leave.leave_id];
            const currentStatus = leave.leave_status;
            
            if (previousStatus && previousStatus !== currentStatus) {
                // Status changed - show notification
                if (currentStatus === 'Approved') {
                    showNotification('Your leave application has been approved!', 'success');
                    playNotificationSound();
                } else if (currentStatus === 'Rejected') {
                    showNotification('Your leave application has been rejected.', 'error');
                    playNotificationSound();
                }
            }
            
            // Update previous status
            window.previousLeaveStatuses[leave.leave_id] = currentStatus;
        });
    }

    // Play notification sound
    function playNotificationSound() {
        try {
            const audio = new Audio('../audio/notification.mp3');
            audio.play().catch(e => console.log('Could not play notification sound:', e));
        } catch (error) {
            console.log('Error playing notification sound:', error);
        }
    }
});