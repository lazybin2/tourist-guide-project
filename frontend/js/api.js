const BASE_URL = "https://tourist-guide-backend-zl1u.onrender.com/api";

async function apiRequest(endpoint, method = "GET", body = null) {
    
    const token = localStorage.getItem("authToken");
    
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Something went wrong");
        }
        
        return result;
    } catch (error) {
        console.error("❌ API Call Error:", error.message);
        throw error;
    }

}
