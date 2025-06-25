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
    // Future dates for calendar display, but won't show in table
    { employeeId: "EMP001", date: "2025-06-01", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-02", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-03", status: "absent", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-04", status: "leave", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-05", status: "holiday", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-06", status: "present", timeIn: "09:05 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-07", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-08", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-09", status: "late", timeIn: "10:30 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-10", status: "half-day", timeIn: "01:00 PM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-11", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-12", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-13", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-14", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-15", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-16", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-17", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-18", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-19", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-20", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-21", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-22", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-23", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-24", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-25", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-26", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-27", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
    { employeeId: "EMP001", date: "2025-06-28", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-29", status: "weekend", timeIn: "", timeOut: "" },
    { employeeId: "EMP001", date: "2025-06-30", status: "present", timeIn: "09:00 AM", timeOut: "05:00 PM" },
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


let calendarVisible = false;
let calendarMonthOffset = 0;
let isDragging = false;
let selectedDates = []; // Stores all dates in the dragged range
let startDragDate = null;
let endDragDate = null;

// Get references to main layout elements
const container = document.querySelector('.container');
const mainContent = document.getElementById('main-content');
const rightSection = document.getElementById('right-section');

// Pagination variables for "My Attendance Records" table
const RECORDS_PER_PAGE = 7; // One week's worth of data
let currentPage = 0; // 0-indexed page number
let filteredAndSortedRecords = []; // Stores records for the current employee, filtered by date and sorted

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

function toggleCalendar() {
    const calendar = document.getElementById('calendar');
    const leaveForm = document.getElementById('leave-application-form');

    // Toggle visibility state
    calendarVisible = !calendarVisible;

    // Apply display style
    calendar.style.display = calendarVisible ? 'block' : 'none';

    // Hide form and reset selection if calendar is being hidden
    if (!calendarVisible) {
        leaveForm.style.display = 'none';
        selectedDates = [];
        clearCalendarSelection();
        hideLeaveApplicationButtons();
        container.classList.remove('form-open'); // Reset layout
    } else {
        // If calendar is being shown, render it
        renderCalendar(calendarMonthOffset);
    }
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
            // If there's already a status text, put holiday text below it, otherwise just holiday text
            // Ensure holiday text is always present if it's a holiday
            cellContent += `<span class="holiday-text">${holiday.name}</span>`;
        }
        cell.innerHTML = cellContent;
        grid.appendChild(cell);
    }

    calendar.appendChild(grid); // Append grid after header

    addCalendarDragListeners();
    // Re-attach event listeners for the newly rendered buttons
    document.getElementById('apply-leave-btn').addEventListener('click', handleApplyLeaveClick);
    document.getElementById('cancel-selection-btn').addEventListener('click', handleCancelSelectionClick);
}

function changeMonth(direction) {
    calendarMonthOffset += direction;
    renderCalendar(calendarMonthOffset);
    selectedDates = []; // Clear selection on month change
    hideLeaveApplicationButtons(); // Hide buttons on month change
    document.getElementById('leave-application-form').style.display = 'none'; // Hide form on month change
    container.classList.remove('form-open'); // Reset layout
}

function addCalendarDragListeners() {
    const calendarGrid = document.querySelector('.calendar-grid');
    if (!calendarGrid) return;

    calendarGrid.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('calendar-cell')) {
            isDragging = true;
            clearCalendarSelection();
            selectedDates = [];
            startDragDate = e.target.dataset.date;
            e.target.classList.add('selected');
            hideLeaveApplicationButtons(); // Hide buttons immediately on new drag
            document.getElementById('leave-application-form').style.display = 'none'; // Hide form immediately on new drag
            container.classList.remove('form-open'); // Reset layout
        }
    });

    calendarGrid.addEventListener('mouseover', (e) => {
        if (isDragging && e.target.classList.contains('calendar-cell')) {
            endDragDate = e.target.dataset.date;
            updateCalendarSelection(startDragDate, endDragDate);
        }
    });

    calendarGrid.addEventListener('mouseup', () => {
        isDragging = false;
        if (selectedDates.length > 0) {
            showLeaveApplicationButtons();
        } else {
            hideLeaveApplicationButtons();
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

function updateCalendarSelection(startDateStr, endDateStr) {
    clearCalendarSelection();
    selectedDates = [];

    const startDate = parseYMDToDate(startDateStr);
    const endDate = parseYMDToDate(endDateStr);

    const minDate = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const maxDate = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    document.querySelectorAll('.calendar-cell').forEach(cell => {
        const cellDate = parseYMDToDate(cell.dataset.date);
        if (cellDate >= minDate && cellDate <= maxDate) {
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
    const leaveForm = document.getElementById('leave-application-form');
    leaveForm.style.display = 'block';
    hideLeaveApplicationButtons(); // Hide buttons after clicking "Leave Application"

    // Adjust layout
    container.classList.add('form-open');

    // Populate form fields
    document.getElementById('emp-id').value = currentEmployeeId;
    document.getElementById('employee-name').value = currentEmployeeName;

    // Populate start and end dates from selectedDates array
    if (selectedDates.length > 0) {
        document.getElementById('start-date').value = selectedDates[0];
        document.getElementById('end-date').value = selectedDates[selectedDates.length - 1];
    } else {
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
    }
}

// Event handler for "Cancel" button (for date selection)
function handleCancelSelectionClick() {
    selectedDates = [];
    clearCalendarSelection();
    hideLeaveApplicationButtons();
    document.getElementById('leave-application-form').style.display = 'none'; // Also hide form if it was open
    container.classList.remove('form-open'); // Reset layout
}

// Function to hide the leave application form
function hideLeaveForm() {
    document.getElementById('leave-application-form').style.display = 'none';
    // Calendar remains visible, no need to toggle its display
    // Clear form fields
    document.getElementById('leave-subject').value = '';
    document.getElementById('leave-description').value = '';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    selectedDates = []; // Clear selection when form is cancelled
    clearCalendarSelection(); // Clear visual selection
    container.classList.remove('form-open'); // Reset layout
}

// Event listener for "Mark Attendance" button
document.getElementById('mark-attendance-btn').addEventListener('click', () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const currentDate = formatDateToYMD(now);

    // Prevent marking attendance for future dates
    const todayYMD = formatDateToYMD(new Date());
    if (currentDate > todayYMD) {
        alert("You cannot mark attendance for a future date.");
        return;
    }

    let status = "present";
    let timeIn = currentTime;
    let timeOut = "";

    const checkTime = now.getHours() * 60 + now.getMinutes(); // minutes from midnight

    // 9:20 AM = 9*60 + 20 = 560 minutes
    // 12:30 PM = 12*60 + 30 = 750 minutes
    // 3:00 PM = 15*60 + 0 = 900 minutes

    if (checkTime > 560 && checkTime <= 750) { // After 9:20 AM and before or at 12:30 PM
        status = "late";
    } else if (checkTime > 750 && checkTime <= 900) { // After 12:30 PM and before or at 3:00 PM
        status = "half-day";
    } else if (checkTime > 900) { // After 3:00 PM
        alert("It's too late to mark attendance for a full or half day.");
        return;
    }

    // Check if attendance for today already exists
    const existingRecordIndex = employeeAttendanceData.findIndex(
        r => r.employeeId === currentEmployeeId && r.date === currentDate
    );

    if (existingRecordIndex !== -1) {
        // If status is already present/half-day, update timeOut
        if (employeeAttendanceData[existingRecordIndex].status === "present" || employeeAttendanceData[existingRecordIndex].status === "half-day") {
            employeeAttendanceData[existingRecordIndex].timeOut = currentTime;
            alert(`Attendance updated for today (${currentDate}): Time Out set to ${currentTime}.`);
        } else {
            alert(`Attendance for today (${currentDate}) is already marked as ${employeeAttendanceData[existingRecordIndex].status}. Cannot mark again.`);
            return;
        }
    } else {
        // Add new attendance record
        employeeAttendanceData.push({
            employeeId: currentEmployeeId,
            date: currentDate,
            status: status,
            timeIn: timeIn,
            timeOut: timeOut
        });
        alert(`Attendance marked for today (${currentDate}): Status - ${status.toUpperCase()}, Time In - ${timeIn}.`);
    }

    renderMyAttendanceTable(); // Re-render the table to show the updated status
    if (calendarVisible) { // If calendar is open, re-render it too
        renderCalendar(calendarMonthOffset);
    }
});


// Render employee's specific attendance table with pagination
function renderMyAttendanceTable() {
    const myAttendanceTbody = document.getElementById("my-attendance-tbody");
    myAttendanceTbody.innerHTML = "";

    const todayYMD = formatDateToYMD(new Date());

    // Filter data for the current employee only and for dates up to today
    filteredAndSortedRecords = employeeAttendanceData.filter(
        (record) => record.employeeId === currentEmployeeId && record.date <= todayYMD
    ).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    const totalPages = Math.ceil(filteredAndSortedRecords.length / RECORDS_PER_PAGE);

    // Ensure currentPage is within valid bounds
    if (currentPage < 0) currentPage = 0;
    if (currentPage >= totalPages && totalPages > 0) currentPage = totalPages - 1;

    const startIndex = currentPage * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    const recordsToDisplay = filteredAndSortedRecords.slice(startIndex, endIndex);

    if (recordsToDisplay.length === 0) {
        myAttendanceTbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; padding: 2rem; color: var(--color-dark-variant); font-style: italic;">
              No attendance records found for this period.
            </td>
          </tr>
        `;
    } else {
        for (const record of recordsToDisplay) {
            const statusInfo = {
                present: { text: "Present", class: "status-badge present" },
                absent: { text: "Absent", class: "status-badge absent" },
                late: { text: "Late", class: "status-badge late" },
                onleave: { text: "On Leave", class: "status-badge onleave" },
                "half-day": { text: "Half Day", class: "status-badge half-day" },
                "holiday": { text: "Holiday", class: "status-badge onleave" }, // Using onleave style for holiday
                "weekend": { text: "Weekend", class: "status-badge onleave" } // Using onleave style for weekend
            };
            const statusDisplay = statusInfo[record.status] || { text: record.status, class: "status-badge" };

            myAttendanceTbody.innerHTML += `
              <tr>
                <td>${record.date}</td>
                <td><span class="${statusDisplay.class}">${statusDisplay.text}</span></td>
                <td>${record.timeIn || '-'}</td>
                <td>${record.timeOut || '-'}</td>
              </tr>
            `;
        }
    }
    updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {
    const prevBtn = document.getElementById('prev-week-btn');
    const nextBtn = document.getElementById('next-week-btn');
    const weekRangeDisplay = document.getElementById('current-week-range');

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;

    if (filteredAndSortedRecords.length > 0) {
        const startRecordIndex = currentPage * RECORDS_PER_PAGE;
        const endRecordIndex = Math.min(startRecordIndex + RECORDS_PER_PAGE - 1, filteredAndSortedRecords.length - 1);

        const startDate = filteredAndSortedRecords[startRecordIndex].date;
        const endDate = filteredAndSortedRecords[endRecordIndex].date;

        weekRangeDisplay.textContent = `${startDate} to ${endDate}`;
    } else {
        weekRangeDisplay.textContent = 'No records';
    }
}

// Event listeners for pagination buttons
document.getElementById('prev-week-btn').addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        renderMyAttendanceTable();
    }
});

document.getElementById('next-week-btn').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredAndSortedRecords.length / RECORDS_PER_PAGE);
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderMyAttendanceTable();
    }
});


// Initial render of the employee's attendance table
renderMyAttendanceTable();


// Filter functionality (kept for general filtering, though the main table is gone)
const filterDateEl = document.getElementById("filter-date");
const filterStatusEl = document.getElementById("filter-status");

// This function now only logs to console as the main table is removed.
// If you want to filter the "My Attendance Records" table, you'd modify renderMyAttendanceTable
// to accept filters.
function applyGeneralFilters() {
    const filterDate = filterDateEl.value;
    const filterStatus = filterStatusEl.value;

    // This part is for general attendance data, not the specific employee's table
    // If you want to filter the "My Attendance Records" table, you'd call
    // renderMyAttendanceTable with filter parameters.
    console.log("General Filter Applied - Date:", filterDate, "Status:", filterStatus);
}

filterDateEl.addEventListener("change", applyGeneralFilters);
filterStatusEl.addEventListener("change", applyGeneralFilters);
applyGeneralFilters(); // Initial call
