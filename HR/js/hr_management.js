// HR/js/hr_management.js

// Global flags for edit mode
let isEditMode = false;
let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
    const employeeForm = document.getElementById('employeeForm');
    const employeeModal = document.getElementById('employeeModal');
    const modalTitle = document.getElementById('modalTitle');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');

    // Map user_id prefix → role ID
    function getRoleId(userId) {
        if (userId.startsWith("AD")) return 1;
        if (userId.startsWith("HR")) return 2;
        if (userId.startsWith("EMP")) return 3;
        if (userId.startsWith("MGR")) return 4;
        return 3;
    }

    // Fetch & render all employees
    async function fetchEmployees() {
        const tbody = document.querySelector('#employeeTable tbody');
        tbody.innerHTML = '';
        try {
            const res = await fetch('/api/hr/employees');
            const employees = await res.json();
            employees.forEach(emp => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td><input type="checkbox" class="row-checkbox" /></td>
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
          </td>`;
                tbody.appendChild(row);
            });
            document.getElementById('totalEmployees').textContent = employees.length;
            attachRowEventListeners();
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            alert('Error loading employee list');
        }
    }

    // Wire up each row’s edit & delete buttons
    function attachRowEventListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                currentUserId = row.cells[1].textContent;
                isEditMode = true;
                modalTitle.textContent = 'Edit Employee';

                // Populate form from the table row
                ['empId', 'firstName', 'lastName', 'empEmail', 'empPhone', 'gender', 'dob', 'joiningDate', 'address']
                    .forEach((fieldId, i) => {
                        document.getElementById(fieldId).value = row.cells[i + 1].textContent;
                    });
                // Clear password fields
                document.getElementById('password').value = '';
                document.getElementById('confirmPassword').value = '';
                employeeModal.style.display = 'block';
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const row = btn.closest('tr');
                const userId = row.cells[1].textContent;
                if (!confirm(`Delete employee ${userId}?`)) return;

                try {
                    const res = await fetch(`/api/hr/employees/delete-employee/${userId}`, { method: 'DELETE' });
                    const result = await res.json();
                    if (!result.success) throw new Error(result.message || 'Delete failed');
                    alert('Deleted successfully');
                    fetchEmployees();
                } catch (err) {
                    console.error(err);
                    alert('Error deleting employee');
                }
            });
        });
    }

    // Handle Add / Update form submit
    employeeForm.addEventListener('submit', async e => {
        e.preventDefault();

        const user_id = document.getElementById('empId').value.trim();
        const first_name = document.getElementById('firstName').value.trim();
        const last_name = document.getElementById('lastName').value.trim();
        const e_mail = document.getElementById('empEmail').value.trim();
        const phone = document.getElementById('empPhone').value.trim();
        const gender = document.getElementById('gender').value;
        const dob = document.getElementById('dob').value;
        const joining_date = document.getElementById('joiningDate').value;
        const address = document.getElementById('address').value.trim();
        const password = document.getElementById('password').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (!password || password !== confirmPass) {
            return alert('Passwords must match and not be empty.');
        }

        const payload = {
            user_id,
            first_name,
            last_name,
            e_mail,
            phone,
            gender,
            dob,
            joining_date,
            address,
            password,
            emp_role_id: getRoleId(user_id)
        };

        try {
            let res, result;
            if (isEditMode && currentUserId) {
                // UPDATE
                res = await fetch(`/api/hr/employees/update-employee/${currentUserId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE
                res = await fetch('/api/hr/employees/add-employee', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            result = await res.json();
            if (!result.success) throw new Error(result.message || 'Request failed');

            alert(isEditMode ? 'Employee updated!' : 'Employee added!');
            employeeForm.reset();
            isEditMode = false;
            currentUserId = null;
            employeeModal.style.display = 'none';
            fetchEmployees();
        } catch (err) {
            console.error(err);
            alert('Something went wrong:\n' + err.message);
        }
    });

    // “Add Employee” button opens empty form
    addEmployeeBtn.addEventListener('click', () => {
        isEditMode = false;
        currentUserId = null;
        modalTitle.textContent = 'Add New Employee';
        employeeForm.reset();
        employeeModal.style.display = 'block';
    });

    // Close modal on “X” or Cancel
    [closeModalBtn, cancelBtn].forEach(btn =>
        btn.addEventListener('click', () => {
            employeeForm.reset();
            isEditMode = false;
            currentUserId = null;
            employeeModal.style.display = 'none';
        })
    );

    // Clicking outside the modal closes it
    window.addEventListener('click', e => {
        if (e.target === employeeModal) {
            employeeForm.reset();
            isEditMode = false;
            currentUserId = null;
            employeeModal.style.display = 'none';
        }
    });

    // Initial table load
    fetchEmployees();
});
