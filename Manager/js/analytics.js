document.addEventListener('DOMContentLoaded', function() {
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
    
    // Filtered card data (only Employee, Projects, Team, and Task Analytics)
    const cardsData = [
        {
            id: 'team-analytics',
            title: 'Team Analytics',
            icon: 'fa-people-group',
            value: '8',
            badge: 'success',
            badgeText: '+2.5%',
            description: 'Company-wide team performance',
            tableHeaders: ['Team Name', 'Team Lead', 'Members', 'Completed', 'Ongoing', 'Performance %'],
            tableData: [
                ['Frontend Team', 'Sarah Johnson', '8', '15', '4', '87%'],
                ['Backend Team', 'Michael Chen', '7', '12', '5', '82%'],
                ['Design Team', 'Emma Wilson', '5', '8', '3', '91%'],
                ['QA Team', 'David Kim', '4', '6', '2', '78%']
            ],
            mainChart: {
                type: 'bar',
                data: {
                    labels: ['Frontend', 'Backend', 'Design', 'QA'],
                    datasets: [{
                        label: 'Performance %',
                        data: [87, 82, 91, 78],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
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
                            tension: 0.4
                        },
                        {
                            label: 'Backend',
                            data: [70, 65, 75, 79, 80, 82],
                            borderColor: '#ffbb55',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            }
        },
        {
            id: 'employee-analytics',
            title: 'Employee Analytics',
            icon: 'fa-users',
            value: '42',
            badge: 'success',
            badgeText: '+3 new',
            description: 'Employee database',
            tableHeaders: ['Employee Name', 'Department', 'Position', 'Join Date', 'Status', 'Rating'],
            tableData: [
                ['John Smith', 'Development', 'Senior Dev', '2020-05-15', 'Active', '4.8/5'],
                ['Emily Davis', 'Design', 'UI Designer', '2021-02-10', 'Active', '4.5/5'],
                ['Michael Brown', 'QA', 'QA Engineer', '2021-07-22', 'Active', '4.2/5'],
                ['Jessica Lee', 'Development', 'Junior Dev', '2022-01-05', 'Active', '4.0/5'],
                ['Daniel Wilson', 'HR', 'HR Manager', '2019-11-18', 'Active', '4.7/5']
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Development', 'Design', 'QA', 'HR'],
                    datasets: [{
                        data: [15, 6, 5, 4],
                        backgroundColor: ['#7380ec', '#41f1b6', '#ffbb55', '#ff7782']
                    }]
                },
                options: { responsive: true }
            },
            secondaryChart: {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                        label: 'New Hires',
                        data: [3, 5, 2, 4, 6],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: { responsive: true }
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
            tableHeaders: ['Project Name', 'Client', 'Team', 'Start Date', 'Deadline', 'Progress', 'Status'],
            tableData: [
                ['E-commerce Platform', 'ShopEasy', 'Frontend', '2023-01-15', '2023-06-30', '92%', 'Ongoing'],
                ['Mobile App Redesign', 'TravelGo', 'Design', '2023-02-10', '2023-05-15', '100%', 'Completed'],
                ['API Optimization', 'DataSystems', 'Backend', '2023-03-01', '2023-07-15', '78%', 'Ongoing'],
                ['Dashboard Redesign', 'AnalyticsPro', 'Frontend', '2023-04-05', '2023-08-20', '65%', 'Delayed']
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
                            tension: 0.4
                        },
                        {
                            label: 'Mobile App Redesign',
                            data: [15, 35, 65, 85, 100, 100],
                            borderColor: '#41f1b6',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }
            },
            secondaryChart: {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Ongoing', 'Delayed'],
                    datasets: [{
                        data: [6, 9, 3],
                        backgroundColor: ['#41f1b6', '#7380ec', '#ff7782']
                    }]
                },
                options: { responsive: true }
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
            tableHeaders: ['Task Name', 'Assigned To', 'Deadline', 'Status', 'Completion %'],
            tableData: [
                ['Implement Auth API', 'John Smith', '2023-06-15', 'Completed', '100%'],
                ['Design Dashboard UI', 'Emily Davis', '2023-06-20', 'In Progress', '75%'],
                ['Write Test Cases', 'Michael Brown', '2023-06-10', 'Overdue', '60%'],
                ['Deploy to Staging', 'Robert Taylor', '2023-06-25', 'Pending', '0%']
            ],
            mainChart: {
                type: 'pie',
                data: {
                    labels: ['Completed', 'Pending', 'Overdue'],
                    datasets: [{
                        data: [104, 24, 12],
                        backgroundColor: ['#41f1b6', '#ffbb55', '#ff7782']
                    }]
                },
                options: { responsive: true }
            },
            secondaryChart: {
                type: 'bar',
                data: {
                    labels: ['John Smith', 'Emily Davis', 'Michael Brown', 'Jessica Lee'],
                    datasets: [{
                        label: 'Tasks Assigned',
                        data: [28, 22, 18, 25],
                        backgroundColor: '#7380ec'
                    }]
                },
                options: { responsive: true }
            }
        }
    ];

    // Chart instances
    let mainChart = null;
    let secondaryChart = null;

    // Initialize the page
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
            
            // Destroy charts
            if (mainChart) mainChart.destroy();
            if (secondaryChart) secondaryChart.destroy();
        });

        // Search functionality
        searchInput.addEventListener('input', filterTable);
    }

    // Show card details
    function showCardDetails(cardData) {
        cardsView.style.display = 'none';
        dynamicContent.style.display = 'block';
        sectionTitle.textContent = cardData.title;
        renderTable(cardData);
        renderCharts(cardData);
        dynamicContent.scrollTo(0, 0);
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
        
        // Create table body with first 20 rows
        const tbody = document.createElement('tbody');
        cardData.tableData.slice(0, 20).forEach(rowData => {
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
        if (cardData.tableData.length > 20) {
            addPagination(cardData.tableData);
        }
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
                <span class="page-indicator">1/${Math.ceil(tableData.length/20)}</span>
                <button class="pagination-btn next-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
        
        dataTable.parentElement.appendChild(pagination);
        
        // Pagination event listeners
        let currentPage = 1;
        const totalPages = Math.ceil(tableData.length/20);
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
            const pageData = tableData.slice(start, end);
            
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
            infoSpan.textContent = `Showing ${start+1}-${Math.min(end, tableData.length)} of ${tableData.length}`;
        }
    }

    // Filter table rows
    function filterTable() {
        const term = searchInput.value.toLowerCase();
        const rows = dataTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
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
});