document.addEventListener("DOMContentLoaded", () => {
    const analyticsCards = document.querySelectorAll(".analytics-card");
    const detailsTitle = document.getElementById("details-title");
    const ganttChartContainer = document.getElementById("gantt-chart-container");
    const dataTable = document.getElementById("analytics-data-table");
    const dataTableHead = dataTable.querySelector("thead tr");
    const dataTableBody = dataTable.querySelector("tbody");

    // Dummy data for demonstration
    const analyticsData = {
        team: {
            gantt: [
                { id: 1, name: "Team A Project X", start: "2023-10-01", end: "2023-10-15" },
                { id: 2, name: "Team B Task Y", start: "2023-10-05", end: "2023-10-20" },
                { id: 3, name: "Team C Initiative Z", start: "2023-10-10", end: "2023-10-25" },
            ],
            table: {
                headers: ["Member ID", "Name", "Role", "Current Project"],
                rows: [
                    ["EMP001", "Alice Smith", "Developer", "Project Alpha"],
                    ["EMP002", "Bob Johnson", "Designer", "Project Beta"],
                    ["EMP003", "Charlie Brown", "QA Engineer", "Project Gamma"],
                ],
            },
        },
        projects: {
            gantt: [
                { id: 1, name: "Project Alpha", start: "2023-09-10", end: "2023-10-30" },
                { id: 2, name: "Project Beta", start: "2023-10-01", end: "2023-11-15" },
                { id: 3, name: "Project Gamma", start: "2023-09-20", end: "2023-10-28" },
            ],
            table: {
                headers: ["Project ID", "Project Name", "Status", "Manager", "Due Date"],
                rows: [
                    ["PROJ001", "Alpha Launch", "Completed", "John Doe", "2023-10-30"],
                    ["PROJ002", "Beta Redesign", "Active", "Jane Smith", "2023-11-15"],
                    ["PROJ003", "Gamma Integration", "Delayed", "Peter Jones", "2023-10-28"],
                ],
            },
        },
        tasks: {
            gantt: [
                { id: 1, name: "Task 1.1", start: "2023-10-01", end: "2023-10-05" },
                { id: 2, name: "Task 1.2", start: "2023-10-06", end: "2023-10-10" },
                { id: 3, name: "Task 2.1", start: "2023-10-03", end: "2023-10-08" },
            ],
            table: {
                headers: ["Task ID", "Task Name", "Assigned To", "Status", "Due Date"],
                rows: [
                    ["TASK001", "Design UI", "Alice Smith", "Active", "2023-10-05"],
                    ["TASK002", "Develop Backend", "Bob Johnson", "Completed", "2023-10-01"],
                    ["TASK003", "Test Module", "Charlie Brown", "Delayed", "2023-10-08"],
                ],
            },
        },
        leave_application: {
            gantt: [
                { id: 1, name: "Alice Leave", start: "2023-10-10", end: "2023-10-12" },
                { id: 2, name: "Bob Leave", start: "2023-10-15", end: "2023-10-15" },
                { id: 3, name: "Charlie Leave", start: "2023-10-20", end: "2023-10-25" },
            ],
            table: {
                headers: ["Application ID", "Employee Name", "Leave Type", "Start Date", "End Date", "Status"],
                rows: [
                    ["LEAVE001", "Alice Smith", "Sick Leave", "2023-10-10", "2023-10-12", "Approved"],
                    ["LEAVE002", "Bob Johnson", "Casual Leave", "2023-10-15", "2023-10-15", "Pending"],
                    ["LEAVE003", "Charlie Brown", "Vacation", "2023-10-20", "2023-10-25", "Approved"],
                ],
            },
        },
        attendance: {
            gantt: [
                { id: 1, name: "Alice Attendance", start: "2023-10-01", end: "2023-10-31" },
                { id: 2, name: "Bob Attendance", start: "2023-10-01", end: "2023-10-31" },
            ],
            table: {
                headers: ["Employee ID", "Name", "Date", "Status", "In Time", "Out Time"],
                rows: [
                    ["EMP001", "Alice Smith", "2023-10-26", "Present", "09:00 AM", "05:00 PM"],
                    ["EMP002", "Bob Johnson", "2023-10-26", "Absent", "-", "-"],
                    ["EMP003", "Charlie Brown", "2023-10-26", "Present", "09:15 AM", "05:30 PM"],
                ],
            },
        },
    };

    // Function to render a simple Gantt chart (conceptual)
    function renderGanttChart(data) {
        ganttChartContainer.innerHTML = ''; // Clear previous chart
        if (!data || data.length === 0) {
            ganttChartContainer.textContent = "No Gantt chart data available.";
            return;
        }

        // For a real Gantt chart, you'd use a library like DHTMLX Gantt, Frappe Gantt, or Google Charts.
        // This is a very basic conceptual representation.
        const chartDiv = document.createElement('div');
        chartDiv.style.width = '100%';
        chartDiv.style.height = '100%';
        chartDiv.style.display = 'flex';
        chartDiv.style.flexDirection = 'column';
        chartDiv.style.padding = '10px';
        chartDiv.style.boxSizing = 'border-box';

        const startDate = new Date(Math.min(...data.map(d => new Date(d.start))));
        const endDate = new Date(Math.max(...data.map(d => new Date(d.end))));
        const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

        // Create a header for dates (simplified for one month)
        const dateHeader = document.createElement('div');
        dateHeader.style.display = 'flex';
        dateHeader.style.width = '100%';
        dateHeader.style.borderBottom = '1px solid #ccc';
        dateHeader.style.paddingBottom = '5px';
        dateHeader.style.marginBottom = '5px';

        const nameColWidth = '150px'; // Fixed width for task names

        const emptyHeader = document.createElement('div');
        emptyHeader.style.width = nameColWidth;
        dateHeader.appendChild(emptyHeader);

        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dayDiv = document.createElement('div');
            dayDiv.textContent = currentDate.getDate();
            dayDiv.style.flex = '1';
            dayDiv.style.textAlign = 'center';
            dayDiv.style.fontSize = '0.7rem';
            dateHeader.appendChild(dayDiv);
        }
        chartDiv.appendChild(dateHeader);


        data.forEach(item => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.width = '100%';
            row.style.alignItems = 'center';
            row.style.marginBottom = '5px';

            const nameDiv = document.createElement('div');
            nameDiv.textContent = item.name;
            nameDiv.style.width = nameColWidth;
            nameDiv.style.whiteSpace = 'nowrap';
            nameDiv.style.overflow = 'hidden';
            nameDiv.style.textOverflow = 'ellipsis';
            nameDiv.style.fontSize = '0.8rem';
            row.appendChild(nameDiv);

            const itemStart = new Date(item.start);
            const itemEnd = new Date(item.end);

            const offsetDays = (itemStart - startDate) / (1000 * 60 * 60 * 24);
            const durationDays = (itemEnd - itemStart) / (1000 * 60 * 60 * 24) + 1;

            const emptyBefore = document.createElement('div');
            emptyBefore.style.flex = offsetDays;
            row.appendChild(emptyBefore);

            const bar = document.createElement('div');
            bar.style.flex = durationDays;
            bar.style.backgroundColor = var_color_primary; // Use CSS variable
            bar.style.height = '20px';
            bar.style.borderRadius = '3px';
            bar.style.margin = '0 2px';
            row.appendChild(bar);

            const emptyAfter = document.createElement('div');
            emptyAfter.style.flex = totalDays - offsetDays - durationDays;
            row.appendChild(emptyAfter);

            chartDiv.appendChild(row);
        });

        ganttChartContainer.appendChild(chartDiv);
    }

    // Function to populate the table
    function populateTable(data) {
        dataTableHead.innerHTML = ''; // Clear previous headers
        dataTableBody.innerHTML = ''; // Clear previous data

        if (!data || !data.headers || !data.rows || data.rows.length === 0) {
            dataTableBody.innerHTML = '<tr><td colspan="100%" style="text-align: center;">No table data available.</td></tr>';
            return;
        }

        // Populate headers
        data.headers.forEach(headerText => {
            const th = document.createElement("th");
            th.textContent = headerText;
            dataTableHead.appendChild(th);
        });

        // Populate rows
        data.rows.forEach(rowData => {
            const tr = document.createElement("tr");
            rowData.forEach(cellData => {
                const td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });
            dataTableBody.appendChild(tr);
        });
    }

    // Event listener for analytics cards
    analyticsCards.forEach(card => {
        card.addEventListener("click", () => {
            const cardType = card.dataset.card;
            const cardTitle = card.querySelector("h3").textContent;

            detailsTitle.textContent = `${cardTitle} Details`;

            const data = analyticsData[cardType]; // Get data based on card type

            if (data) {
                renderGanttChart(data.gantt);
                populateTable(data.table);
            } else {
                ganttChartContainer.textContent = "No data available for this category.";
                populateTable({ headers: [], rows: [] });
            }
        });
    });

    // Initial load: Hide details until a card is selected
    ganttChartContainer.textContent = "Select a card above to view the Gantt chart.";
    populateTable({ headers: [], rows: [] });

    // Sidebar & theme toggle (copied from index.js to ensure functionality on this page)
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const themeToggler = document.querySelector(".theme-toggler");

    menuBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "block";
    });

    closeBtn?.addEventListener("click", () => {
        document.querySelector("aside").style.display = "none";
    });

    themeToggler?.addEventListener("click", () => {
        document.body.classList.toggle("dark-theme-variables");
        themeToggler
            .querySelector("span:nth-child(1)")
            ?.classList.toggle("active");
        themeToggler
            .querySelector("span:nth-child(2)")
            ?.classList.toggle("active");
    });

    // Profile info (copied from index.js)
    const name = localStorage.getItem("userName") || "User";
    const role = localStorage.getItem("userRole") || "";
    document.querySelector(".profile .info p").innerHTML = `Hey, <b>${name}</b>`;
    document.querySelector(".profile .info small").textContent =
        role.charAt(0).toUpperCase() + role.slice(1);
});

// Define a CSS variable for primary color to be used in JS
const var_color_primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
  