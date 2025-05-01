function toggleDropdown() {
    document.querySelector('.custom-dropdown').classList.toggle('active');
}

function selectRole(role) {
    const roleText = document.getElementById('role-text');
    const roleIcon = document.getElementById('role-icon');
    const roleSelect = document.getElementById('role');

    switch (role) {
        case 'admin':
            roleText.textContent = 'Admin';
            roleIcon.className = 'fas fa-user-shield';
            break;
        case 'receiver':
            roleText.textContent = 'Receiver';
            roleIcon.className = 'fas fa-box-open';
            break;
        case 'donor':
            roleText.textContent = 'Donor';
            roleIcon.className = 'fas fa-hand-holding-heart';
            break;
        default:
            roleText.textContent = 'Select your role';
            roleIcon.className = 'fas fa-user-tag';
    }

    toggleDropdown();
    roleSelect.value = role;
}

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberMe = document.getElementById('rememberMe');
const alertBox = document.getElementById('alert');
const roleSelect = document.getElementById('role');

function showAlert(type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

async function handleLogin(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleSelect.value;

    if (!role || !email || !password) {
        showAlert('error', 'Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Login failed');

        if (rememberMe.checked) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('authToken', data.token);

        switch (role) {
            case 'admin': window.location.href = '/admin/dashboard'; break;
            case 'receiver': window.location.href = '/receiver/dashboard'; break;
            case 'donor': window.location.href = '/donor/dashboard'; break;
        }
    } catch (error) {
        showAlert('error', error.message);
        console.error('Login error:', error);
    }
}

function checkRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMe.checked = true;
    }
}

loginForm.addEventListener('submit', handleLogin);
checkRememberedEmail();
