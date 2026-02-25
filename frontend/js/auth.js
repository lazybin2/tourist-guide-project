//login function
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await apiRequest("/auth/login", "POST", { email, password });

            localStorage.setItem("token", data.token); 
            localStorage.setItem("role", data.user ? data.user.role : data.role); 
            localStorage.setItem("userName", data.user ? data.user.name : "User");

            alert("Login Successful! Welcome " + (data.user ? data.user.name : "User"));
            
            const userRole = data.user ? data.user.role : data.role;
            if (userRole === "traveler") {
                window.location.href = "../dashboard/traveler.html";
            } else if (userRole === "admin" || userRole === "CEO" || userRole === "Manager") {
                window.location.href = "../dashboard/admin.html";
            } else {
                window.location.href = "../index.html";
            }
        } catch (error) {
            alert("Login Failed: " + error.message);
        }
    });
}

//registration function
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const adminSecret = document.getElementById('adminSecret')?.value || "";

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await apiRequest("/auth/register", "POST", { 
                name: fullName, email, password, role, adminSecret 
            });
            alert("Registration Successful! Please login.");
            window.location.href = "login.html"; 
        } catch (error) {
            alert("Registration Failed: " + error.message);
        }
    });
}

//navbar update function
function updateNavbar() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const authButtons = document.getElementById("authButtons");

    if (authButtons) {
        const isSubFolder = window.location.pathname.includes('/auth/') || 
                           window.location.pathname.includes('/dashboard/') || 
                           window.location.pathname.includes('/admin/');
        
        let pathPrefix = isSubFolder ? "../" : "";

        if (token) {
            let menuHTML = "";
            if (role === "guide") {
                menuHTML = `
                    <li class="nav-item dropdown list-unstyled">
                        <a class="nav-link dropdown-toggle btn btn-info btn-sm text-white px-3 rounded-pill" href="#" id="guideDropdown" role="button" data-bs-toggle="dropdown">
                            <i class="fas fa-th-large me-1"></i> My Dashboard
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                            <li><a class="dropdown-item" href="${pathPrefix}dashboard/guide.html">Profile Settings</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="logoutUser()">Logout</a></li>
                        </ul>
                    </li>`;
            } else if (role === "admin" || role === "CEO" || role === "Manager") {
                menuHTML = `
                    <a href="${pathPrefix}dashboard/admin.html" class="btn btn-primary btn-sm rounded-pill px-4 me-2 text-white">
                        <i class="fas fa-user-shield me-1"></i> Control Center
                    </a>
                    <button onclick="logoutUser()" class="btn btn-outline-danger btn-sm rounded-pill px-4">Logout</button>`;
            } else {
                
                menuHTML = `
                    <a href="${pathPrefix}dashboard/traveler.html" class="btn btn-info btn-sm rounded-pill px-4 me-2 text-white">
                        <i class="fas fa-user me-1"></i> My Profile
                    </a>
                    <button onclick="logoutUser()" class="btn btn-outline-danger btn-sm rounded-pill px-4">Logout</button>`;
            }
            authButtons.innerHTML = menuHTML;
        } else {
            authButtons.innerHTML = `
                <a href="${pathPrefix}auth/login.html" class="btn btn-outline-info btn-sm rounded-pill px-4">Login</a>
                <a href="${pathPrefix}auth/register.html" class="btn btn-info btn-sm rounded-pill px-4 ms-2">Register</a>`;
        }
    }
}

//logout function
function logoutUser() {
    localStorage.clear();
    alert("Logged out successfully!");
    const isSub = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/dashboard/');
    window.location.href = isSub ? "../index.html" : "index.html";
}

document.addEventListener('DOMContentLoaded', updateNavbar);