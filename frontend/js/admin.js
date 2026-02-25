//security check for admin access
(function checkAdminAccess() {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token || (role !== "admin" && role !== "CEO" && role !== "Manager")) {
        alert("Unauthorized Access! Only CEO/Admin can access this page.");
        window.location.href = "../auth/login.html";
    }
})();

//dashboard stats load function
async function loadAdminDashboardStats() {
    try {
        const stats = await apiRequest("/admin/stats", "GET");
        
        const usersEl = document.getElementById('totalUsers');
        const guidesEl = document.getElementById('totalGuides');
        const bookingsEl = document.getElementById('totalBookings');

        if (usersEl) usersEl.innerText = stats.totalUsers || 0;
        if (guidesEl) guidesEl.innerText = stats.totalGuides || 0;
        if (bookingsEl) bookingsEl.innerText = stats.totalBookings || 0;

    } catch (error) {
        console.error("Stats Loading Error:", error);
    }
}

//user list load function
async function loadUserList() {
    try {
        const users = await apiRequest("/admin/users", "GET");
        const tableBody = document.getElementById('userTableBody');
        
        if (!tableBody) return;

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="badge rounded-pill bg-${user.role === 'admin' ? 'danger' : 'info'} px-3">
                        ${user.role}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-3" 
                            onclick="handleDeleteUser(${user.id})">
                        <i class="fas fa-trash-alt me-1"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("User list error:", error);
    }
}

//guide list load function
async function loadAllGuides() {
    try {
        
        const guides = await apiRequest("/guide/all", "GET"); 
        const tableBody = document.getElementById('guideTableBody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = guides.map(guide => `
            <tr>
                <td>${guide.name}</td>
                <td>${guide.email}</td>
                <td>${guide.location || 'Not Set'}</td>
                <td>
                    <span class="badge ${guide.is_verified ? 'bg-success' : 'bg-warning text-dark'}">
                        ${guide.is_verified ? 'Verified' : 'Pending'}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm ${guide.is_verified ? 'btn-danger' : 'btn-success'} rounded-pill px-3" 
                            onclick="toggleVerification(${guide.user_id}, ${guide.is_verified ? 0 : 1})">
                        ${guide.is_verified ? 'Unverify' : 'Verify Now'}
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("Error loading guides:", error);
    }
}

//guide verification toggle function
async function toggleVerification(guideId, status) {
    if (!confirm("Are you sure you want to change this guide's status?")) return;

    try {
        const result = await apiRequest("/admin/verify-guide", "PUT", { guideId, status });
        alert(result.message);
        loadAllGuides();
        loadAdminDashboardStats(); 
    } catch (error) {
        alert("Action Failed: " + error.message);
    }
}

//staff create function
document.getElementById('createStaffForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const staffData = {
        name: document.getElementById('staffName').value,
        email: document.getElementById('staffEmail').value,
        role: document.getElementById('staffRole').value,
        password: document.getElementById('staffPassword').value
    };

    try {
        
        await apiRequest("/auth/register", "POST", staffData); 
        
        alert(`Success: ${staffData.role.toUpperCase()} account created!`);
        e.target.reset();
        
        loadUserList();
        loadAllGuides();
        loadAdminDashboardStats();
    } catch (error) {
        alert("Action Failed: " + error.message);
    }
});

//user delete function
async function handleDeleteUser(userId) {
    if (confirm("Are you sure you want to remove this user?")) {
        try {
            await apiRequest(`/admin/users/${userId}`, "DELETE");
            alert("User deleted successfully!");
            loadUserList();
            loadAllGuides();
            loadAdminDashboardStats();
        } catch (error) {
            alert("Delete failed: " + error.message);
        }
    }
}

//logout function
function logoutUser() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    window.location.href = "../auth/login.html";
}

