
        document.addEventListener('DOMContentLoaded', function () {
            const addEmployeeBtn = document.getElementById('addEmployeeBtn');
            const employeeModal = document.getElementById('employeeModal');
            const modalTitle = document.getElementById('modalTitle');
            const employeeForm = document.getElementById('employeeForm');
            const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');
            const selectAllCheckbox = document.getElementById('selectAll');
            const rowCheckboxes = document.querySelectorAll('.row-checkbox');
            const editBtns = document.querySelectorAll('.edit-btn');
            const deleteBtns = document.querySelectorAll('.delete-btn');
            const reportTitle = document.getElementById('reportTitle');
            const detailedReportTitle = document.getElementById('detailedReportTitle');
            const totalEmployees = document.getElementById('totalEmployees');
            const totalHRs = document.getElementById('totalHRs');
            const totalAdmins = document.getElementById('totalAdmins');
            fetchEmployees();

            // Sample data counts
            let employeeCount = 2; // Update this based on actual data
            let hrCount = 1; // Update this based on actual data
            let adminCount = 1; // Update this based on actual data

            // Update counts on load
            totalEmployees.textContent = employeeCount;
            totalHRs.textContent = hrCount;
            totalAdmins.textContent = adminCount;

            // Show modal for adding new employee
            addEmployeeBtn.addEventListener('click', function () {
                modalTitle.textContent = 'Add New Employee';
                document.getElementById('empId').value = 'EMP' + Math.floor(1000 + Math.random() * 9000);
                employeeForm.reset();
                employeeModal.style.display = 'block';
            });

            // Edit button handler
            editBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const row = this.closest('tr');
                    modalTitle.textContent = 'Edit Employee';
                    document.getElementById('empId').value = row.cells[1].textContent;
                    document.getElementById('firstName').value = row.cells[2].textContent;
                    document.getElementById('lastName').value = row.cells[3].textContent;
                    document.getElementById('empEmail').value = row.cells[4].textContent;
                    document.getElementById('empPhone').value = row.cells[5].textContent;
                    document.getElementById('gender').value = row.cells[6].textContent === 'Male' ? '1' : '2';
                    document.getElementById('dob').value = row.cells[7].textContent;
                    document.getElementById('joiningDate').value = row.cells[8].textContent;
                    document.getElementById('address').value = row.cells[9].textContent;
                    employeeModal.style.display = 'block';
                });
            });

            // Delete button handler
            deleteBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    if (confirm('Are you sure you want to delete this employee?')) {
                        this.closest('tr').remove();
                        employeeCount--; // Decrease count on delete
                        totalEmployees.textContent = employeeCount; // Update displayed count
                    }
                });
            });

            // Select all checkbox handler
            selectAllCheckbox.addEventListener('change', function () {
                rowCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });

            // Close modal handler
            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    employeeModal.style.display = 'none';
                });
            });

            employeeForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const data = {
                    user_id: document.getElementById('empId').value,
                    first_name: document.getElementById('firstName').value,
                    last_name: document.getElementById('lastName').value,
                    e_mail: document.getElementById('empEmail').value,
                    phone: document.getElementById('empPhone').value,
                    gender: document.getElementById('gender').value,
                    dob: document.getElementById('dob').value,
                    joining_date: document.getElementById('joiningDate').value,
                    address: document.getElementById('address').value
                };

                try {
                    let response;
                    if (isEditMode && currentUserId) {
                        // 🔄 Edit existing employee
                        response = await fetch(`http://localhost:3000/api/hr/update-employee/${currentUserId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                    } else {
                        // ➕ Add new employee
                        response = await fetch('http://localhost:3000/api/hr/add-employee', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                    }

                    const result = await response.json();
                    if (result.success) {
                        alert(isEditMode ? 'Employee updated!' : 'Employee added!');
                        employeeModal.style.display = 'none';
                        fetchEmployees();
                    } else {
                        alert(result.error || 'Operation failed');
                    }

                } catch (err) {
                    alert('Something went wrong');
                    console.error(err);
                } finally {
                    isEditMode = false;
                    currentUserId = null;
                    employeeForm.reset();
                }
            });


            // Close modal when clicking outside
            window.addEventListener('click', function (e) {
                if (e.target === employeeModal) {
                    employeeModal.style.display = 'none';
                }
            });

            // Card click handler to change report title and table
            document.querySelectorAll('.report-card').forEach(card => {
                card.addEventListener('click', function () {
                    const category = this.dataset.category;
                    reportTitle.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Reports`;
                    detailedReportTitle.textContent = `Detailed ${category.charAt(0).toUpperCase() + category.slice(1)} Reports`;

                    // Logic to load the respective table data can be added here
                    // For example, you can filter the table based on the selected category
                    updateTable(category);
                });
            });

            function updateTable(category) {
                const tbody = document.querySelector('#employeeTable tbody');
                tbody.innerHTML = ''; // Clear existing rows

                // Sample data for demonstration
                const data = {
                    employee: [
                        { id: 'EMP001', firstName: 'Rajesh', lastName: 'Sharma', email: 'rajesh.sharma@example.com', phone: '+91 9876543210', gender: 'Male', dob: '1990-01-01', joiningDate: '2020-01-10', address: '123 Main St, City' },
                        { id: 'EMP002', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@example.com', phone: '+91 8765432109', gender: 'Female', dob: '1992-02-02', joiningDate: '2021-02-15', address: '456 Elm St, City' }
                    ],
                    hr: [
                        { id: 'HR001', firstName: 'Anita', lastName: 'Kumar', email: 'anita.kumar@example.com', phone: '+91 9988776655', gender: 'Female', dob: '1988-05-15', joiningDate: '2019-03-20', address: '789 Oak St, City' }
                    ],
                    admin: [
                        { id: 'ADM001', firstName: 'Suresh', lastName: 'Verma', email: 'suresh.verma@example.com', phone: '+91 1234567890', gender: 'Male', dob: '1985-07-30', joiningDate: '2018-01-05', address: '321 Pine St, City' }
                    ]
                };

                // Populate table based on selected category
                const selectedData = data[category] || [];
                selectedData.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                                            <td><input type="checkbox" class="row-checkbox"></td>
                                            <td>${item.id}</td>
                                            <td>${item.firstName}</td>
                                            <td>${item.lastName}</td>
                                            <td>${item.email}</td>
                                            <td>${item.phone}</td>
                                            <td>${item.gender}</td>
                                            <td>${item.dob}</td>
                                            <td>${item.joiningDate}</td>
                                            <td>${item.address}</td>
                                            <td>
                                                <span class="material-icons-sharp edit-btn">edit</span>
                                                <span class="material-icons-sharp delete-btn">delete</span>
                                            </td>
                                        `;
                    tbody.appendChild(row);
                });
            }
        });
        async function fetchEmployees() {
            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';

            try {
                const res = await fetch('http://localhost:3000/api/hr/employees');
                const employees = await res.json();
                employees.forEach(emp => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                <td><input type="checkbox" class="row-checkbox"></td>
                <td>${emp.user_id}</td>
                <td>${emp.first_name}</td>
                <td>${emp.last_name}</td>
                <td>${emp.e_mail}</td>
                <td>${emp.phone}</td>
                <td>${emp.gender == 1 ? 'Male' : 'Female'}</td>
                <td>${emp.dob}</td>
                <td>${emp.joining_date}</td>
                <td>${emp.address}</td>
                <td>
                    <span class="material-icons-sharp edit-btn">edit</span>
                    <span class="material-icons-sharp delete-btn">delete</span>
                </td>
            `;
                    tbody.appendChild(row);
                });

                document.getElementById('totalEmployees').textContent = employees.length;
            } catch (err) {
                console.error('Failed to fetch employees:', err);
            }
        }
        function attachRowEventListeners() {
                document.querySelectorAll('.edit-btn').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const row = this.closest('tr');
                        isEditMode = true;
                        currentUserId = row.cells[1].textContent;
                        modalTitle.textContent = 'Edit Employee';
                        document.getElementById('empId').value = currentUserId;
                        document.getElementById('firstName').value = row.cells[2].textContent;
                        document.getElementById('lastName').value = row.cells[3].textContent;
                        document.getElementById('empEmail').value = row.cells[4].textContent;
                        document.getElementById('empPhone').value = row.cells[5].textContent;
                        document.getElementById('gender').value = row.cells[6].textContent === 'Male' ? '1' : '2';
                        document.getElementById('dob').value = row.cells[7].textContent;
                        document.getElementById('joiningDate').value = row.cells[8].textContent;
                        document.getElementById('address').value = row.cells[9].textContent;
                        employeeModal.style.display = 'block';
                    });
                });

                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', async function () {
                        const row = this.closest('tr');
                        const userId = row.cells[1].textContent;
                        if (confirm(`Are you sure you want to delete employee ${userId}?`)) {
                            try {
                                const res = await fetch(`http://localhost:3000/api/hr/delete-employee/${userId}`, {
                                    method: 'DELETE'
                                });
                                const result = await res.json();
                                if (result.success) {
                                    alert('Deleted successfully');
                                    fetchEmployees();
                                } else {
                                    alert('Failed to delete');
                                }
                            } catch (err) {
                                console.error('Delete error:', err);
                            }
                        }
                    });
                });
            }

        // Add global editMode flag
            let isEditMode = false;
            let currentUserId = null;

            editBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const row = this.closest('tr');
                    modalTitle.textContent = 'Edit Employee';
                    isEditMode = true;
                    currentUserId = row.cells[1].textContent;
                    document.getElementById('empId').value = currentUserId;
                    document.getElementById('firstName').value = row.cells[2].textContent;
                    document.getElementById('lastName').value = row.cells[3].textContent;
                    document.getElementById('empEmail').value = row.cells[4].textContent;
                    document.getElementById('empPhone').value = row.cells[5].textContent;
                    document.getElementById('gender').value = row.cells[6].textContent === 'Male' ? '1' : '2';
                    document.getElementById('dob').value = row.cells[7].textContent;
                    document.getElementById('joiningDate').value = row.cells[8].textContent;
                    document.getElementById('address').value = row.cells[9].textContent;
                    employeeModal.style.display = 'block';
                });
            });

            attachRowEventListeners();

    