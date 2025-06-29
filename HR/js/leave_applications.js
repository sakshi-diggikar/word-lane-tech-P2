// leave_applications.js - HR Leave Applications Management

let allLeaves = [];
let filteredLeaves = [];
let currentLeaveId = null;

// DOM Elements
const leaveTableBody = document.getElementById('leave-applications-tbody');
const loadingElement = document.getElementById('loading');
const noDataElement = document.getElementById('no-data');
const statusNotification = document.getElementById('status-notification');
const statusMessage = document.getElementById('status-notification-message');

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
const approvalModal = document.getElementById('approval-modal');
const approvalForm = document.getElementById('approval-form');
const closeApprovalModal = document.getElementById('close-approval-modal');
const cancelApproval = document.getElementById('cancel-approval');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadLeaveApplications();
    setupEventListeners();
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
    if (closeApprovalModal) closeApprovalModal.addEventListener('click', () => approvalModal.style.display = 'none');
    if (cancelApproval) cancelApproval.addEventListener('click', () => approvalModal.style.display = 'none');

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === leaveDetailsModal) leaveDetailsModal.style.display = 'none';
        if (e.target === approvalModal) approvalModal.style.display = 'none';
    });

    // Approval form submission
    if (approvalForm) approvalForm.addEventListener('submit', handleApprovalSubmit);
}

// Load all leave applications
async function loadLeaveApplications() {
    try {
        showLoading(true);
        const response = await leaveAPI.getAllLeaves();
        
        if (response.success) {
            leaveApplications = response.leaves;
            displayLeaveApplications(leaveApplications);
            updateStatistics();
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
                    <button class="btn btn-view" onclick="viewLeaveDetails(${leave.leave_id})">
                        View
                    </button>
                    ${leave.leave_status === 'Pending' ? `
                        <button class="btn btn-approve" onclick="openApprovalModal(${leave.leave_id}, 'Approved')">
                            Approve
                        </button>
                        <button class="btn btn-reject" onclick="openApprovalModal(${leave.leave_id}, 'Rejected')">
                            Reject
                        </button>
                    ` : ''}
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

        leaveDetailsContent.innerHTML = `
            <div class="leave-detail-row">
                <div class="leave-detail-label">Employee:</div>
                <div class="leave-detail-value">${leave.employee_name || `Employee ID: ${leave.employee_id}`}</div>
            </div>
            <div class="leave-detail-row">
                <div class="leave-detail-label">Employee ID:</div>
                <div class="leave-detail-value">${leave.employee_id}</div>
            </div>
            <div class="leave-detail-row">
                <div class="leave-detail-label">Start Date:</div>
                <div class="leave-detail-value">${formatDate(leave.leave_start_date)}</div>
            </div>
            <div class="leave-detail-row">
                <div class="leave-detail-label">End Date:</div>
                <div class="leave-detail-value">${formatDate(leave.leave_end_date)}</div>
            </div>
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
            ` : ''}
            ${leave.leave_approval_remark ? `
                <div class="leave-detail-row">
                    <div class="leave-detail-label">Remark:</div>
                    <div class="leave-detail-value">${leave.leave_approval_remark}</div>
                </div>
            ` : ''}
            <div class="leave-detail-row">
                <div class="leave-detail-label">Reason:</div>
                <div class="leave-detail-value">${leave.leave_reason}</div>
            </div>
        `;

        leaveDetailsModal.style.display = 'flex';
    } catch (error) {
        console.error('Error viewing leave details:', error);
        showNotification('Failed to load leave details', 'error');
    }
}

// Open approval modal
function openApprovalModal(leaveId, defaultStatus) {
    currentLeaveId = leaveId;
    const approvalStatus = document.getElementById('approval-status');
    const approvalRemark = document.getElementById('approval-remark');
    const approvalModal = document.getElementById('approval-modal');

    if (approvalStatus) approvalStatus.value = defaultStatus;
    if (approvalRemark) approvalRemark.value = '';
    if (approvalModal) approvalModal.style.display = 'flex';
}

// Handle approval form submission
async function handleApprovalSubmit(e) {
    e.preventDefault();
    
    try {
        const status = document.getElementById('approval-status').value;
        const remark = document.getElementById('approval-remark').value;
        
        if (!status) {
            showNotification('Please select a status', 'error');
            return;
        }

        const statusData = {
            status: status,
            approved_by: 1, // Assuming HR user ID is 1, you might want to get this from session
            approval_remark: remark || null
        };

        await leaveAPI.updateLeaveStatus(currentLeaveId, statusData);
        
        showNotification(`Leave application ${status.toLowerCase()} successfully`);
        
        // Close modal and refresh data
        approvalModal.style.display = 'none';
        await loadLeaveApplications();
        
    } catch (error) {
        console.error('Error updating leave status:', error);
        showNotification(error.message || 'Failed to update leave status', 'error');
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