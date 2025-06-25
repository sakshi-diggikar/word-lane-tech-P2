document.addEventListener('DOMContentLoaded', function() {
    // Manually call the common event listeners setup
    if(typeof setupCommonEventListeners === 'function') {
        setupCommonEventListeners();
    }

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

    // Sample data for all cards
    const cardsData = [
        {
            id: 'team-analytics',
            title: 'Team Analytics',
            icon: 'fa-people-group',
            value: '12',
            badge: 'success',
            badgeText: '+2.5%',
            description: 'Company-wide team performance',
            tableHeaders: ['Team Name', 'Team Lead', 'Total Members', 'Completed Projects', 'Ongoing Projects', 'Performance %'],
            tableData: [
                ['Frontend Team', 'Sarah Johnson', '8', '15', '4', '87%'],
                ['Backend Team', 'Michael Chen', '7', '12', '5', '82%'],
                ['Design Team', 'Emma Wilson', '5', '8', '3', '91%'],
                ['QA Team', 'David Kim', '4', '6', '2', '78%'],
                ['DevOps Team', 'Robert Taylor', '3', '5', '1', '85%']
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['Frontend', 'Backend', 'Design', 'QA', 'DevOps'],
                    datasets: [{
                        label: 'Performance %',
                        data: [87, 82, 91, 78, 85],
                        backgroundColor: '#7380ec',
                        borderColor: '#7380ec',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            },
            secondaryChart: {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Frontend',
                            data: [65, 59, 80, 81, 76, 87],
                            borderColor: '#7380ec',
                            backgroundColor: 'rgba(115, 128, 236, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Backend',
                            data: [70, 65, 75, 79, 80, 82],
                            borderColor: '#ffbb55',
                            backgroundColor: 'rgba(255, 187, 85, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }
        },
        {
            id: 'leave-analytics',
            title: 'Leave Applications',
            icon: 'fa-calendar-days',
            value: '24',
            badge: 'warning',
            badgeText: '+5 pending',
            description: 'Leave requests overview',
            tableHeaders: ['Employee Name', 'Leave Type', 'Duration', 'Status', 'Department', 'Approval Manager'],
            tableData: [
                ['John Smith', 'Sick Leave', '2 days', 'Approved', 'Development', 'Sarah Johnson'],
                ['Emily Davis', 'Vacation', '1 week', 'Pending', 'Design', 'Emma Wilson'],
                ['Michael Brown', 'Personal', '3 days', 'Rejected', 'QA', 'David Kim'],
                ['Jessica Lee', 'Sick Leave', '1 day', 'Approved', 'Development', 'Sarah Johnson'],
                ['Daniel Wilson', 'Maternity', '12 weeks', 'Approved', 'HR', 'Lisa Taylor']
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Approved', 'Pending', 'Rejected'],
                    datasets: [{
                        data: [15, 5, 4],
                        backgroundColor: ['#41f1b6', '#ffbb55', '#ff7782'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            },
            secondaryChart: {
                type: 'bar',
                data: {
                    labels: ['Development', 'Design', 'QA', 'HR', 'Marketing'],
                    datasets: [{
                        label: 'Leave Requests',
                        data: [8, 5, 3, 4, 4],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'project-analytics',
            title: 'Project Analytics',
            icon: 'fa-diagram-project',
            value: '18',
            badge: 'danger',
            badgeText: '3 delayed',
            description: 'Project progress tracking',
            tableHeaders: ['Project Name', 'Client Name', 'Team', 'Start Date', 'Deadline', 'Progress %', 'Status'],
            tableData: [
                ['E-commerce Platform', 'ShopEasy', 'Frontend Team', '2023-01-15', '2023-06-30', '92%', 'Ongoing'],
                ['Mobile App Redesign', 'TravelGo', 'Design Team', '2023-02-10', '2023-05-15', '100%', 'Completed'],
                ['API Optimization', 'DataSystems', 'Backend Team', '2023-03-01', '2023-07-15', '78%', 'Ongoing'],
                ['Dashboard Redesign', 'AnalyticsPro', 'Frontend Team', '2023-04-05', '2023-08-20', '65%', 'Delayed'],
                ['Security Audit', 'BankSecure', 'DevOps Team', '2023-05-15', '2023-09-30', '45%', 'Ongoing']
            ],
            mainChart: {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'E-commerce Platform',
                            data: [10, 25, 40, 60, 75, 92],
                            borderColor: '#7380ec',
                            backgroundColor: 'rgba(115, 128, 236, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Mobile App Redesign',
                            data: [15, 35, 65, 85, 100, 100],
                            borderColor: '#41f1b6',
                            backgroundColor: 'rgba(65, 241, 182, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            },
            secondaryChart: {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Ongoing', 'Delayed'],
                    datasets: [{
                        data: [6, 9, 3],
                        backgroundColor: ['#41f1b6', '#7380ec', '#ff7782'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'attendance-analytics',
            title: 'Attendance Analytics',
            icon: 'fa-calendar-check',
            value: '96%',
            badge: 'success',
            badgeText: '+1.2%',
            description: 'Employee attendance tracking',
            tableHeaders: ['Employee Name', 'Working Days', 'Present Days', 'Absent Days', 'Late Logins', 'Attendance %'],
            tableData: [
                ['John Smith', '22', '21', '1', '3', '95%'],
                ['Emily Davis', '22', '22', '0', '1', '100%'],
                ['Michael Brown', '22', '20', '2', '5', '91%'],
                ['Jessica Lee', '22', '21', '1', '2', '95%'],
                ['Daniel Wilson', '22', '18', '4', '7', '82%']
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['John Smith', 'Emily Davis', 'Michael Brown', 'Jessica Lee', 'Daniel Wilson'],
                    datasets: [{
                        label: 'Attendance %',
                        data: [95, 100, 91, 95, 82],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            },
            secondaryChart: {
                type: 'pie',
                data: {
                    labels: ['Present', 'Absent'],
                    datasets: [{
                        data: [102, 8],
                        backgroundColor: ['#41f1b6', '#ff7782'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'employee-analytics',
            title: 'Employee Analytics',
            icon: 'fa-users',
            value: '45',
            badge: 'success',
            badgeText: '+3 new',
            description: 'Employee database',
            tableHeaders: ['Employee Name', 'Department', 'Designation', 'Joining Date', 'Current Status', 'Performance Rating'],
            tableData: [
                ['John Smith', 'Development', 'Senior Developer', '2020-05-15', 'Active', '4.8/5'],
                ['Emily Davis', 'Design', 'UI/UX Designer', '2021-02-10', 'Active', '4.5/5'],
                ['Michael Brown', 'QA', 'QA Engineer', '2021-07-22', 'Active', '4.2/5'],
                ['Jessica Lee', 'Development', 'Junior Developer', '2022-01-05', 'Active', '4.0/5'],
                ['Daniel Wilson', 'HR', 'HR Manager', '2019-11-18', 'Active', '4.7/5']
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Active', 'Inactive'],
                    datasets: [{
                        data: [42, 3],
                        backgroundColor: ['#41f1b6', '#ff7782'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            },
            secondaryChart: {
                type: 'bar',
                data: {
                    labels: ['Development', 'Design', 'QA', 'HR', 'Marketing', 'Sales'],
                    datasets: [{
                        label: 'Employees',
                        data: [15, 6, 5, 4, 8, 7],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'task-analytics',
            title: 'Task Analytics',
            icon: 'fa-tasks',
            value: '128',
            badge: 'warning',
            badgeText: '24 pending',
            description: 'Task completion tracking',
            tableHeaders: ['Task Name', 'Assigned To', 'Assigned By', 'Deadline', 'Status', 'Completion %'],
            tableData: [
                ['Implement Auth API', 'John Smith', 'Sarah Johnson', '2023-06-15', 'Completed', '100%'],
                ['Design Dashboard UI', 'Emily Davis', 'Emma Wilson', '2023-06-20', 'In Progress', '75%'],
                ['Write Test Cases', 'Michael Brown', 'David Kim', '2023-06-10', 'Overdue', '60%'],
                ['Deploy to Staging', 'Robert Taylor', 'Sarah Johnson', '2023-06-25', 'Pending', '0%'],
                ['Client Meeting Prep', 'Jessica Lee', 'Lisa Taylor', '2023-06-12', 'Completed', '100%']
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Pending'],
                    datasets: [{
                        data: [104, 24],
                        backgroundColor: ['#41f1b6', '#ffbb55'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            },
            secondaryChart: {
                type: 'bar',
                data: {
                    labels: ['John Smith', 'Emily Davis', 'Michael Brown', 'Jessica Lee', 'Robert Taylor'],
                    datasets: [{
                        label: 'Tasks Assigned',
                        data: [28, 22, 18, 25, 15],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'client-analytics',
            title: 'Client Analytics',
            icon: 'fa-handshake',
            value: '9',
            badge: 'success',
            badgeText: '+1 new',
            description: 'Client engagement metrics',
            tableHeaders: ['Client Name', 'Contact Person', 'Total Projects', 'Ongoing Projects', 'Last Meeting Date', 'Satisfaction Rating'],
            tableData: [
                ['ShopEasy', 'Mark Johnson', '5', '1', '2023-06-10', '4.5/5'],
                ['TravelGo', 'Sarah Williams', '3', '1', '2023-06-05', '4.8/5'],
                ['DataSystems', 'David Chen', '4', '2', '2023-05-28', '4.2/5'],
                ['AnalyticsPro', 'Lisa Brown', '2', '0', '2023-06-12', '4.7/5'],
                ['BankSecure', 'Robert Davis', '1', '1', '2023-05-15', '4.0/5']
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['ShopEasy', 'TravelGo', 'DataSystems', 'AnalyticsPro', 'BankSecure'],
                    datasets: [{
                        label: 'Projects',
                        data: [5, 3, 4, 2, 1],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            },
            secondaryChart: {
                type: 'pie',
                data: {
                    labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
                    datasets: [{
                        data: [4, 3, 1, 1],
                        backgroundColor: ['#41f1b6', '#7380ec', '#ffbb55', '#ff7782'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        },
        {
            id: 'meeting-analytics',
            title: 'Meeting Analytics',
            icon: 'fa-video',
            value: '32',
            badge: 'danger',
            badgeText: '5 today',
            description: 'Meeting scheduling & tracking',
            tableHeaders: ['Meeting Topic', 'Date', 'Participants', 'Organized By', 'Status', 'Meeting Type'],
            tableData: [
                ['Project Kickoff', '2023-06-01', '8', 'Sarah Johnson', 'Completed', 'Internal'],
                ['Client Review', '2023-06-05', '6', 'Emma Wilson', 'Completed', 'Client'],
                ['Sprint Planning', '2023-06-08', '7', 'Michael Chen', 'Completed', 'Internal'],
                ['UX Presentation', '2023-06-12', '5', 'Emily Davis', 'Scheduled', 'Client'],
                ['Retrospective', '2023-06-15', '9', 'David Kim', 'Scheduled', 'Internal']
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['Development', 'Design', 'QA', 'HR', 'Marketing'],
                    datasets: [{
                        label: 'Meetings',
                        data: [12, 8, 5, 3, 4],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            },
            secondaryChart: {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        {
                            label: 'Client Meetings',
                            data: [3, 5, 2, 4],
                            borderColor: '#7380ec',
                            backgroundColor: 'rgba(115, 128, 236, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Internal Meetings',
                            data: [5, 3, 6, 4],
                            borderColor: '#41f1b6',
                            backgroundColor: 'rgba(65, 241, 182, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }
        }
    ];

    // Chart instances
    let mainChart = null;
    let secondaryChart = null;

    // Initialize the application
    function init() {
        renderCards();
        setupEventListeners();
    }

    // Render all cards
    function renderCards() {
        cardsView.innerHTML = '';
        
        cardsData.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
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
                        <span class="card-badge ${card.badge}">${card.badgeText}</span>
                    </div>
                </div>
            `;
            
            cardsView.appendChild(cardElement);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Card click event
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
                const cardId = this.dataset.id;
                const cardData = cardsData.find(c => c.id === cardId);
                showCardDetails(cardData);
            });
        });

        // Back button event
        backButton.addEventListener('click', function() {
            cardsView.style.display = 'grid';
            dynamicContent.style.display = 'none';
            
            // Destroy charts to prevent memory leaks
            if (mainChart) {
                mainChart.destroy();
                mainChart = null;
            }
            if (secondaryChart) {
                secondaryChart.destroy();
                secondaryChart = null;
            }
        });

        // Search functionality
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#dataTable tbody tr');
            
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // Show card details
    function showCardDetails(cardData) {
        // Hide cards and show details
        cardsView.style.display = 'none';
        dynamicContent.style.display = 'block';
        
        // Set section title
        sectionTitle.textContent = cardData.title;
        
        // Render filters
        renderFilters(cardData);
        
        // Render table
        renderTable(cardData);
        
        // Render charts
        renderCharts(cardData);
        
        // Scroll to top of dynamic content
        dynamicContent.scrollTo(0, 0);
    }

    // Render filters based on card type
    function renderFilters(cardData) {
        tableFilters.innerHTML = '';
        
        // Common filters
        const monthFilter = createSelectFilter('month', 'Select Month', [
            'All Months', 'January', 'February', 'March', 'April', 
            'May', 'June', 'July', 'August', 'September', 
            'October', 'November', 'December'
        ]);
        
        tableFilters.appendChild(monthFilter);
        
        // Card-specific filters
        switch(cardData.id) {
            case 'team-analytics':
                const teamFilter = createSelectFilter('team', 'Select Team', [
                    'All Teams', 'Frontend', 'Backend', 'Design', 'QA', 'DevOps'
                ]);
                tableFilters.appendChild(teamFilter);
                break;
                
            case 'leave-analytics':
                const leaveTypeFilter = createSelectFilter('leaveType', 'Leave Type', [
                    'All Types', 'Sick Leave', 'Vacation', 'Personal', 'Maternity'
                ]);
                tableFilters.appendChild(leaveTypeFilter);
                break;
                
            case 'project-analytics':
                const statusFilter = createSelectFilter('status', 'Select Status', [
                    'All Statuses', 'Completed', 'Ongoing', 'Delayed'
                ]);
                tableFilters.appendChild(statusFilter);
                break;
                
            case 'employee-analytics':
                const deptFilter = createSelectFilter('department', 'Select Department', [
                    'All Departments', 'Development', 'Design', 'QA', 'HR', 'Marketing', 'Sales'
                ]);
                tableFilters.appendChild(deptFilter);
                break;
        }
    }

    // Create a select filter
    function createSelectFilter(name, placeholder, options) {
        const select = document.createElement('select');
        select.name = name;
        select.id = name;
        
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = placeholder;
        placeholderOption.selected = true;
        placeholderOption.disabled = true;
        select.appendChild(placeholderOption);
        
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.toLowerCase().replace(' ', '-');
            opt.textContent = option;
            select.appendChild(opt);
        });
        
        return select;
    }

    // Render table
    function renderTable(cardData) {
        // Clear existing table
        dataTable.innerHTML = '';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        cardData.tableHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            if (header === 'Employee Name') {
                th.innerHTML += ` <i class="fas fa-sort sort-btn" data-sort="name"></i>`;
            }
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        dataTable.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Only show first 20 entries initially
        const initialData = cardData.tableData.slice(0, 20);
        
        initialData.forEach(rowData => {
            const row = document.createElement('tr');
            
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                td.textContent = cellData;
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        dataTable.appendChild(tbody);
        
        // Add pagination controls if needed
        if (cardData.tableData.length > 20) {
            addPaginationControls(cardData.tableData.length);
        }
        
        // Add sorting functionality for employee name
        if (document.querySelector('.sort-btn')) {
            document.querySelector('.sort-btn').addEventListener('click', function() {
                sortTable(cardData, this.dataset.sort);
            });
        }

        // Add message functionality for leave analytics
        if (cardData.id === 'leave-analytics') {
            setTimeout(() => {
                document.querySelectorAll('#dataTable tbody td:first-child').forEach(cell => {
                    // Single click for message popup
                    cell.addEventListener('click', function(e) {
                        if (e.target.closest('.message-box')) return;
                        showMessageBox(this.textContent.trim(), this);
                    });
                    
                    // Double click for inline message
                    cell.addEventListener('dblclick', function() {
                        toggleInlineMessageBox(this);
                    });
                });
            }, 0);
        }
    }

    function showMessageBox(employeeName, cellElement) {
        // Remove any existing message boxes
        document.querySelectorAll('.message-box').forEach(box => box.remove());
        
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        messageBox.innerHTML = `
            <div class="message-header">
                <h4>Send Message to ${employeeName}</h4>
                <button class="close-btn">&times;</button>
            </div>
            <textarea placeholder="Type your message here..." rows="4"></textarea>
            <div class="message-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="send-btn">Send</button>
            </div>
        `;
        
        // Position the message box near the clicked cell
        const rect = cellElement.getBoundingClientRect();
        messageBox.style.position = 'absolute';
        messageBox.style.left = `${rect.left}px`;
        messageBox.style.top = `${rect.bottom + 5}px`;
        
        document.body.appendChild(messageBox);
        
        // Event listeners for the message box
        messageBox.querySelector('.close-btn').addEventListener('click', () => {
            messageBox.remove();
        });
        
        messageBox.querySelector('.cancel-btn').addEventListener('click', () => {
            messageBox.remove();
        });
        
        messageBox.querySelector('.send-btn').addEventListener('click', () => {
            const message = messageBox.querySelector('textarea').value;
            if (message.trim()) {
                sendMessageToEmployee(employeeName, message);
                messageBox.remove();
            }
        });
        
        // Close when clicking outside
        setTimeout(() => {
            const clickHandler = (e) => {
                if (!messageBox.contains(e.target) && e.target !== cellElement) {
                    messageBox.remove();
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }, 0);
    }

    function toggleInlineMessageBox(cellElement) {
        const row = cellElement.closest('tr');
        const existingBox = row.querySelector('.inline-message-box');
        
        if (existingBox) {
            existingBox.remove();
            return;
        }
        
        const messageBox = document.createElement('div');
        messageBox.className = 'inline-message-box';
        messageBox.innerHTML = `
            <textarea placeholder="Type message to ${cellElement.textContent.trim()}" rows="2"></textarea>
            <div class="inline-message-actions">
                <button class="inline-cancel-btn">Cancel</button>
                <button class="inline-send-btn">Send</button>
            </div>
        `;
        
        // Insert after the row
        row.parentNode.insertBefore(messageBox, row.nextSibling);
        
        // Event listeners
        messageBox.querySelector('.inline-cancel-btn').addEventListener('click', () => {
            messageBox.remove();
        });
        
        messageBox.querySelector('.inline-send-btn').addEventListener('click', () => {
            const message = messageBox.querySelector('textarea').value;
            if (message.trim()) {
                sendMessageToEmployee(cellElement.textContent.trim(), message);
                messageBox.remove();
            }
        });
    }

    function sendMessageToEmployee(employeeName, message) {
        // In a real app, this would send to your backend
        console.log(`Message sent to ${employeeName}: ${message}`);
        
        // Show confirmation
        const notification = document.createElement('div');
        notification.className = 'message-notification';
        notification.textContent = `Message sent to ${employeeName}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function addPaginationControls(totalItems) {
        const tableContainer = dataTable.closest('.table-wrapper');
        
        // Remove existing pagination if any
        const existingPagination = tableContainer.querySelector('.table-pagination');
        if (existingPagination) existingPagination.remove();
        
        const totalPages = Math.ceil(totalItems / 20);
        const pagination = document.createElement('div');
        pagination.className = 'table-pagination';
        
        pagination.innerHTML = `
            <div class="pagination-info">Showing 1-20 of ${totalItems}</div>
            <div class="pagination-controls">
                <button class="pagination-btn prev-btn" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="page-indicator">1/${totalPages}</span>
                <button class="pagination-btn next-btn" ${totalPages <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        tableContainer.appendChild(pagination);
        
        // Add event listeners for pagination
        let currentPage = 1;
        const prevBtn = pagination.querySelector('.prev-btn');
        const nextBtn = pagination.querySelector('.next-btn');
        const pageIndicator = pagination.querySelector('.page-indicator');
        const paginationInfo = pagination.querySelector('.pagination-info');
        
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTablePage(currentPage);
                updatePaginationControls();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTablePage(currentPage);
                updatePaginationControls();
            }
        });
        
        function updateTablePage(page) {
            const start = (page - 1) * 20;
            const end = start + 20;
            const pageData = cardData.tableData.slice(start, end);
            
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
            
            paginationInfo.textContent = `Showing ${start+1}-${Math.min(end, totalItems)} of ${totalItems}`;
            pageIndicator.textContent = `${page}/${totalPages}`;
        }
        
        function updatePaginationControls() {
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
    }

    function sortTable(cardData, sortKey) {
        const tbody = dataTable.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const sortIcon = document.querySelector('.sort-btn');
        
        // Toggle sort direction
        const isAscending = !sortIcon.classList.contains('asc');
        sortIcon.classList.toggle('asc', isAscending);
        sortIcon.classList.toggle('desc', !isAscending);
        
        // Sort rows based on employee name (first column)
        rows.sort((a, b) => {
            const nameA = a.cells[0].textContent.toLowerCase();
            const nameB = b.cells[0].textContent.toLowerCase();
            
            return isAscending 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
        
        // Re-append sorted rows
        rows.forEach(row => tbody.appendChild(row));
    }

    // Render charts
    function renderCharts(cardData) {
        // Destroy existing charts if they exist
        if (mainChart) {
            mainChart.destroy();
        }
        if (secondaryChart) {
            secondaryChart.destroy();
        }
        
        // Create new charts
        mainChart = new Chart(mainChartCtx, cardData.mainChart);
        secondaryChart = new Chart(secondaryChartCtx, cardData.secondaryChart);
    }

    // Initialize the application
    init();

    // Define a CSS variable for primary color to be used in JS
    const var_color_primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
});
  