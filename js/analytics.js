// Global variables
let currentOpenForm = null;
let attendanceChart, taskChart, projectChart;
let currentMonthData = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set current month in all month inputs
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.value = currentMonth;
    });
    
    // Initialize progress circles
    initProgressCircles();
    
    // Add event listeners for filters
    document.getElementById('taskFilter')?.addEventListener('change', filterTaskTable);
    document.getElementById('feedbackFilter')?.addEventListener('change', filterFeedbackTable);
    document.getElementById('groupFilter')?.addEventListener('change', filterProjectTable);
    document.getElementById('projectSearch')?.addEventListener('input', filterProjectTable);
    
    // Close form when clicking outside
    document.addEventListener('click', function(event) {
        if (currentOpenForm && !event.target.closest('.card') && !event.target.closest('.slide-forms')) {
            closeForm();
        }
    });
    
    // Initialize all charts with current month data
    initializeCurrentMonthData();
    updateAllCharts();
    
    // Setup date filter dropdowns
    setupDateFilters();
});

// Initialize current month data
function initializeCurrentMonthData() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Generate attendance data for current month
    currentMonthData.attendance = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
            const status = Math.random() > 0.1 ? 'Present' : 'Absent';
            currentMonthData.attendance.push({
                date: date.toISOString().slice(0, 10),
                day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
                status: status,
                percentage: status === 'Present' ? '100%' : '0%'
            });
        }
    }
    
    // Generate task data for current month
    currentMonthData.tasks = [
        { name: 'Dashboard UI Design', status: 'Completed', dueDate: formatDate(addDays(currentDate, -5)), completion: '100%' },
        { name: 'API Integration', status: 'Completed', dueDate: formatDate(addDays(currentDate, -3)), completion: '100%' },
        { name: 'User Authentication', status: 'Pending', dueDate: formatDate(addDays(currentDate, 2)), completion: '75%' },
        { name: 'Database Optimization', status: 'Pending', dueDate: formatDate(addDays(currentDate, 4)), completion: '40%' },
        { name: 'Documentation', status: 'Overdue', dueDate: formatDate(addDays(currentDate, -10)), completion: '20%' },
        { name: 'Testing', status: 'Pending', dueDate: formatDate(addDays(currentDate, 5)), completion: '0%' }
    ];
    
    // Generate working hours data for last 7 days
    currentMonthData.workingHours = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        const hours = date.getDay() === 0 || date.getDay() === 6 ? 0 : Math.floor(Math.random() * 3) + 6;
        currentMonthData.workingHours.push({
            day: day,
            hours: hours,
            date: formatDate(date)
        });
    }
    
    // Generate leave data
    currentMonthData.leaves = [
        { type: 'Sick Leave', days: 2, color: '#FF6384' },
        { type: 'Casual Leave', days: 1, color: '#36A2EB' },
        { type: 'Other', days: 1, color: '#FFCE56' }
    ];
}

// Helper functions
function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Setup date filter dropdowns with days
function setupDateFilters() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = this.nextElementSibling;
            
            // Close other open dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdown) menu.classList.remove('show');
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('show');
            
            // Only populate if empty
            if (dropdown.children.length === 0) {
                // Get work days for current month
                const workDays = currentMonthData.attendance.map(item => {
                    return {
                        date: item.date,
                        day: item.day
                    };
                });
                
                // Add "All Days" option
                const allOption = document.createElement('div');
                allOption.textContent = 'All Days';
                allOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    updateAllCharts();
                    dropdown.classList.remove('show');
                });
                dropdown.appendChild(allOption);
                
                // Add divider
                const divider = document.createElement('div');
                divider.style.borderTop = '1px solid #eee';
                divider.style.margin = '5px 0';
                dropdown.appendChild(divider);
                
                // Add day options
                workDays.forEach(day => {
                    const option = document.createElement('div');
                    option.textContent = `${day.day} (${day.date})`;
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        filterChartsByDate(day.date);
                        dropdown.classList.remove('show');
                    });
                    dropdown.appendChild(option);
                });
            }
        });
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    });
}

// Filter charts by specific date
function filterChartsByDate(date) {
    // Filter attendance data
    const filteredAttendance = currentMonthData.attendance.filter(item => item.date === date);
    if (filteredAttendance.length > 0) {
        updateAttendanceChart([filteredAttendance[0]]);
    } else {
        updateAttendanceChart([]);
    }
    
    // Filter working hours for the week containing this date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - dayOfWeek);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        weekDays.push(formatDate(day));
    }
    
    const filteredWorkingHours = currentMonthData.workingHours.filter(item => 
        weekDays.includes(item.date)
    );
    updateWorkingHoursChart(filteredWorkingHours);
}

// Update all charts with current month data
function updateAllCharts() {
    updateAttendanceChart(currentMonthData.attendance);
    updateTaskCompletionChart();
    updateWorkingHoursChart(currentMonthData.workingHours);
    updateLeaveBreakdownChart();
}

// Update Attendance Chart
function updateAttendanceChart(attendanceData) {
    const ctx = document.getElementById('monthlyAttendanceChart')?.getContext('2d');
    if (!ctx) return;
    
    // Destroy previous chart if exists
    if (window.monthlyAttendanceChart) {
        window.monthlyAttendanceChart.destroy();
    }
    
    // Group by week
    const weeklyData = {};
    attendanceData.forEach(item => {
        const date = new Date(item.date);
        const weekNumber = Math.floor(date.getDate() / 7);
        if (!weeklyData[weekNumber]) {
            weeklyData[weekNumber] = {
                present: 0,
                total: 0
            };
        }
        weeklyData[weekNumber].total++;
        if (item.status === 'Present') {
            weeklyData[weekNumber].present++;
        }
    });
    
    const weeks = Object.keys(weeklyData).sort();
    const percentages = weeks.map(week => {
        const data = weeklyData[week];
        return Math.round((data.present / data.total) * 100);
    });
    
    window.monthlyAttendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeks.map(week => `Week ${parseInt(week) + 1}`),
            datasets: [{
                label: 'Attendance %',
                data: percentages,
                backgroundColor: '#6EA8FE'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const weekData = weeklyData[context.dataIndex];
                            return `${context.raw}% (${weekData.present}/${weekData.total} days)`;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (val) => val + '%',
                    color: '#363949'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: val => val + '%'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Update Task Completion Chart
function updateTaskCompletionChart() {
    const ctx = document.getElementById('taskCompletionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.taskCompletionChart) {
        window.taskCompletionChart.destroy();
    }
    
    const statusCounts = {
        completed: currentMonthData.tasks.filter(t => t.status === 'Completed').length,
        pending: currentMonthData.tasks.filter(t => t.status === 'Pending').length,
        overdue: currentMonthData.tasks.filter(t => t.status === 'Overdue').length
    };
    
    window.taskCompletionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Frontend', 'Backend', 'Design', 'QA'],
            datasets: [{
                label: 'Tasks',
                data: [statusCounts.completed, statusCounts.pending, statusCounts.overdue],
                backgroundColor: [
                    '#4CAF50', // Green - Completed
                    '#FFC107', // Yellow - Pending
                    '#F44336'  // Red - Overdue
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        generateLabels: function(chart) {
                            return [
                                {text: 'Completed', fillStyle: '#4CAF50'},
                                {text: 'Pending', fillStyle: '#FFC107'},
                                {text: 'Overdue', fillStyle: '#F44336'}
                            ];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Update Working Hours Chart
function updateWorkingHoursChart(workingHoursData) {
    const ctx = document.getElementById('workingHoursChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.workingHoursChart) {
        window.workingHoursChart.destroy();
    }
    
    window.workingHoursChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: workingHoursData.map(item => item.day),
            datasets: [{
                label: 'Working Hours',
                data: workingHoursData.map(item => item.hours),
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54,162,235,0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#36A2EB',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const data = workingHoursData[context.dataIndex];
                            return `Date: ${data.date}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });
}

// Update Leave Breakdown Chart
function updateLeaveBreakdownChart() {
    const ctx = document.getElementById('leaveBreakdownChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.leaveBreakdownChart) {
        window.leaveBreakdownChart.destroy();
    }
    
    window.leaveBreakdownChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: currentMonthData.leaves.map(item => `${item.type} (${item.days} days)`),
            datasets: [{
                label: 'Leave Days',
                data: currentMonthData.leaves.map(item => item.days),
                backgroundColor: currentMonthData.leaves.map(item => item.color)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} days (${percentage}%)`;
                        }
                    }
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage + '%';
                    },
                    color: '#fff',
                    font: {
                        weight: 'bold'
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Initialize progress circles
function initProgressCircles() {
    document.querySelectorAll('.progress-circle').forEach(circle => {
        const percent = parseInt(circle.getAttribute('data-percent'));
        const circumference = 2 * Math.PI * 34;
        const offset = circumference - (percent / 100) * circumference;
        
        const circleElement = circle.querySelector('.progress-ring-circle');
        if (circleElement) {
            circleElement.style.strokeDasharray = circumference;
            circleElement.style.strokeDashoffset = offset;
        }
    });
}

// Open form function
function openForm(formId) {
    // Close current form if open
    if (currentOpenForm) {
        closeForm();
    }
    
    // Show the slide forms container
    const slideForms = document.querySelector('.slide-forms');
    if (slideForms) slideForms.classList.add('active');
    
    // Show the requested form
    const form = document.getElementById(formId);
    if (form) {
        form.classList.add('active');
        currentOpenForm = formId;
        
        // Initialize form content
        initializeFormContent(formId);
    }
}

// Close form function
function closeForm() {
    if (!currentOpenForm) return;
    
    // Hide the current form
    const form = document.getElementById(currentOpenForm);
    if (form) form.classList.remove('active');
    
    // Hide the slide forms container
    const slideForms = document.querySelector('.slide-forms');
    if (slideForms) slideForms.classList.remove('active');
    
    // Destroy charts to prevent memory leaks
    if (attendanceChart) {
        attendanceChart.destroy();
        attendanceChart = null;
    }
    if (taskChart) {
        taskChart.destroy();
        taskChart = null;
    }
    if (projectChart) {
        projectChart.destroy();
        projectChart = null;
    }
    
    currentOpenForm = null;
}

// Initialize form content based on which form is opened
function initializeFormContent(formId) {
    switch(formId) {
        case 'attendanceForm':
            loadAttendanceData();
            initAttendanceChart();
            break;
        case 'taskForm':
            loadTaskData();
            initTaskChart();
            break;
        case 'leaveForm':
            loadLeaveData();
            break;
        case 'feedbackForm':
            loadFeedbackData();
            break;
        case 'projectForm':
            loadProjectData();
            initProjectChart();
            break;
    }
}

// Load attendance data into table
function loadAttendanceData() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentMonthData.attendance.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.day}</td>
            <td><span class="status ${item.status.toLowerCase().replace('-', '')}">${item.status}</span></td>
            <td>${item.percentage}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize attendance chart in form
function initAttendanceChart() {
    const ctx = document.getElementById('attendanceChart')?.getContext('2d');
    if (!ctx) return;
    
    if (attendanceChart) {
        attendanceChart.destroy();
    }
    
    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentMonthData.attendance.map(item => item.day),
            datasets: [{
                label: 'Attendance %',
                data: currentMonthData.attendance.map(item => parseInt(item.percentage)),
                borderColor: '#4a6bff',
                backgroundColor: 'rgba(74, 107, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4a6bff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: '#363949',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Load task data into table
function loadTaskData() {
    const tbody = document.getElementById('taskTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentMonthData.tasks.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>${item.dueDate}</td>
            <td>${item.completion}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filter task table
function filterTaskTable() {
    const filterValue = document.getElementById('taskFilter')?.value.toLowerCase();
    const rows = document.querySelectorAll('#taskTableBody tr');
    
    rows.forEach(row => {
        const status = row.querySelector('.status')?.className.toLowerCase();
        if (filterValue === 'all' || status?.includes(filterValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize task chart in form
function initTaskChart() {
    const ctx = document.getElementById('taskChart')?.getContext('2d');
    if (!ctx) return;
    
    if (taskChart) {
        taskChart.destroy();
    }
    
    taskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [
                    currentMonthData.tasks.filter(t => t.status === 'Completed').length,
                    currentMonthData.tasks.filter(t => t.status === 'Pending').length,
                    currentMonthData.tasks.filter(t => t.status === 'Overdue').length
                ],
                backgroundColor: [
                    '#4caf50',
                    '#2196f3',
                    '#f44336'
                ],
                borderWidth: 0,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    backgroundColor: '#363949',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    usePointStyle: true
                }
            }
        }
    });
}

// Load leave data into table
function loadLeaveData() {
    const tbody = document.getElementById('leaveTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const leaveData = [
        { subject: 'Sick Leave', date: formatDate(addDays(new Date(), -5)), status: 'Approved' },
        { subject: 'Family Function', date: formatDate(addDays(new Date(), -2)), status: 'Approved' },
        { subject: 'Personal Leave', date: formatDate(addDays(new Date(), 3)), status: 'Pending' }
    ];
    
    leaveData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.subject}</td>
            <td>${item.date}</td>
            <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
            <td>
                <button class="preview-btn">Preview</button>
                <button class="download-btn">Download</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Opening leave application preview...');
        });
    });
    
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Downloading leave application...');
        });
    });
}

// Load feedback data into table
function loadFeedbackData() {
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const feedbackData = [
        { project: 'Dashboard Redesign', feedback: 'Excellent work on the UI design', date: formatDate(addDays(new Date(), -5)), rating: '★★★★☆' },
        { project: 'API Optimization', feedback: 'Needs improvement in error handling', date: formatDate(addDays(new Date(), -8)), rating: '★★★☆☆' },
        { project: 'Mobile App', feedback: 'Great performance improvements', date: formatDate(addDays(new Date(), -12)), rating: '★★★★★' },
        { project: 'User Testing', feedback: 'Good job on implementing feedback', date: formatDate(addDays(new Date(), -15)), rating: '★★★★☆' }
    ];
    
    feedbackData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.project}</td>
            <td>${item.feedback}</td>
            <td>${item.date}</td>
            <td>${item.rating}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filter feedback table
function filterFeedbackTable() {
    const filterValue = document.getElementById('feedbackFilter')?.value.toLowerCase();
    const rows = document.querySelectorAll('#feedbackTableBody tr');
    
    rows.forEach(row => {
        if (filterValue === 'all') {
            row.style.display = '';
        } else {
            // In a real app, we would filter based on project/task
            row.style.display = '';
        }
    });
}

// Load project data into table
function loadProjectData() {
    const tbody = document.getElementById('projectTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const projectData = [
        { group: 'Frontend', completed: 5, total: 7, percentage: '71%' },
        { group: 'Backend', completed: 3, total: 5, percentage: '60%' },
        { group: 'Design', completed: 2, total: 3, percentage: '67%' },
        { group: 'QA', completed: 4, total: 5, percentage: '80%' }
    ];
    
    projectData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.group}</td>
            <td>${item.completed}</td>
            <td>${item.total}</td>
            <td>${item.percentage}</td>
        `;
        tbody.appendChild(row);
    });
}

// Filter project table
function filterProjectTable() {
    const searchValue = document.getElementById('projectSearch')?.value.toLowerCase();
    const groupValue = document.getElementById('groupFilter')?.value.toLowerCase();
    const rows = document.querySelectorAll('#projectTableBody tr');
    
    rows.forEach(row => {
        const group = row.cells[0].textContent.toLowerCase();
        const shouldShow = 
            (groupValue === 'all' || group.includes(groupValue)) &&
            (searchValue === '' || row.textContent.toLowerCase().includes(searchValue));
        
        row.style.display = shouldShow ? '' : 'none';
    });
}

// Initialize project chart in form
function initProjectChart() {
    const ctx = document.getElementById('projectChart')?.getContext('2d');
    if (!ctx) return;
    
    if (projectChart) {
        projectChart.destroy();
    }
    
    projectChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Frontend', 'Backend', 'Design', 'QA'],
            datasets: [{
                label: 'Completed Projects',
                data: [5, 3, 2, 4],
                backgroundColor: '#4a6bff',
                borderRadius: 5,
                borderWidth: 0
            }, {
                label: 'Total Projects',
                data: [7, 5, 3, 5],
                backgroundColor: '#dce1eb',
                borderRadius: 5,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    backgroundColor: '#363949',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 12,
                    usePointStyle: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Toggle date dropdown
function toggleDateDropdown(toggleElement) {
    const dropdown = toggleElement.nextElementSibling;
    dropdown.classList.toggle('show');
}

// Register plugins
Chart.register(ChartDataLabels);

// Light color palette
const colors = {
  blue: '#8EC1F5',
  green: '#A3D9A5',
  yellow: '#FFE08E',
  red: '#FFA8A8',
  purple: '#C6A3F5',
  pink: '#FFA8E0',
  teal: '#7FD1D1'
};

// Initialize all charts
function initCharts() {
  // 1. Monthly Attendance Chart
  const attendanceCtx = document.getElementById('monthlyAttendanceChart').getContext('2d');
  window.attendanceChart = new Chart(attendanceCtx, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Attendance %',
        data: [92, 95, 89, 96],
        backgroundColor: colors.blue,
        borderColor: '#4a6bff',
        borderWidth: 1
      }]
    },
    options: getAttendanceOptions()
  });

  // 2. Task Completion Chart
  const taskCtx = document.getElementById('taskCompletionChart').getContext('2d');
  window.taskChart = new Chart(taskCtx, {
    type: 'bar',
    data: {
      labels: ['Frontend', 'Backend', 'Design', 'QA'],
      datasets: [{
        label: 'Tasks',
        data: [85, 90, 75, 95],
        backgroundColor: [
          colors.green, 
          colors.yellow,
          colors.red,
          colors.blue
        ]
      }]
    },
    options: getTaskOptions()
  });

  // 3. Working Hours Chart
  const hoursCtx = document.getElementById('workingHoursChart').getContext('2d');
  window.hoursChart = new Chart(hoursCtx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Hours Worked',
        data: [8, 7.5, 8, 6, 7, 0, 0],
        borderColor: colors.blue,
        backgroundColor: hexToRgba(colors.blue, 0.2),
        fill: true,
        tension: 0.3
      }]
    },
    options: getHoursOptions()
  });

  // 4. Leave Breakdown Chart
  const leaveCtx = document.getElementById('leaveBreakdownChart').getContext('2d');
  window.leaveChart = new Chart(leaveCtx, {
    type: 'pie',
    data: {
      labels: ['Sick Leave', 'Casual Leave', 'Other'],
      datasets: [{
        data: [2, 1, 1],
        backgroundColor: [
          colors.pink,
          colors.teal,
          colors.purple
        ]
      }]
    },
    options: getLeaveOptions()
  });

  // Initialize date filters
  initDateFilters();
}

// Helper function for rgba colors
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Chart configuration objects
function getAttendanceOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const week = elements[0].index + 1;
        alert(`Week ${week} Attendance Details:\nPresent: ${this.data.datasets[0].data[elements[0].index]}%\nClick OK to see daily breakdown`);
        showDailyAttendance(week);
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Attendance: ${ctx.raw}%`,
          afterLabel: (ctx) => `Week ${ctx.dataIndex + 1} (Mon-Fri)`
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (val) => val + '%',
        color: '#555'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: val => val + '%' }
      }
    }
  };
}

function getTaskOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const status = ['Completed', 'In Progress', 'Overdue', 'Pending'][elements[0].datasetIndex];
        const dept = this.data.labels[elements[0].index];
        alert(`${dept} Department\nStatus: ${status}\nCompletion: ${this.data.datasets[0].data[elements[0].index]}%`);
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          generateLabels: (chart) => [
            { text: 'Completed', fillStyle: colors.green },
            { text: 'In Progress', fillStyle: colors.yellow },
            { text: 'Overdue', fillStyle: colors.red },
            { text: 'Pending', fillStyle: colors.blue }
          ]
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}%`,
          afterLabel: (ctx) => `Department: ${ctx.label}`
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (val) => val + '%',
        color: '#555'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: val => val + '%' }
      }
    }
  };
}

function getHoursOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const day = this.data.labels[elements[0].index];
        const hours = this.data.datasets[0].data[elements[0].index];
        alert(`${day}: ${hours} hours worked`);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw} hours`,
          afterLabel: (ctx) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - ctx.dataIndex));
            return `Date: ${date.toLocaleDateString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: 'Hours' }
      }
    }
  };
}

function getLeaveOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const type = this.data.labels[elements[0].index];
        const days = this.data.datasets[0].data[elements[0].index];
        alert(`${type}: ${days} day${days > 1 ? 's' : ''}`);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b);
            const percent = Math.round((ctx.raw / total) * 100);
            return `${ctx.label}: ${ctx.raw} day${ctx.raw > 1 ? 's' : ''} (${percent}%)`;
          }
        }
      },
      datalabels: {
        formatter: (val, ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b);
          const percent = Math.round((val / total) * 100);
          return `${percent}%`;
        },
        color: '#fff',
        font: { weight: 'bold' }
      }
    }
  };
}

// Show daily attendance for a week
function showDailyAttendance(week) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const attendance = [100, 95, 90, 85, 100]; // Sample data
  
  let message = `Week ${week} Daily Attendance:\n\n`;
  days.forEach((day, i) => {
    message += `${day}: ${attendance[i]}%\n`;
  });
  
  alert(message);
}

// Initialize date filters
function initDateFilters() {
  const dropdowns = document.querySelectorAll('.dropdown-toggle');
  
  dropdowns.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const dropdown = this.nextElementSibling;
      dropdown.classList.toggle('show');
      
      // Populate dropdown if empty
      if (dropdown.children.length === 0) {
        // Add "All Time" option
        const allOption = document.createElement('div');
        allOption.textContent = 'All Time';
        allOption.addEventListener('click', () => {
          resetFilters();
          dropdown.classList.remove('show');
        });
        dropdown.appendChild(allOption);
        
        // Add month options
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        
        months.forEach((month, i) => {
          const option = document.createElement('div');
          option.textContent = month;
          option.addEventListener('click', () => {
            filterByMonth(i + 1);
            dropdown.classList.remove('show');
          });
          dropdown.appendChild(option);
        });
      }
    });
  });
  
  // Close dropdowns when clicking elsewhere
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
  });
}

function resetFilters() {
  alert('Showing data for all time');
  // In real implementation, you would reload all data here
}

function filterByMonth(month) {
  alert(`Filtering by ${getMonthName(month)}`);
  // In real implementation, you would filter your data here
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  initCharts();
});