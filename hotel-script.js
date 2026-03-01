/* =========================================
   LOCAL LOGIN & REGISTER AUTHENTICATION
========================================= */

// Update the Navigation Bar UI
function updateAuthUI(user) {
    const authSection = document.getElementById('auth-section');
    const userProfile = document.getElementById('user-profile');
    
    if (user) {
        if (authSection) authSection.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        document.getElementById('user-pic').src = user.picture || 'Hotel Grand Plaza Logo.png';
        document.getElementById('user-name').innerText = user.name || user.email;
    } else {
        if (authSection) authSection.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// Simple logout
function handleLogout() {
    sessionStorage.removeItem('hotelGuestUser');
    updateAuthUI(null);
    bookings = [];
    renderBookingHistory();
    showToast("Logged out successfully");
}

// Open/Close login & register modals
function openLoginModal() { document.getElementById('login-modal').classList.add('active'); document.body.style.overflow='hidden'; }
function closeLoginModal() { document.getElementById('login-modal').classList.remove('active'); document.body.style.overflow='auto'; }
function openRegisterModal() { document.getElementById('register-modal').classList.add('active'); document.body.style.overflow='hidden'; }
function closeRegisterModal() { document.getElementById('register-modal').classList.remove('active'); document.body.style.overflow='auto'; }

// On load, restore session user if present
window.addEventListener('load', () => {
    const savedUser = sessionStorage.getItem('hotelGuestUser');
    if (savedUser) updateAuthUI(JSON.parse(savedUser));

    // Hook up auth buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (registerBtn) registerBtn.addEventListener('click', openRegisterModal);
});


/* =========================================
   HOTEL DATA & BOOKING LOGIC
========================================= */

// Data storage
let roomsData = [];
let hallsData = [];
let bookings = [];

// Helper function to load bookings after Firebase is ready
function initBookingsLoading() {
    if (window.firebaseServices) {
        loadBookings();
    } else {
        // Wait for firebaseReady event
        window.addEventListener('firebaseReady', () => {
            loadBookings();
        });
    }
}

// Hotel data - embedded directly to work without web server
const hotelData = {
  "rooms": [
    { "id": "r1", "number": "101", "name": "Deluxe Single Room", "price": 2500, "capacity": 2, "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", "description": "Cozy retreat with king bed, perfect for solo travelers seeking comfort.", "features": ["King Bed", "AC", "WiFi", "TV", "Room Service"] },
    { "id": "r2", "number": "102", "name": "Executive Double Room", "price": 4000, "capacity": 4, "image": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80", "description": "Spacious room with two queen beds, ideal for families or business travelers.", "features": ["2 Queen Beds", "AC", "WiFi", "Mini Bar", "Balcony"] },
    { "id": "r3", "number": "201", "name": "Presidential Suite", "price": 8000, "capacity": 6, "image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80", "description": "Ultimate luxury with master bedroom, living room, and stunning city views.", "features": ["Master Bedroom", "Living Room", "Jacuzzi", "Butler Service", "City View"] },
    { "id": "r4", "number": "202", "name": "Family Suite", "price": 6000, "capacity": 5, "image": "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80", "description": "Home away from home with two bedrooms, kitchen, and kids play area.", "features": ["2 Bedrooms", "Kitchen", "AC", "WiFi", "Kids Play Area"] }
  ],
  "halls": [
    { "id": "h1", "number": "A1", "name": "Conference Hall", "price": 15000, "capacity": 100, "image": "https://images.unsplash.com/photo-1596522354195-e84ae3c98731?w=800&q=80", "description": "Professional meeting space with advanced audiovisual equipment.", "features": ["Projector", "Sound System", "AC", "WiFi", "Whiteboard"] },
    { "id": "h2", "number": "B1", "name": "Banquet Hall", "price": 30000, "capacity": 300, "image": "https://media.weddingz.in/images/b93a141a3415c69778df991d25081c46/top-10-banquet-halls-in-delhi.jpg", "description": "Elegant venue for weddings and large celebrations with catering support.", "features": ["Stage", "Catering Service", "Decorations", "Parking", "Valet Service"] },
    { "id": "h3", "number": "C1", "name": "Party Hall", "price": 20000, "capacity": 150, "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80", "description": "High-energy party space with DJ setup and vibrant lighting.", "features": ["DJ Floor", "Bar Setup", "Dance Counter", "LED Lighting", "Lounge Area"] }
  ]
};

// Load data from embedded data (works without web server)
roomsData = hotelData.rooms;
hallsData = hotelData.halls;
initBookingsLoading();
renderRooms();
renderHalls();
renderBookingHistory();

// Get current logged-in user's email
function getCurrentUserEmail() {
    const savedUser = sessionStorage.getItem('hotelGuestUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.email;
    }
    return null;
}

// Load bookings from Firebase - filtered by logged-in user
function loadBookings() {
    const userEmail = getCurrentUserEmail();
    
    if (!window.firebaseServices) {
        console.log('Firebase not ready, using localStorage fallback');
        const savedBookings = localStorage.getItem('hotelBookings');
        if (savedBookings) {
            let allBookings = JSON.parse(savedBookings);
            // Filter by user email if logged in
            if (userEmail) {
                bookings = allBookings.filter(b => b.customerEmail === userEmail);
            } else {
                bookings = [];
            }
        }
        renderBookingHistory();
        return;
    }

    const { database, ref, onValue } = window.firebaseServices;
    const bookingsRef = ref(database, 'bookings');
    
    onValue(bookingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convert Firebase object to array
            let allBookings = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            
            // Filter by user email if logged in
            if (userEmail) {
                bookings = allBookings.filter(b => b.customerEmail === userEmail);
            } else {
                bookings = [];
            }
            
            // Sort by booking date descending
            bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        } else {
            bookings = [];
        }
        renderBookingHistory();
    });
}

// Save bookings to Firebase
function saveBookings() {
    if (!window.firebaseServices) {
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        return;
    }

    const { database, ref, set } = window.firebaseServices;
    // Save each booking individually to Firebase
    const bookingRef = ref(database, 'bookings/' + bookings[0].id);
    set(bookingRef, bookings[0]).then(() => {
        console.log('Booking saved to Firebase!');
    }).catch((error) => {
        console.error('Error saving booking to Firebase:', error);
        // Fallback to localStorage
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
    });
}

// Delete booking from Firebase
function deleteBookingFromFirebase(bookingId) {
    if (!window.firebaseServices) {
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        return Promise.resolve();
    }

    const { database, ref, remove } = window.firebaseServices;
    const bookingRef = ref(database, 'bookings/' + bookingId);
    return remove(bookingRef).then(() => {
        console.log('Booking deleted from Firebase!');
    }).catch((error) => {
        console.error('Error deleting booking from Firebase:', error);
        // Fallback to localStorage
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('hotelBookings', JSON.stringify(bookings));
    });
}

// Render rooms
function renderRooms() {
    const roomsGrid = document.getElementById('rooms-grid');
    if(!roomsGrid) return;
    roomsGrid.innerHTML = roomsData.map(room => `
        <div class="room-card" data-testid="room-card-${room.id}">
            <div class="card-image">
                <img src="${room.image}" alt="${room.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${room.name}</h3>
                    <div class="card-price">
                        ₹${room.price}
                        <span class="card-price-label">per night</span>
                    </div>
                </div>
                <p class="card-description">${room.description}</p>
                <div class="card-features">
                    ${room.features.map(feature => `
                        <span class="feature-tag">
                            <i class="fas fa-check"></i> ${feature}
                        </span>
                    `).join('')}
                    <span class="feature-tag">
                        <i class="fas fa-users"></i> ${room.capacity} Guests
                    </span>
                </div>
                <button class="btn btn-primary btn-full" onclick="openBookingModal('room', '${room.id}', '${room.name}', ${room.price})" data-testid="book-room-${room.id}-btn">
                    <i class="fas fa-calendar-check"></i> Book Now
                </button>
            </div>
        </div>
    `).join('');
}

// Render halls
function renderHalls() {
    const hallsGrid = document.getElementById('halls-grid');
    if(!hallsGrid) return;
    hallsGrid.innerHTML = hallsData.map(hall => `
        <div class="hall-card" data-testid="hall-card-${hall.id}">
            <div class="card-image">
                <img src="${hall.image}" alt="${hall.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-title">${hall.name}</h3>
                    <div class="card-price">
                        ₹${hall.price}
                        <span class="card-price-label">per day</span>
                    </div>
                </div>
                <p class="card-description">${hall.description}</p>
                <div class="card-features">
                    ${hall.features.map(feature => `
                        <span class="feature-tag">
                            <i class="fas fa-check"></i> ${feature}
                        </span>
                    `).join('')}
                    <span class="feature-tag">
                        <i class="fas fa-users"></i> Capacity: ${hall.capacity}
                    </span>
                </div>
                <button class="btn btn-primary btn-full" onclick="openBookingModal('hall', '${hall.id}', '${hall.name}', ${hall.price})" data-testid="book-hall-${hall.id}-btn">
                    <i class="fas fa-calendar-check"></i> Book Now
                </button>
            </div>
        </div>
    `).join('');
}

// Render booking history
function renderBookingHistory() {
    const bookingHistory = document.getElementById('booking-history');
    if(!bookingHistory) return;
    
    // Check if user is logged in
    const userEmail = getCurrentUserEmail();
    
    if (!userEmail) {
        bookingHistory.innerHTML = `
            <div class="empty-state" data-testid="login-required">
                <i class="fas fa-user-lock"></i>
                <h3>Login Required</h3>
                <p>Please login to view your bookings.</p>
            </div>
        `;
        return;
    }
    
    if (bookings.length === 0) {
        bookingHistory.innerHTML = `
            <div class="empty-state" data-testid="empty-bookings">
                <i class="fas fa-calendar-times"></i>
                <h3>No Bookings Yet</h3>
                <p>Start exploring our rooms and halls to make your first booking!</p>
            </div>
        `;
        return;
    }

    bookingHistory.innerHTML = bookings.map(booking => {
        const icon = booking.type === 'room' ? 'bed' : 'users';
        const nights = calculateNights(booking.checkIn, booking.checkOut);
        const durationUnit = booking.type === 'room' ? 'night(s)' : 'day(s)';
        const nightsText = `${nights} ${durationUnit}`;
        
        return `
            <div class="booking-card" data-testid="booking-card-${booking.id}">
                <div class="booking-header">
                    <div>
                        <h3 class="booking-title">
                            <i class="fas fa-${icon}"></i> ${booking.itemName}
                        </h3>
                        <span class="booking-id">Booking ID: ${booking.id}</span>
                    </div>
                    <span class="booking-status status-confirmed" data-testid="booking-status-${booking.id}">Confirmed</span>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <i class="fas fa-user"></i>
                        <div class="detail-content">
                            <span class="detail-label">Guest Name</span>
                            <span class="detail-value">${booking.customerName}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <div class="detail-content">
                            <span class="detail-label">Email</span>
                            <span class="detail-value">${booking.customerEmail}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <div class="detail-content">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value">${booking.customerPhone}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div class="detail-content">
                            <span class="detail-label">Check-in</span>
                            <span class="detail-value">${formatDate(booking.checkIn)}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div class="detail-content">
                            <span class="detail-label">Check-out</span>
                            <span class="detail-value">${formatDate(booking.checkOut)}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-users"></i>
                        <div class="detail-content">
                            <span class="detail-label">Guests</span>
                            <span class="detail-value">${booking.guests}</span>
                        </div>
                    </div>
                    ${booking.eventTime ? `
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <div class="detail-content">
                            <span class="detail-label">Event Time</span>
                            <span class="detail-value">${booking.eventTime}</span>
                        </div>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <i class="fas fa-moon"></i>
                        <div class="detail-content">
                            <span class="detail-label">Duration</span>
                            <span class="detail-value">${nightsText}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-footer">
                    <div class="booking-total">Rs. ${booking.totalAmount.toLocaleString('en-IN')}</div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" onclick="downloadBookingPDF('${booking.id}')" data-testid="download-booking-${booking.id}-btn">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                        <button class="btn btn-danger" onclick="cancelBooking('${booking.id}')" data-testid="cancel-booking-${booking.id}-btn">
                            <i class="fas fa-times"></i> Cancel Booking
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Open booking modal
function openBookingModal(type, itemId, itemName, price) {
    const modal = document.getElementById('booking-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('booking-form');
    const guestsGroup = document.getElementById('guests-group');
    const timeGroup = document.getElementById('time-group');
    const guestsInput = document.getElementById('guests');
    const guestsLabel = document.querySelector('label[for="guests"]');
    
    // REQUIRE LOGIN: block booking modal if user not signed in
    const currentUser = sessionStorage.getItem('hotelGuestUser');
    if (!currentUser) {
        showToast('Please login or register before booking', 'error');
        // open login modal to make it easy for user to sign in
        openLoginModal();
        return;
    }

    // Reset form
    form.reset();
    
    // Set booking details
    document.getElementById('booking-type').value = type;
    document.getElementById('booking-item-id').value = itemId;
    document.getElementById('booking-item-name').value = itemName;
    document.getElementById('booking-price').value = price;
    
    // Fill customer info from signed-in user
    const savedUser = JSON.parse(currentUser);
    document.getElementById('customer-name').value = savedUser.name || '';
    const emailInput = document.getElementById('customer-email');
    emailInput.value = savedUser.email || '';
    // lock email to the signed-in account to avoid mismatch
    emailInput.readOnly = true;

    // Update modal title
    modalTitle.textContent = `Book ${itemName}`;
    
    // Set Dynamic Guests Max Limit
    let selectedItem;
    if (type === 'room') {
        selectedItem = roomsData.find(r => r.id === itemId);
    } else {
        selectedItem = hallsData.find(h => h.id === itemId);
    }

    if (selectedItem) {
        guestsInput.max = selectedItem.capacity;
        guestsInput.value = Math.min(2, selectedItem.capacity);
        if (guestsLabel) {
            guestsLabel.textContent = `Number of Guests (Max: ${selectedItem.capacity})`;
        }
    } else {
        guestsInput.max = 300;
        if (guestsLabel) guestsLabel.textContent = 'Number of Guests';
    }
    
    // Show/hide fields based on type
    if (type === 'hall') {
        timeGroup.style.display = 'block';
        document.getElementById('event-time').required = true;
    } else {
        timeGroup.style.display = 'none';
        document.getElementById('event-time').required = false;
    }
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('check-in').min = today;
    document.getElementById('check-out').min = today;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Calculate total price
function calculateTotalPrice() {
    const checkIn = document.getElementById('check-in').value;
    const checkOut = document.getElementById('check-out').value;
    const price = parseFloat(document.getElementById('booking-price').value);
    
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        const total = price * nights;
        document.getElementById('total-price').textContent = `₹${total.toLocaleString('en-IN')}`;
        return total;
    }
    return 0;
}

// Calculate nights between dates
function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Handle booking form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('booking-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const totalAmount = calculateTotalPrice();
            
            // Validate dates
            const checkIn = formData.get('checkIn');
            const checkOut = formData.get('checkOut');
            
            if (new Date(checkOut) <= new Date(checkIn)) {
                showToast('Check-out date must be after check-in date', 'error');
                return;
            }

            // Validate Guest Capacity
            const guests = parseInt(formData.get('guests'));
            const itemId = formData.get('itemId');
            const type = formData.get('type');
            
            let item;
            if(type === 'room') item = roomsData.find(r => r.id === itemId);
            else item = hallsData.find(h => h.id === itemId);

            if (item && guests > item.capacity) {
                showToast(`Max capacity for this option is ${item.capacity} guests`, 'error');
                return;
            }
            
            // Create booking object
            const booking = {
                id: 'BK' + Date.now(),
                type: formData.get('type'),
                itemId: formData.get('itemId'),
                itemName: formData.get('itemName'),
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail'),
                customerPhone: formData.get('customerPhone'),
                checkIn: checkIn,
                checkOut: checkOut,
                guests: formData.get('guests'),
                eventTime: formData.get('eventTime') || null,
                totalAmount: totalAmount,
                bookingDate: new Date().toISOString()
            };
            
            // Save booking
            bookings.unshift(booking);
            saveBookings();
            
            // Close modal and show success
            closeBookingModal();
            showToast('Booking confirmed successfully!');
            
            // Update booking history
            renderBookingHistory();
            renderRooms();
            renderHalls();
            
            // Scroll to booking history
            setTimeout(() => {
                scrollToSection('history');
            }, 500);
        });
    }
    
    // Update price when dates change
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput) {
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(checkInDate.getDate() + 1);
            checkOutInput.min = nextDay.toISOString().split('T')[0];
            
            if(checkOutInput.value) calculateTotalPrice();
        });
    }
    
    if (checkOutInput) {
        checkOutInput.addEventListener('change', calculateTotalPrice);
    }
});

// Cancel booking
async function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        // Use the proper delete function that removes from Firebase
        await deleteBookingFromFirebase(bookingId);
        
        // Update local bookings array (already filtered in deleteBookingFromFirebase)
        bookings = bookings.filter(b => b.id !== bookingId);
        
        renderBookingHistory();
        renderRooms();
        renderHalls();
        showToast('Booking cancelled successfully');
    }
}

// Helper function to load image as base64 for PDF
function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        };
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
}

// Download single booking PDF
async function downloadBookingPDF(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const hotelName = "HOTEL GRAND PLAZA";
    const hotelAddress = "Hotel Grand Plaza, Ahmedabad";
    const hotelPhone = "+91 98765 43210";
    const hotelEmail = "hotelgrandplaza@gmail.com";

    // Add logo image to header (left side)
    try {
        const logoUrl = "Hotel Grand Plaza Logo.png";
        const logoImg = await loadImageAsBase64(logoUrl);
        doc.addImage(logoImg, 'PNG', 15, 8, 28, 28, undefined, 'FAST');
    } catch (e) {
        console.log("Could not load logo:", e);
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(hotelName, 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(hotelAddress, 105, 28, { align: "center" });
    doc.text("Phone: " + hotelPhone + " | Email: " + hotelEmail, 105, 34, { align: "center" });

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Confirmation Receipt", 105, 50, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Booking ID: " + booking.id, 20, 62);
    doc.text("Date: " + new Date().toLocaleDateString('en-IN'), 150, 62);

    // Booking details table
    const detailsData = [
        ['Guest Name', booking.customerName],
        ['Email', booking.customerEmail],
        ['Phone', booking.customerPhone],
        ['Booking Type', booking.type === 'room' ? 'Room' : 'Hall'],
        ['Item Name', booking.itemName],
        ['Check-In', formatDate(booking.checkIn)],
        ['Check-Out', formatDate(booking.checkOut)],
        ['Guests', booking.guests.toString()],
        ['Event Time', booking.eventTime || 'N/A'],
        ['Total Amount', 'Rs. ' + booking.totalAmount.toLocaleString('en-IN')]
    ];

    doc.autoTable({
        startY: 70,
        body: detailsData,
        theme: 'grid',
        headStyles: {
            fillColor: [184, 134, 11],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11
        },
        bodyStyles: {
            fontSize: 10
        },
        columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 130 }
        },
        margin: { left: 20, right: 20 }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for choosing Hotel Grand Plaza!", 105, finalY, { align: "center" });
    doc.text("For any queries, contact us at: " + hotelEmail, 105, finalY + 7, { align: "center" });

    doc.save("Booking_" + booking.id + ".pdf");
    showToast('PDF downloaded successfully');
}


// Show toast notification (supports 'success' or 'error')
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const iconEl = toast.querySelector('i');
    // ensure toast element is visible in layout before animation
    toast.style.display = 'flex';

    // reset variant classes
    toast.classList.remove('toast--error');

    // set message
    toastMessage.textContent = message;

    // set icon and variant
    if (type === 'error') {
        toast.classList.add('toast--error');
        if (iconEl) iconEl.className = 'fas fa-times-circle';
    } else {
        if (iconEl) iconEl.className = 'fas fa-check-circle';
    }

    // clear any existing hide timer
    if (window._hotel_toast_hide_timer) {
        clearTimeout(window._hotel_toast_hide_timer);
        window._hotel_toast_hide_timer = null;
    }

    // show
    toast.classList.add('show');

    // hide after timeout, then fully hide (display:none) after transition
    window._hotel_toast_hide_timer = setTimeout(() => {
        toast.classList.remove('show');
        // wait for CSS transition (0.3s) before removing from layout
        setTimeout(() => {
            // only hide if not shown again
            if (!toast.classList.contains('show')) {
                toast.style.display = 'none';
            }
        }, 350);
    }, 3000);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('booking-modal');
    if (event.target === modal) {
        closeBookingModal();
    }
});

// Simple local auth storage helpers and form handlers
function _getStoredUsers() {
    try { return JSON.parse(localStorage.getItem('hotelUsers') || '[]'); } catch (e) { return []; }
}

function _saveStoredUsers(users) {
    localStorage.setItem('hotelUsers', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim().toLowerCase();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-password-confirm').value;

            if (!name || !email || !password) return showToast('Please fill all fields', 'error');
            if (password !== confirm) return showToast('Passwords do not match', 'error');

            const users = _getStoredUsers();
            if (users.find(u => u.email === email)) return showToast('An account with this email already exists', 'error');

            users.push({ name: name, email: email, password: password });
            _saveStoredUsers(users);

            // Auto-login after register
            const userObj = { name: name, email: email };
            sessionStorage.setItem('hotelGuestUser', JSON.stringify(userObj));
            updateAuthUI(userObj);
            closeRegisterModal();
            showToast('Account created and logged in');
            
            // Reload bookings after login
            loadBookings();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            const users = _getStoredUsers();
            const found = users.find(u => u.email === email && u.password === password);
            if (!found) return showToast('Invalid email or password', 'error');

            const userObj = { name: found.name, email: found.email };
            sessionStorage.setItem('hotelGuestUser', JSON.stringify(userObj));
            updateAuthUI(userObj);
            closeLoginModal();
            showToast('Logged in successfully');
            
            // Reload bookings after login
            loadBookings();
        });
    }
});
