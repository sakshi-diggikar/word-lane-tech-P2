# Leave Application System

This document describes the implementation of the leave application system for the Word Lane Tech employee management platform.

## Overview

The leave application system allows employees to submit leave requests through the attendance calendar interface, and HR/Admin users to review and manage these applications. The system includes:

- **Employee Interface**: Calendar-based leave application submission
- **HR/Admin Interface**: Leave application management and approval
- **Database Storage**: Structured leave data storage
- **API Endpoints**: RESTful API for leave operations

## Database Schema

The system uses a `leaves` table with the following structure:

```sql
CREATE TABLE leaves (
    leave_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_start_date DATE NOT NULL,
    leave_end_date DATE NOT NULL,
    leave_reason TEXT NOT NULL,
    leave_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    leave_approved_by INT,
    leave_approved_at DATETIME,
    leave_approval_remark TEXT,
    leave_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    leave_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (leave_approved_by) REFERENCES employees(employee_id) ON DELETE SET NULL
);
```

## API Endpoints

### 1. Submit Leave Application
- **POST** `/api/leaves/apply`
- **Body**: `{ employee_id, leave_start_date, leave_end_date, leave_reason }`
- **Response**: `{ success: true, message: "Leave application submitted successfully", leave_id: 123 }`

### 2. Get Employee Leaves
- **GET** `/api/leaves/employee/:employeeId`
- **Response**: `{ success: true, leaves: [...] }`

### 3. Get All Leaves (HR/Admin)
- **GET** `/api/leaves/all`
- **Response**: `{ success: true, leaves: [...] }`

### 4. Update Leave Status
- **PUT** `/api/leaves/:leaveId/status`
- **Body**: `{ status, approved_by, approval_remark }`
- **Response**: `{ success: true, message: "Leave application approved successfully" }`

### 5. Get Leave Statistics
- **GET** `/api/leaves/stats/:employeeId`
- **Response**: `{ success: true, stats: { total_leaves, pending_leaves, approved_leaves, rejected_leaves } }`

## File Structure

```
├── routes/
│   └── leaves.js                 # Leave API routes
├── js/api/
│   └── leaveAPI.js              # Frontend API functions
├── Employee/
│   ├── attendance.html          # Employee attendance page with leave form
│   ├── js/attendance.js        # Calendar and leave submission logic
│   └── css/attendance.css      # Attendance page styling
├── HR/
│   ├── leave_applications.html  # HR leave management page
│   ├── js/leave_applications.js # HR leave management logic
│   └── css/leave_app.css       # Leave applications page styling
└── server.js                    # Main server file (updated with leave routes)
```

## Features

### Employee Features
1. **Calendar Interface**: Interactive calendar for date selection
2. **Drag Selection**: Select multiple dates by dragging
3. **Leave Application Form**: Pre-filled form with selected dates
4. **Validation**: Date validation and overlap checking
5. **Status Notifications**: Success/error feedback

### HR/Admin Features
1. **Leave Dashboard**: Overview of all leave applications
2. **Filtering**: Filter by status, date range, and employee
3. **Approval/Rejection**: Update leave status with remarks
4. **Detailed View**: View complete leave application details
5. **Statistics**: Leave statistics and analytics

## Usage Instructions

### For Employees

1. **Access Attendance Page**: Navigate to Employee → Attendance
2. **Select Dates**: Click or drag to select future dates on the calendar
3. **Submit Application**: Click "Leave Application" button
4. **Fill Form**: Complete the leave application form
5. **Submit**: Click "Send" to submit the application

### For HR/Admin

1. **Access Leave Applications**: Navigate to HR → Leave Applications
2. **View Applications**: See all leave applications in a table format
3. **Filter Applications**: Use filters to find specific applications
4. **Review Details**: Click "View" to see application details
5. **Approve/Reject**: Use "Approve" or "Reject" buttons for pending applications

## Validation Rules

1. **Date Validation**:
   - Start date cannot be in the past
   - End date cannot be before start date
   - Only future dates can be selected

2. **Overlap Prevention**:
   - Cannot submit overlapping leave requests
   - System checks for existing approved/pending leaves

3. **Required Fields**:
   - Employee ID
   - Start date
   - End date
   - Leave reason

## Error Handling

The system includes comprehensive error handling:

- **Frontend**: User-friendly error messages and notifications
- **Backend**: Proper HTTP status codes and error responses
- **Database**: Foreign key constraints and data validation
- **API**: Consistent error response format

## Testing

### Test Files
- `test_leave_api.js`: Backend API testing
- `test_leave_frontend.html`: Frontend functionality testing

### Manual Testing Steps
1. Start the server: `npm start`
2. Open `test_leave_frontend.html` in a browser
3. Test leave application submission
4. Test API endpoints
5. Verify database entries

## Security Considerations

1. **Input Validation**: All inputs are validated on both frontend and backend
2. **SQL Injection Prevention**: Using parameterized queries
3. **Access Control**: HR/Admin only access to management features
4. **Data Integrity**: Foreign key constraints and proper error handling

## Future Enhancements

1. **Email Notifications**: Automatic email notifications for leave status changes
2. **Leave Balance Tracking**: Track and display employee leave balances
3. **Calendar Integration**: Integration with external calendar systems
4. **Mobile App**: Mobile application for leave management
5. **Advanced Reporting**: Detailed leave analytics and reporting
6. **Workflow Automation**: Automated approval workflows based on leave type

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MySQL server is running and credentials are correct
2. **API Errors**: Check server logs for detailed error messages
3. **Date Selection**: Ensure selected dates are in the future
4. **Form Submission**: Verify all required fields are filled

### Debug Mode

Enable debug logging by setting environment variables:
```bash
DEBUG=true
NODE_ENV=development
```

## Support

For technical support or questions about the leave application system, please refer to the project documentation or contact the development team. 