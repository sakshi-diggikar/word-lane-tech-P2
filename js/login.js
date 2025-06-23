
        document.addEventListener('DOMContentLoaded', function () {
            const loginForm = document.getElementById('loginForm');

            loginForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const formData = {
                    user_id: document.getElementById("loginId").value,
                    e_mail: document.getElementById("loginEmail").value,
                    password: document.getElementById("loginPassword").value
                };

                try {
                    const response = await fetch('http://localhost:3000/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        // ✅ Save name and role to localStorage
                        localStorage.setItem('userName', data.name);
                        localStorage.setItem('userRole', data.role);
                        localStorage.setItem('userId', formData.user_id);

                        const hour = new Date().getHours();
                        const greeting = hour < 12 ? 'Good Morning' :
                            hour < 18 ? 'Good Afternoon' : 'Good Evening';

                        showToast(`${greeting}, ${data.name}! (${data.role})`);

                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2500);
                    } else {
                        showToast(data.message || 'Login failed');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    showToast('Network error. Please try again.');
                }
            });

            function showToast(message) {
                const toast = document.getElementById("toast");
                toast.textContent = message;
                toast.className = "show";

                setTimeout(() => {
                    toast.className = toast.className.replace("show", "");
                }, 2300);
            }
        });
    