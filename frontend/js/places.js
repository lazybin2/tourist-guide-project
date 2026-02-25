let allPlaces = []; 

async function loadPlaces() {
    try {

        const places = await apiRequest("/places/all", "GET");
        allPlaces = places; 
        
        const container = document.getElementById('placeContainer');
        if (!container) return;

        renderPlaces(places);

    } catch (error) {
        console.error("Error loading places:", error);
    }
}

//place render function
function renderPlaces(places) {
    const container = document.getElementById('placeContainer');
    if (!container) return;
    
    if (places.length === 0) {
        container.innerHTML = `<p class="text-center text-muted col-12">No destinations available at the moment.</p>`;
        return;
    }

    container.innerHTML = places.map(place => `
        <div class="col-md-4 mb-4">
            <div class="card place-card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                <img src="${place.image_url || 'https://via.placeholder.com/800x500?text=No+Image'}" 
                     class="card-img-top" alt="${place.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold">${place.name}</h5>
                    <p class="card-text text-muted small" style="height: 40px; overflow: hidden;">${place.description}</p>
                    
                    <div class="mt-auto">
                        <span class="text-warning fw-bold d-block mb-3">
                            <i class="fas fa-map-marker-alt me-1"></i>${place.location}
                        </span>
                        
                        <div class="d-flex gap-2">
                            <a href="place-details.html?id=${place.id}" class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1 fw-bold">
                                Details
                            </a>
                            
                            <button class="btn btn-sm btn-primary rounded-pill flex-grow-1 fw-bold" 
                                    onclick="handleBooking(${place.id})">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

//booking function for place cards
function handleBooking(placeId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Please login first to book your favorite destination!");
        
        const isSub = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/dashboard/');
        window.location.href = isSub ? "login.html" : "auth/login.html";
        return;
    }

    const isSubFolder = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/dashboard/');
    const path = isSubFolder ? "../booking.html" : "booking.html";
    
    window.location.href = `dashboard/booking.html?placeId=${placeId}`;
}

//search filter function
function filterPlaces() {
    const searchInput = document.querySelector('input[placeholder*="Where to?"]');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allPlaces.filter(place => 
        place.name.toLowerCase().includes(searchTerm) || 
        place.location.toLowerCase().includes(searchTerm)
    );
    
    renderPlaces(filtered); 
}

document.addEventListener('DOMContentLoaded', loadPlaces);