// leaveAPI.js - API functions for leave applications

const API_BASE_URL = 'http://localhost:3000/api';

// Submit a new leave application
async function submitLeaveApplication(leaveData) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leaveData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to submit leave application');
        }

        return data;
    } catch (error) {
        console.error('Error submitting leave application:', error);
        throw error;
    }
}

// Get leave applications for an employee
async function getEmployeeLeaves(employeeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/employee/${employeeId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch leave applications');
        }

        return data;
    } catch (error) {
        console.error('Error fetching employee leaves:', error);
        throw error;
    }
}

// Get all leave applications (for HR/Admin)
async function getAllLeaves() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/all`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch all leave applications');
        }

        return data;
    } catch (error) {
        console.error('Error fetching all leaves:', error);
        throw error;
    }
}

// Update leave status (approve/reject)
async function updateLeaveStatus(leaveId, statusData) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/${leaveId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update leave status');
        }

        return data;
    } catch (error) {
        console.error('Error updating leave status:', error);
        throw error;
    }
}

// Get leave statistics for an employee
async function getLeaveStats(employeeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/stats/${employeeId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch leave statistics');
        }

        return data;
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        throw error;
    }
}

// Get employee data by user ID
async function getEmployeeData(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/employee-data/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch employee data');
        }

        return data;
    } catch (error) {
        console.error('Error fetching employee data:', error);
        throw error;
    }
}

// Get HR employee data
async function getHRData() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves/hr-data`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch HR data');
        }

        return data;
    } catch (error) {
        console.error('Error fetching HR data:', error);
        throw error;
    }
}

// Export functions for use in other files
window.leaveAPI = {
    submitLeaveApplication,
    applyLeave: submitLeaveApplication,
    getEmployeeLeaves,
    getAllLeaves,
    updateLeaveStatus,
    getLeaveStats,
    getEmployeeData,
    getHRData
}; 