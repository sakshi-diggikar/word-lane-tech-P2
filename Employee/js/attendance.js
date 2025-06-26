// Employee view calendar visibility
const currentEmployeeId = "EMP001";
const currentEmployeeName = "Alice Johnson";

// Dummy attendance data for the current employee, including time in/out
// This data will be filtered for display in the table (past dates only)
const employeeAttendanceData = [
    { employeeId: "EMP001", date: "2025-05-01", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-02", status: "present", timeIn: "09:15 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-03", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-04", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-05", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-06", status: "absent", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-07", status: "leave", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-08", status: "holiday", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-09", status: "present", timeIn: "09:05 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-10", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-11", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-12", status: "late", timeIn: "10:30 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-13", status: "half-day", timeIn: "01:00 PM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-14", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-15", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-16", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-17", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-18", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-19", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-20", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-21", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-22", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-23", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-24", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-25", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-05-26", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-27", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-28", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-29", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-30", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-05-31", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    // --- June 2025 Data ---
    { employeeId: "EMP001", date: "2025-06-01", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-02", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" }, // Monday
    { employeeId: "EMP001", date: "2025-06-03", status: "absent", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-04", status: "leave", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-05", status: "holiday", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-06", status: "present", timeIn: "09:05 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-07", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-08", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-09", status: "late", timeIn: "10:30 AM", timeOut: "05:00 PM" }, // Monday
    { employeeId: "EMP001", date: "2025-06-10", status: "half-day", timeIn: "01:00 PM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-11", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-12", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-13", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-14", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-15", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-16", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" }, // Monday
    { employeeId: "EMP001", date: "2025-06-17", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-18", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-19", status: "leave", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-20", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-21", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-22", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-23", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" }, // Monday
    { employeeId: "EMP001", date: "2025-06-24", status: "late", timeIn: "09:45 AM", timeOut: "06:00 PM" },
    { employeeId: "EMP001", date: "2025-06-25", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-26", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-27", status: "half-day", timeIn: "09:00 AM", timeOut: "01:00 PM" },
    { employeeId: "EMP001", date: "2025-06-28", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-29", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-30", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" } // Monday
];

// New: Public Holidays/Festivals data
const publicHolidays = [
    { date: "2025-01-01", name: "New Year's Day" },
    { date: "2025-01-26", name: "Republic Day" },
    { date: "2025-03-08", name: "Holi" },
    { date: "2025-04-14", name: "Ambedkar Jayanti" },
    { date: "2025-05-01", name: "Maharashtra Day" },
    { date: "2025-08-15", name: "Independence Day" },
    { date: "2025-09-06", name: "Ganesh Chaturthi" }, // Example: Ganpati
    { date: "2025-10-02", name: "Gandhi Jayanti" },
    { date: "2025-10-24", name: "Diwali" },
    { date: "2025-12-25", name: "Christmas" },
];


let calendarMonthOffset = 0;
let isDragging = false;
let selectedDates = []; // Stores all dates in the dragged range
let startDragDate = null;
let endDragDate = null;

// Get references to main layout elements
const container = document.querySelector('.container');

function formatDateToYMD(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const date = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
}

function parseYMDToDate(ymdString) {
    const [year, month, day] = ymdString.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function renderCalendar(monthOffset = 0) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Clear existing calendar content

    const today = new Date();
    const calendarDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const title = `${calendarDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `
        <h2>${title}</h2>
        <div class="calendar-nav">
            <button onclick="changeMonth(-1)">◀</button>
            <button onclick="changeMonth(1)">▶</button>
        </div>
        <div class="calendar-actions" id="calendar-action-buttons" style="display: none;">
            <button id="apply-leave-btn" class="apply-leave-btn">Leave Application</button>
            <button id="cancel-selection-btn" class="cancel-selection-btn">Cancel</button>
        </div>
    `;
    calendar.appendChild(header); // Append header first

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const label = document.createElement('div');
        label.className = 'calendar-day-label';
        label.textContent = day;
        grid.appendChild(label);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Padding before month starts
    for (let i = 0; i < firstDay.getDay(); i++) {
        grid.appendChild(document.createElement('div'));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
        const cellDate = new Date(year, month, d);
        const isoDate = formatDateToYMD(cellDate);
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        cell.dataset.date = isoDate; // Store date in data attribute

        const day = cellDate.getDay();

        const record = employeeAttendanceData.find(
            r => r.employeeId === currentEmployeeId && r.date === isoDate
        );

        // Check for public holidays
        const holiday = publicHolidays.find(h => h.date === isoDate);

        if ((day === 0 || day === 6) && !record && !holiday) { // If it's a weekend and no specific record or holiday exists
            cell.classList.add('weekend');
        }

        if (isoDate === formatDateToYMD(new Date())) {
            cell.classList.add('today');
        }

        let cellContent = `<div>${d}</div>`;
        if (record) {
            const status = record.status.toLowerCase();
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);
            cell.classList.add(status);
            cellContent += `<span class="status-text">${statusText}</span>`;
        }

        if (holiday) {
            cell.classList.add('holiday'); // Add holiday class for styling
            cellContent += `<span class="holiday-text">${holiday.name}</span>`;
        }
        cell.innerHTML = cellContent;
        grid.appendChild(cell);
    }

    calendar.appendChild(grid); // Append grid after header

    addCalendarDragListeners();
    // Re-attach event listeners for the newly rendered buttons
    document.getElementById('apply-leave-btn').addEventListener('click', handleApplyLeaveClick);
}

function changeMonth(direction) {
    calendarMonthOffset += direction;
    renderCalendar(calendarMonthOffset);
    selectedDates = []; // Clear selection on month change
    hideLeaveApplicationButtons(); // Hide buttons on month change
    container.classList.remove('form-open'); // Reset layout
}

function addCalendarDragListeners() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    // Helper to check if a date is in the future (strictly greater than today)
    function isFutureDate(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = parseYMDToDate(dateStr);
        return date > today;
    }

    calendarGrid.addEventListener('mousedown', (e) => {
        const cell = e.target.closest('.calendar-cell');
        if (cell) {
            if (!isFutureDate(cell.dataset.date)) return; // Only allow future dates
            isDragging = true;
            clearCalendarSelection();
            selectedDates = [];
            startDragDate = cell.dataset.date;
            cell.classList.add('selected');
            hideLeaveApplicationButtons(); // Hide buttons immediately on new drag
            container.classList.remove('form-open'); // Reset layout
        }
    });

    calendarGrid.addEventListener('mouseover', (e) => {
        if (isDragging) {
            const cell = e.target.closest('.calendar-cell');
            if (cell) {
                if (!isFutureDate(cell.dataset.date)) return; // Only allow future dates
                endDragDate = cell.dataset.date;
                updateCalendarSelection(startDragDate, endDragDate, isFutureDate);
            }
        }
    });

    calendarGrid.addEventListener('mouseup', (e) => {
        isDragging = false;
        if (selectedDates.length > 0) {
            showLeaveApplicationButtons();
        } else {
            hideLeaveApplicationButtons();
        }
    });

    // New: Allow single click to select a single date for leave application
    calendarGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.calendar-cell');
        if (cell) {
            if (!isFutureDate(cell.dataset.date)) return; // Only allow future dates
            // If not dragging, treat as single date selection
            if (!isDragging) {
                clearCalendarSelection();
                selectedDates = [cell.dataset.date];
                cell.classList.add('selected');
                showLeaveApplicationButtons();
            }
        }
    });

    // Prevent text selection during drag
    calendarGrid.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
}

function clearCalendarSelection() {
    document.querySelectorAll('.calendar-cell').forEach(cell => {
        cell.classList.remove('selected');
    });
}

function updateCalendarSelection(startDateStr, endDateStr, isFutureDateFn) {
    clearCalendarSelection();
    selectedDates = [];

    const startDate = parseYMDToDate(startDateStr);
    const endDate = parseYMDToDate(endDateStr);

    const minDate = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const maxDate = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    document.querySelectorAll('.calendar-cell').forEach(cell => {
        const cellDate = parseYMDToDate(cell.dataset.date);
        // Only select if in range and (if provided) is a future date
        if (cellDate >= minDate && cellDate <= maxDate && (!isFutureDateFn || isFutureDateFn(cell.dataset.date))) {
            cell.classList.add('selected');
            selectedDates.push(cell.dataset.date);
        }
    });

    // Sort selected dates to ensure chronological order
    selectedDates.sort((a, b) => new Date(a) - new Date(b));
}

function showLeaveApplicationButtons() {
    document.getElementById('calendar-action-buttons').style.display = 'flex';
}

function hideLeaveApplicationButtons() {
    document.getElementById('calendar-action-buttons').style.display = 'none';
}

// Event handler for "Leave Application" button
function handleApplyLeaveClick() {
    document.getElementById('emp-id').value = currentEmployeeId;
    document.getElementById('employee-name').value = currentEmployeeName;
    if (selectedDates.length > 0) {
        document.getElementById('start-date').value = selectedDates[0];
        document.getElementById('end-date').value = selectedDates[selectedDates.length - 1];
    } else {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
    }
    document.getElementById('leave-drawer').classList.add('open');
    document.querySelector('.container').classList.add('leave-drawer-open');
}

function hideLeaveDrawer() {
    document.getElementById('leave-drawer').classList.remove('open');
    document.querySelector('.container').classList.remove('leave-drawer-open');
}

// Initial render of the calendar and the employee's attendance table
document.addEventListener('DOMContentLoaded', function () {
    console.log("Attendance script loaded and DOM is ready.");

    renderCalendar(calendarMonthOffset);

    const markAttendanceBtn = document.getElementById('mark-attendance-btn');
    const statusNotification = document.getElementById('status-notification');
    const statusMessage = document.getElementById('status-notification-message');

    if (!markAttendanceBtn) {
        console.error("Mark Attendance button not found!");
        return;
    }
    if (!statusNotification) {
        console.error("Status notification element not found!");
    }

    markAttendanceBtn.addEventListener('click', () => {
        console.log("Mark Attendance button clicked!");

        // Show success notification
        if (statusNotification && statusMessage) {
            statusMessage.textContent = "Attendance marked successfully!";
            statusNotification.classList.add('show');
            console.log("Added 'show' class to notification.");

            // Hide after 3 seconds
            setTimeout(() => {
                statusNotification.classList.remove('show');
                console.log("Removed 'show' class from notification.");
            }, 3000);
        } else {
            // Fallback for some reason if elements are not found
            console.error("Could not show notification because elements were not found.");
            alert("Attendance marked successfully!");
        }
    });

    // Show notification on leave application submit
    const leaveForm = document.getElementById('leave-application-form');
    if (leaveForm) {
        leaveForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // You can add your form submission logic here (AJAX, etc.)
            if (statusNotification && statusMessage) {
                statusMessage.textContent = "Leave application sent successfully!";
                statusNotification.classList.add('show');
                setTimeout(() => {
                    statusNotification.classList.remove('show');
                }, 3000);
            } else {
                alert("Leave application sent successfully!");
            }
            // Hide the leave drawer after submission
            hideLeaveDrawer();
            // Clear calendar selection and hide leave application buttons
            clearCalendarSelection();
            selectedDates = [];
            hideLeaveApplicationButtons();
            // Reset the leave application form fields
            leaveForm.reset();
        });
    }

    // Filter functionality (if you use it)
    const filterDateEl = document.getElementById("filter-date");
    const filterStatusEl = document.getElementById("filter-status");

    function applyGeneralFilters() {
        const filterDate = filterDateEl ? filterDateEl.value : '';
        const filterStatus = filterStatusEl ? filterStatusEl.value : '';
        console.log("General Filter Applied - Date:", filterDate, "Status:", filterStatus);
    }

    if (filterDateEl) filterDateEl.addEventListener("change", applyGeneralFilters);
    if (filterStatusEl) filterStatusEl.addEventListener("change", applyGeneralFilters);
    applyGeneralFilters();
});
