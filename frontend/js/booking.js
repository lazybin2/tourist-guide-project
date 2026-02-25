//guide booking function
const bookGuide = async (guideId) => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
        alert("Please log in to book a guide.");
        return;
    }

    try {
        const response = await apiRequest("/booking/request", "POST", { guideId });
        console.log("Booking Response:", response);
        alert("Guide booking request sent!");
    } catch (err) {
        console.error(err);
    }
};

//traveler booking function
async function handleBooking(placeName) {
    const bookingDate = prompt("Enter your travel date (YYYY-MM-DD):");
    const persons = prompt("How many persons?");

    if (!bookingDate || !persons) return;

    try {
        const response = await apiRequest("/bookings/book", "POST", {
            place_name: placeName,
            booking_date: bookingDate,
            persons: persons
        });

        alert(response.message);
        
        if (typeof loadAdminDashboardStats === 'function') {
            loadAdminDashboardStats();
        }
    } catch (error) {
        alert("Booking failed: " + error.message);
    }
}

//traveler booking list for traveler dashboard
async function loadTravelerBookings() {
    try {
        const bookings = await apiRequest("/booking/user-bookings", "GET");
        const table = document.getElementById("travelerBookingTable");
        
        if (!table) return;

        table.innerHTML = bookings.map(b => `
            <tr>
                <td>${b.guideName || 'N/A'}</td>
                <td>${b.placeName}</td>
                <td>${b.date}</td>
                <td>
                    <span class="badge bg-${b.status === 'Accepted' ? 'success' : 'warning'}">
                        ${b.status}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) { 
        console.error(err); 
    }
}

//guide request list for guide dashboard
async function updateBookingStatus(bookingId, status) {
    try {
        await apiRequest(`/booking/update/${bookingId}`, "PATCH", { status });
        alert("Booking " + status);
        location.reload(); 
    } catch (err) { 
        alert(err.message); 
    }
}