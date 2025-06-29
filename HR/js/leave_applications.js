// leave_applications.js - HR Leave Applications Management

let allLeaves = [];
let filteredLeaves = [];
let currentLeaveId = null;
let currentHRId = 'hr001'; // Default HR ID
let previousStats = { pending: 0, approved: 0, rejected: 0, total: 0 };

// DOM Elements
const leaveTableBody = document.getElementById('leave-applications-tbody');
const loadingElement = document.getElementById('loading');
const noDataElement = document.getElementById('no-data');
const statusNotification = document.getElementById('status-notification');
const statusMessage = document.getElementById('status-notification-message');

// Status Card Elements
const pendingCount = document.getElementById('pending-count');
const approvedCount = document.getElementById('approved-count');
const rejectedCount = document.getElementById('rejected-count');
const totalCount = document.getElementById('total-count');

// Filter Elements
const statusFilter = document.getElementById('status-filter');
const dateFilterStart = document.getElementById('date-filter-start');
const dateFilterEnd = document.getElementById('date-filter-end');
const employeeFilter = document.getElementById('employee-filter');
const clearFiltersBtn = document.getElementById('clear-filters');

// Modal Elements
const leaveDetailsModal = document.getElementById('leave-details-modal');
const leaveDetailsContent = document.getElementById('leave-details-content');
const closeLeaveDetails = document.getElementById('close-leave-details');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadLeaveApplications();
    setupEventListeners();
    startRealTimeUpdates();
});

// Setup event listeners
function setupEventListeners() {
    // Filter event listeners
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (dateFilterStart) dateFilterStart.addEventListener('change', applyFilters);
    if (dateFilterEnd) dateFilterEnd.addEventListener('change', applyFilters);
    if (employeeFilter) employeeFilter.addEventListener('input', applyFilters);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);

    // Modal event listeners
    if (closeLeaveDetails) closeLeaveDetails.addEventListener('click', () => leaveDetailsModal.style.display = 'none');

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === leaveDetailsModal) leaveDetailsModal.style.display = 'none';
    });
}

// Load all leave applications
async function loadLeaveApplications() {
    try {
        showLoading(true);
        const response = await leaveAPI.getAllLeaves();
        
        if (response.success) {
            allLeaves = response.leaves || [];
            filteredLeaves = [...allLeaves];
            renderLeaveTable();
            updateStatusCards();
            checkForNewApplications();
        } else {
            showNotification('Failed to load leave applications', 'error');
        }
    } catch (error) {
        console.error('Error loading leave applications:', error);
        showNotification('Error loading leave applications', 'error');
    } finally {
        showLoading(false);
    }
}

// Update status cards with current counts
function updateStatusCards() {
    const stats = {
        pending: allLeaves.filter(leave => leave.leave_status === 'Pending').length,
        approved: allLeaves.filter(leave => leave.leave_status === 'Approved').length,
        rejected: allLeaves.filter(leave => leave.leave_status === 'Rejected').length,
        total: allLeaves.length
    };

    // Update card values
    if (pendingCount) pendingCount.textContent = stats.pending;
    if (approvedCount) approvedCount.textContent = stats.approved;
    if (rejectedCount) rejectedCount.textContent = stats.rejected;
    if (totalCount) totalCount.textContent = stats.total;

    // Check for status changes and show notifications
    if (stats.pending > previousStats.pending) {
        const newPending = stats.pending - previousStats.pending;
        showNotification(`${newPending} new leave application(s) received!`, 'success');
    }

    // Update previous stats
    previousStats = { ...stats };
}

// Check for new applications and show notifications
function checkForNewApplications() {
    const newApplications = allLeaves.filter(leave => {
        const createdDate = new Date(leave.leave_created_at);
        const now = new Date();
        const diffInMinutes = (now - createdDate) / (1000 * 60);
        return diffInMinutes < 5; // Show notification for applications created in last 5 minutes
    });

    newApplications.forEach(application => {
        const employeeName = application.employee_name || `Employee ID: ${application.employee_id}`;
        showNotification(`${employeeName} sent a leave application`, 'success');
    });
}

// Filter by status when clicking on status cards
function filterByStatus(status) {
    // Update active card styling
    document.querySelectorAll('.status-card').forEach(card => card.classList.remove('active'));
    
    if (status === 'Pending') {
        document.querySelector('.pending-card').classList.add('active');
    } else if (status === 'Approved') {
        document.querySelector('.approved-card').classList.add('active');
    } else if (status === 'Rejected') {
        document.querySelector('.rejected-card').classList.add('active');
    } else {
        document.querySelector('.total-card').classList.add('active');
    }

    // Apply filter
    if (statusFilter) statusFilter.value = status;
    applyFilters();
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(async () => {
        await loadLeaveApplications();
    }, 30000); // Check every 30 seconds
}

// Render the leave applications table
function renderLeaveTable() {
    if (!leaveTableBody) return;

    if (filteredLeaves.length === 0) {
        leaveTableBody.innerHTML = '';
        showNoData(true);
        return;
    }

    showNoData(false);
    
    leaveTableBody.innerHTML = filteredLeaves.map(leave => `
        <tr>
            <td>
                <div>
                    <strong>${leave.employee_name || `Employee ID: ${leave.employee_id}`}</strong>
                    <br>
                    <small>ID: ${leave.employee_id}</small>
                </div>
            </td>
            <td>${formatDate(leave.leave_start_date)}</td>
            <td>${formatDate(leave.leave_end_date)}</td>
            <td>
                <div class="reason-text" title="${leave.leave_reason}">
                    ${truncateText(leave.leave_reason, 50)}
                </div>
            </td>
            <td>
                <span class="status-badge status-${leave.leave_status.toLowerCase()}">
                    ${leave.leave_status}
                </span>
            </td>
            <td>${formatDateTime(leave.leave_created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-details" onclick="viewLeaveDetails(${leave.leave_id})">
                        Details
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Apply filters to the leave applications
function applyFilters() {
    const status = statusFilter ? statusFilter.value : '';
    const startDate = dateFilterStart ? dateFilterStart.value : '';
    const endDate = dateFilterEnd ? dateFilterEnd.value : '';
    const employee = employeeFilter ? employeeFilter.value.toLowerCase() : '';

    filteredLeaves = allLeaves.filter(leave => {
        // Status filter
        if (status && leave.leave_status !== status) return false;

        // Date range filter
        if (startDate && leave.leave_start_date < startDate) return false;
        if (endDate && leave.leave_end_date > endDate) return false;

        // Employee filter
        if (employee) {
            const employeeName = (leave.employee_name || '').toLowerCase();
            const employeeId = leave.employee_id.toString();
            if (!employeeName.includes(employee) && !employeeId.includes(employee)) {
                return false;
            }
        }

        return true;
    });

    renderLeaveTable();
}

// Clear all filters
function clearFilters() {
    if (statusFilter) statusFilter.value = '';
    if (dateFilterStart) dateFilterStart.value = '';
    if (dateFilterEnd) dateFilterEnd.value = '';
    if (employeeFilter) employeeFilter.value = '';
    filteredLeaves = [...allLeaves];
    renderLeaveTable();
}

// View leave details
async function viewLeaveDetails(leaveId) {
    try {
        const leave = allLeaves.find(l => l.leave_id === leaveId);
        if (!leave) {
            showNotification('Leave application not found', 'error');
            return;
        }

        // Calculate leave duration
        const startDate = new Date(leave.leave_start_date);
        const endDate = new Date(leave.leave_end_date);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        leaveDetailsContent.innerHTML = `
            <div class="leave-details-container">
                <div class="leave-detail-section">
                    <h3>Employee Information</h3>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Employee Name:</div>
                        <div class="leave-detail-value">${leave.employee_name || `Employee ID: ${leave.employee_id}`}</div>
                    </div>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Employee ID:</div>
                        <div class="leave-detail-value">${leave.employee_id}</div>
                    </div>
                </div>

                <div class="leave-detail-section">
                    <h3>Leave Information</h3>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Start Date:</div>
                        <div class="leave-detail-value">${formatDate(leave.leave_start_date)}</div>
                    </div>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">End Date:</div>
                        <div class="leave-detail-value">${formatDate(leave.leave_end_date)}</div>
                    </div>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Duration:</div>
                        <div class="leave-detail-value">${days} day(s)</div>
                    </div>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Reason:</div>
                        <div class="leave-detail-value reason-full">${leave.leave_reason}</div>
                    </div>
                </div>

                <div class="leave-detail-section">
                    <h3>Application Status</h3>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Status:</div>
                        <div class="leave-detail-value">
                            <span class="status-badge status-${leave.leave_status.toLowerCase()}">
                                ${leave.leave_status}
                            </span>
                        </div>
                    </div>
                    <div class="leave-detail-row">
                        <div class="leave-detail-label">Applied On:</div>
                        <div class="leave-detail-value">${formatDateTime(leave.leave_created_at)}</div>
                    </div>
                    ${leave.leave_approved_by ? `
                        <div class="leave-detail-row">
                            <div class="leave-detail-label">Approved By:</div>
                            <div class="leave-detail-value">${leave.approved_by_name || `Employee ID: ${leave.leave_approved_by}`}</div>
                        </div>
                        <div class="leave-detail-row">
                            <div class="leave-detail-label">Approved On:</div>
                            <div class="leave-detail-value">${formatDateTime(leave.leave_approved_at)}</div>
                        </div>
                        ${leave.leave_approval_remark ? `
                            <div class="leave-detail-row">
                                <div class="leave-detail-label">Remark:</div>
                                <div class="leave-detail-value">${leave.leave_approval_remark}</div>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>

                ${leave.leave_status === 'Pending' ? `
                    <div class="leave-detail-section">
                        <h3>Actions</h3>
                        <div class="leave-action-buttons">
                            <button class="btn btn-approve-large" onclick="approveLeaveFromDetails(${leave.leave_id})">
                                <span class="material-icons-sharp">check_circle</span>
                                Approve Leave
                            </button>
                            <button class="btn btn-reject-large" onclick="rejectLeaveFromDetails(${leave.leave_id})">
                                <span class="material-icons-sharp">cancel</span>
                                Reject Leave
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // Show the modal
        leaveDetailsModal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error viewing leave details:', error);
        showNotification('Error loading leave details', 'error');
    }
}

// Approve leave from details modal
async function approveLeaveFromDetails(leaveId) {
    try {
        // Get HR employee ID
        const hrResponse = await fetch('/api/leaves/hr-data');
        if (!hrResponse.ok) {
            throw new Error('Failed to get HR data');
        }
        const hrData = await hrResponse.json();
        const hrEmployeeId = hrData.hrEmployee.emp_id;

        const response = await leaveAPI.updateLeaveStatus(leaveId, {
            status: 'Approved',
            approved_by: hrEmployeeId,
            approval_remark: 'Approved via details view'
        });

        if (response.success) {
            const leave = allLeaves.find(l => l.leave_id === leaveId);
            const employeeName = leave.employee_name || `Employee ID: ${leave.employee_id}`;
            
            showNotification(`Successfully approved leave application for ${employeeName}`, 'success');
            
            // Close modal
            leaveDetailsModal.style.display = 'none';
            
            // Reload applications to update the view
            await loadLeaveApplications();
            
        } else {
            showNotification(response.message || 'Failed to approve leave application', 'error');
        }
    } catch (error) {
        console.error('Error approving leave:', error);
        showNotification('Error approving leave application. Please try again.', 'error');
    }
}

// Reject leave from details modal
async function rejectLeaveFromDetails(leaveId) {
    try {
        // Get HR employee ID
        const hrResponse = await fetch('/api/leaves/hr-data');
        if (!hrResponse.ok) {
            throw new Error('Failed to get HR data');
        }
        const hrData = await hrResponse.json();
        const hrEmployeeId = hrData.hrEmployee.emp_id;

        const response = await leaveAPI.updateLeaveStatus(leaveId, {
            status: 'Rejected',
            approved_by: hrEmployeeId,
            approval_remark: 'Rejected via details view'
        });

        if (response.success) {
            const leave = allLeaves.find(l => l.leave_id === leaveId);
            const employeeName = leave.employee_name || `Employee ID: ${leave.employee_id}`;
            
            showNotification(`Successfully rejected leave application for ${employeeName}`, 'error');
            
            // Close modal
            leaveDetailsModal.style.display = 'none';
            
            // Reload applications to update the view
            await loadLeaveApplications();
            
        } else {
            showNotification(response.message || 'Failed to reject leave application', 'error');
        }
    } catch (error) {
        console.error('Error rejecting leave:', error);
        showNotification('Error rejecting leave application. Please try again.', 'error');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function showLoading(show) {
    if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
}

function showNoData(show) {
    if (noDataElement) noDataElement.style.display = show ? 'block' : 'none';
}

function showNotification(message, type = 'success') {
    if (statusMessage) statusMessage.textContent = message;
    if (statusNotification) {
        statusNotification.className = `status-notification ${type}`;
        statusNotification.classList.add('show');
        
        setTimeout(() => {
            statusNotification.classList.remove('show');
        }, type === 'error' ? 5000 : 3000);
    }
} 