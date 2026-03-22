// =========================================
// AADHAAR VERIFICATION SYSTEM
// Opens in separate tab for proper Aadhaar verification
// =========================================

// Store Aadhaar verification session
let aadhaarVerificationSession = {
    sessionId: null,
    aadhaarNumber: null,
    verified: false,
    timestamp: null
};

// =========================================
// AADHAAR VERIFICATION FUNCTIONS
// =========================================

        // Handler for Aadhaar verification button click - Opens Aadhaar verification in new tab
        // Passes the mobile number to the verification page
        function handleAadhaarVerification() {
            // Get the mobile number from the booking form
            const mobileInput = document.getElementById('customer-phone');
            const mobileNumber = mobileInput ? mobileInput.value.trim() : '';
            
            // Open Aadhaar verification page with mobile number as URL parameter
            const url = mobileNumber ? `aadhaar-verify.html?mobile=${encodeURIComponent(mobileNumber)}` : 'aadhaar-verify.html';
            window.open(url, '_blank', 'width=500,height=700,scrollbars=yes');
        }

// Listen for messages from Aadhaar verification window
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'aadhaarVerified') {
        // Update verification session
        aadhaarVerificationSession = {
            sessionId: 'AADHAAR_' + Date.now(),
            aadhaarNumber: event.data.aadhaarNumber,
            verified: true,
            timestamp: Date.now()
        };
        
        // Update the main form's Aadhaar field
        const mainAadhaarInput = document.getElementById('customer-aadhaar');
        if (mainAadhaarInput) {
            mainAadhaarInput.value = event.data.aadhaarNumber;
        }
        
        // Update UI to show verified status
        updateAadhaarVerificationUI(true);
        
        showToast('Aadhaar verified successfully!', 'success');
    }
});

// Check for existing verification on page load
window.addEventListener('load', function() {
    checkAadhaarVerificationStatus();
});

// Check sessionStorage for existing verification
function checkAadhaarVerificationStatus() {
    const isVerified = sessionStorage.getItem('aadhaarVerified');
    const aadhaarNum = sessionStorage.getItem('aadhaarNumber');
    
    if (isVerified === 'true' && aadhaarNum) {
        aadhaarVerificationSession = {
            sessionId: 'AADHAAR_' + Date.now(),
            aadhaarNumber: aadhaarNum,
            verified: true,
            timestamp: Date.now()
        };
        
        // Update the main form's Aadhaar field if exists
        const mainAadhaarInput = document.getElementById('customer-aadhaar');
        if (mainAadhaarInput) {
            mainAadhaarInput.value = aadhaarNum;
        }
        
        // Update UI to show verified status
        updateAadhaarVerificationUI(true);
    }
}

// Update UI based on verification status
function updateAadhaarVerificationUI(verified) {
    const verifyBtn = document.getElementById('aadhaar-verify-btn');
    const aadhaarInput = document.getElementById('customer-aadhaar');
    const aadhaarOtpGroup = document.getElementById('aadhaar-otp-group');
    const aadhaarStatus = document.getElementById('aadhaar-verified-status');

    if (verified) {
        // Disable inputs and show verified badge
        if (aadhaarInput) {
            aadhaarInput.readOnly = true;
        }
        if (aadhaarOtpGroup) {
            aadhaarOtpGroup.style.display = 'none';
        }
        if (verifyBtn) {
            verifyBtn.style.display = 'none';
        }
        
        // Show verified status
        if (aadhaarStatus) {
            aadhaarStatus.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            aadhaarStatus.className = 'verification-status verified';
            aadhaarStatus.style.display = 'inline-flex';
        }
    } else {
        // Reset to unverified state
        if (aadhaarInput) {
            aadhaarInput.readOnly = false;
        }
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-id-card"></i> Verify Aadhaar';
        }
        
        // Hide verified status
        if (aadhaarStatus) {
            aadhaarStatus.style.display = 'none';
        }
    }
}

// Check if Aadhaar is verified
function isAadhaarVerified() {
    return aadhaarVerificationSession.verified;
}

// Reset Aadhaar verification when modal closes
function resetAadhaarVerification() {
    aadhaarVerificationSession = {
        sessionId: null,
        aadhaarNumber: null,
        verified: false,
        timestamp: null
    };
    
    const aadhaarInput = document.getElementById('customer-aadhaar');
    const aadhaarOtpGroup = document.getElementById('aadhaar-otp-group');
    const aadhaarStatus = document.getElementById('aadhaar-verified-status');
    const verifyBtn = document.getElementById('aadhaar-verify-btn');
    
    if (aadhaarInput) {
        aadhaarInput.value = '';
        aadhaarInput.readOnly = false;
    }
    if (aadhaarOtpGroup) {
        aadhaarOtpGroup.style.display = 'none';
    }
    if (aadhaarStatus) {
        aadhaarStatus.style.display = 'none';
    }
    if (verifyBtn) {
        verifyBtn.style.display = 'inline-flex';
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-id-card"></i> Verify Aadhaar';
    }
}



// =========================================
// 2FACTOR.IN OTP CONFIGURATION
// =========================================
const TWO_FACTOR_API_KEY = 'a5edc6be-16e6-11f1-bcb0-0200cd936042';

// Use your approved template name HOTEL_OTP for SMS delivery
const SMS_TEMPLATE = 'HOTEL_OTP';

// =========================================
// RAZORPAY CONFIGURATION (TEST MODE)
// =========================================
const RAZORPAY_KEY_ID = 'rzp_test_SO0Df2UY3GSGUw';
const RAZORPAY_KEY_SECRET = 'HYs8IkYkwdn2iO1N2XILiuPd';

// Store pending booking data for payment processing
let pendingBookingData = null;

// Store session IDs for OTP verification
let otpSessionStore = {
    register: { sessionId: null, mobile: null, timestamp: null },
    login: { sessionId: null, mobile: null, timestamp: null }
};

// =========================================
// LOCAL LOGIN & REGISTER AUTHENTICATION
// =========================================

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

// Flatpickr Calendar Instances (Global)
let checkInPicker, checkOutPicker;

// On load, restore session user if present + init calendars
document.addEventListener('DOMContentLoaded', () => {
    const savedUser = sessionStorage.getItem('hotelGuestUser');
    if (savedUser) updateAuthUI(JSON.parse(savedUser));

    // Hook up auth buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);
    if (registerBtn) registerBtn.addEventListener('click', openRegisterModal);

    // Initialize luxury flatpickr calendars after DOM ready
    if (typeof flatpickr !== 'undefined') {
        initLuxuryCalendars();
    } else {
        console.error('Flatpickr not loaded!');
        showToast('Calendar library failed to load. Refresh page.', 'error');
    }
});

// Initialize Modern Luxury Flatpickr Calendars
function initLuxuryCalendars() {
    console.log('Initializing Flatpickr calendars...');
    
    const today = new Date();
    
checkInPicker = flatpickr('#check-in', {
        inline: false,
        appendTo: document.body,
        position: 'below-left',
        theme: 'luxury',
        className: 'luxury-datepicker checkin',
        dateFormat: 'Y-m-d',
        minDate: 'today',
        locale: {
            firstDayOfWeek: 1 // Monday first
        },
        onChange: function(selectedDates, dateStr, instance) {
            console.log('Check-in changed:', dateStr);
            if (selectedDates[0]) {
                // Set check-out min to next day
                const nextDay = new Date(selectedDates[0]);
                nextDay.setDate(nextDay.getDate() + 1);
                if (checkOutPicker) {
                    checkOutPicker.set('minDate', nextDay);
                }
                calculateTotalPrice();
            }
        }
    });

checkOutPicker = flatpickr('#check-out', {
        inline: false,
        appendTo: document.body,
        position: 'below-left',
        theme: 'luxury',
        className: 'luxury-datepicker checkout',
        dateFormat: 'Y-m-d',
        minDate: new Date(today.getTime() + 24*60*60*1000), // Tomorrow
        locale: {
            firstDayOfWeek: 1 // Monday first
        },
        onChange: function(selectedDates, dateStr, instance) {
            console.log('Check-out changed:', dateStr);
            calculateTotalPrice();
        }
    });
    
    console.log('Flatpickr calendars initialized:', checkInPicker, checkOutPicker);
}

// Update openBookingModal to reset calendars
const originalOpenBookingModal = openBookingModal;
openBookingModal = function(type, itemId, itemName, price) {
    originalOpenBookingModal(type, itemId, itemName, price);
    
    // Reset calendars when modal opens
    setTimeout(() => {
        if (checkInPicker) {
            checkInPicker.clear();
            checkInPicker.set('minDate', 'today');
        }
        if (checkOutPicker) {
            checkOutPicker.clear();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            checkOutPicker.set('minDate', tomorrow);
        }
        document.getElementById('total-price').textContent = '₹0';
    }, 100);
};


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

// Get current logged-in user's mobile
function getCurrentUserMobile() {
    const savedUser = sessionStorage.getItem('hotelGuestUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.mobile;
    }
    return null;
}

// Load bookings from Firebase - filtered by logged-in user
function loadBookings() {
    const userMobile = getCurrentUserMobile();
    
    if (!window.firebaseServices) {
        console.log('Firebase not ready, using localStorage fallback');
        const savedBookings = localStorage.getItem('hotelBookings');
        if (savedBookings) {
            let allBookings = JSON.parse(savedBookings);
            // Filter by user mobile if logged in
            if (userMobile) {
                bookings = allBookings.filter(b => b.customerPhone === userMobile);
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
            
            // Filter by user mobile if logged in
            if (userMobile) {
                bookings = allBookings.filter(b => b.customerPhone === userMobile);
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
    const userMobile = getCurrentUserMobile();
    
    if (!userMobile) {
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
        
        // Determine booking status based on payment method
        let statusText = 'Confirmed';
        let statusClass = 'status-confirmed';
        if (booking.paymentMethod === 'Online Payment' || booking.paymentStatus === 'paid') {
            statusText = 'Paid';
            statusClass = 'status-paid';
        } else if (booking.paymentMethod === 'Pay At Hotel' || booking.paymentStatus === 'pay_at_hotel') {
            statusText = 'Confirmed';
            statusClass = 'status-confirmed';
        }
        
        return `
            <div class="booking-card" data-testid="booking-card-${booking.id}">
                <div class="booking-header">
                    <div>
                        <h3 class="booking-title">
                            <i class="fas fa-${icon}"></i> ${booking.itemName}
                        </h3>
                        <span class="booking-id">Booking ID: ${booking.id}</span>
                    </div>
                    <span class="booking-status ${statusClass}" data-testid="booking-status-${booking.id}">${statusText}</span>
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
                            <span class="detail-value">${booking.customerEmail || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <div class="detail-content">
                            <span class="detail-label">Mobile</span>
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
    const phoneInput = document.getElementById('customer-phone');
    phoneInput.value = savedUser.mobile || '';
    // lock phone to the signed-in account to avoid mismatch
    phoneInput.readOnly = true;

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
    
    // Reset Aadhaar verification when modal closes
    resetAadhaarVerification();
}

// Calculate total price
function calculateTotalPrice() {
    const checkInEl = document.getElementById('check-in');
    const checkOutEl = document.getElementById('check-out');
    const checkIn = checkInEl ? checkInEl.value : '';
    const checkOut = checkOutEl ? checkOutEl.value : '';
    const price = parseFloat(document.getElementById('booking-price').value);
    
    if (checkIn && checkOut) {
        const nights = calculateNights(checkIn, checkOut);
        const total = price * nights;
        const totalEl = document.getElementById('total-price');
        if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
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
    console.log('Loading logo from:', url);
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            console.log('Logo loaded successfully, dimensions:', img.width + 'x' + img.height);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png', 0.9);
            console.log('Base64 data length:', dataUrl.length);
            resolve(dataUrl);
        };
        img.onerror = function(e) {
            console.error('Logo load failed:', e, 'URL:', url);
            reject(new Error('Failed to load logo image: ' + url));
        };
        img.src = url + '?t=' + Date.now(); // Cache bust
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

    // Add logo image to header (upper left corner near hotel details)
    try {
        const logoUrl = "Hotel Grand Plaza Logo.png";
        const logoImg = await loadImageAsBase64(logoUrl);
        doc.addImage(logoImg, 'PNG', 15, 8, 30, 30, undefined, 'SLOW');
        console.log('Logo added to PDF successfully');
    } catch (e) {
        console.error('Failed to add logo to PDF:', e);
        // Fallback: Add text logo
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(212, 175, 55);
        doc.text("HOTEL GRAND", 15, 20);
        doc.setFontSize(8);
        doc.text("PLAZA", 15, 28);
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

// Determine payment status for PDF
        let paymentStatusText = 'Pending';
        if (booking.paymentMethod === 'Online Payment' || booking.paymentStatus === 'paid') {
            paymentStatusText = 'Paid';
        } else if (booking.paymentMethod === 'Pay At Hotel' || booking.paymentStatus === 'pay_at_hotel') {
            paymentStatusText = 'Pending';
        }
    
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
        ['Payment Status', paymentStatusText],
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

// =========================================
// 2FACTOR.IN OTP FUNCTIONS
// =========================================

// Helper function to send OTP via SMS (not voice)
// Uses the explicit SMS endpoint with empty template for guaranteed SMS delivery
async function sendOTPViaSMS(phoneNumber) {
    try {
        // Use empty template '' to ensure SMS delivery (no voice)
        // The 2factor.in API will send OTP via SMS only
        const response = await fetch(`https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${phoneNumber}/AUTOGEN/${SMS_TEMPLATE}`);
        const data = await response.json();
        console.log('2Factor SMS API Response:', data);
        return data;
    } catch (error) {
        console.error('Error sending SMS OTP:', error);
        throw error;
    }
}

// Send OTP via 2factor.in for Registration
async function sendRegisterOTP() {
    const mobileInput = document.getElementById('register-mobile');
    const mobile = mobileInput.value.trim();
    const otpBtn = document.getElementById('register-otp-btn');
    
    // Validate mobile number (add +91 for India)
    if (!mobile || mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Format phone number with country code
    const phoneNumber = '+91' + mobile;
    
    // Disable button and show loading state
    otpBtn.disabled = true;
    otpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending SMS...';
    
    try {
        // Call 2factor.in API to send OTP via SMS (explicitly SMS, not voice)
        const data = await sendOTPViaSMS(phoneNumber);
        
        console.log('2Factor API Response:', data);
        
        if (data.Status === 'Success') {
            // Store session ID for verification
            otpSessionStore.register = {
                sessionId: data.Details,
                mobile: mobile,
                timestamp: Date.now()
            };
            
            // Show OTP input field
            document.getElementById('register-otp-group').style.display = 'block';
            document.getElementById('register-otp').required = true;
            
            // Disable the mobile input
            mobileInput.disabled = true;
            otpBtn.textContent = 'OTP Sent (SMS)';
            
            showToast('OTP sent via SMS to ' + phoneNumber, 'success');
        } else {
            // Show error
            otpBtn.disabled = false;
            otpBtn.textContent = 'Send OTP';
            showToast('Failed to send OTP: ' + (data.Details || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        otpBtn.disabled = false;
        otpBtn.textContent = 'Send OTP';
        showToast('Error sending OTP. Please try again.', 'error');
    }
}

// Send OTP via 2factor.in for Login
async function sendLoginOTP() {
    const mobileInput = document.getElementById('login-mobile');
    const mobile = mobileInput.value.trim();
    const otpBtn = document.getElementById('login-otp-btn');
    
    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Check if user exists
    const users = _getStoredUsers();
    const userExists = users.find(u => u.mobile === mobile);
    
    if (!userExists) {
        showToast('Mobile number not registered. Please register first.', 'error');
        return;
    }
    
    // Format phone number with country code
    const phoneNumber = '+91' + mobile;
    
    // Disable button and show loading state
    otpBtn.disabled = true;
    otpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending SMS...';
    
    try {
        // Call 2factor.in API to send OTP via SMS (explicitly SMS, not voice)
        const data = await sendOTPViaSMS(phoneNumber);
        
        console.log('2Factor API Response:', data);
        
        if (data.Status === 'Success') {
            // Store session ID for verification
            otpSessionStore.login = {
                sessionId: data.Details,
                mobile: mobile,
                timestamp: Date.now()
            };
            
            // Show OTP input field
            document.getElementById('login-otp-group').style.display = 'block';
            document.getElementById('login-otp').required = true;
            
            // Disable the mobile input
            mobileInput.disabled = true;
            otpBtn.textContent = 'OTP Sent (SMS)';
            
            showToast('OTP sent via SMS to ' + phoneNumber, 'success');
        } else {
            // Show error
            otpBtn.disabled = false;
            otpBtn.textContent = 'Send OTP';
            showToast('Failed to send OTP: ' + (data.Details || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        otpBtn.disabled = false;
        otpBtn.textContent = 'Send OTP';
        showToast('Error sending OTP. Please try again.', 'error');
    }
}

// Verify OTP via 2factor.in API
async function verifyOTP(sessionStore, otp) {
    if (!sessionStore.sessionId) {
        return { success: false, message: 'No OTP session found. Please request a new OTP.' };
    }
    
    try {
        // Call 2factor.in API to verify OTP
        const response = await fetch(`https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionStore.sessionId}/${otp}`);
        const data = await response.json();
        
        console.log('2Factor Verify Response:', data);
        
        if (data.Status === 'Success') {
            return { success: true, message: 'OTP verified successfully' };
        } else {
            return { success: false, message: data.Details || 'Invalid OTP' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, message: 'Error verifying OTP. Please try again.' };
    }
}

// Resend OTP for Login with countdown timer
let loginResendTimer = null;
async function resendLoginOTP() {
    const mobileInput = document.getElementById('login-mobile');
    const mobile = mobileInput.value.trim();
    const resendBtn = document.getElementById('login-resend-btn');
    
    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Check if user exists
    const users = _getStoredUsers();
    const userExists = users.find(u => u.mobile === mobile);
    
    if (!userExists) {
        showToast('Mobile number not registered. Please register first.', 'error');
        return;
    }
    
    // Format phone number with country code
    const phoneNumber = '+91' + mobile;
    
    // Disable resend button and show loading
    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending SMS...';
    
    try {
        // Call 2factor.in API to send OTP via SMS (explicitly SMS, not voice)
        const data = await sendOTPViaSMS(phoneNumber);
        
        console.log('2Factor API Response:', data);
        
        if (data.Status === 'Success') {
            // Store session ID for verification
            otpSessionStore.login = {
                sessionId: data.Details,
                mobile: mobile,
                timestamp: Date.now()
            };
            
            showToast('OTP resent via SMS to ' + phoneNumber, 'success');
            
            // Start countdown timer (30 seconds)
            let countdown = 30;
            resendBtn.textContent = `Resend in ${countdown}s`;
            
            if (loginResendTimer) clearInterval(loginResendTimer);
            
            loginResendTimer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    resendBtn.textContent = `Resend in ${countdown}s`;
                } else {
                    clearInterval(loginResendTimer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend OTP';
                }
            }, 1000);
        } else {
            // Show error
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
            showToast('Failed to resend OTP: ' + (data.Details || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
        showToast('Error resending OTP. Please try again.', 'error');
    }
}

// Resend OTP for Register with countdown timer
let registerResendTimer = null;
async function resendRegisterOTP() {
    const mobileInput = document.getElementById('register-mobile');
    const mobile = mobileInput.value.trim();
    const resendBtn = document.getElementById('register-resend-btn');
    
    // Validate mobile number
    if (!mobile || mobile.length !== 10) {
        showToast('Please enter a valid 10-digit mobile number', 'error');
        return;
    }
    
    // Format phone number with country code
    const phoneNumber = '+91' + mobile;
    
    // Disable resend button and show loading
    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending SMS...';
    
    try {
        // Call 2factor.in API to send OTP via SMS (explicitly SMS, not voice)
        const data = await sendOTPViaSMS(phoneNumber);
        
        console.log('2Factor API Response:', data);
        
        if (data.Status === 'Success') {
            // Store session ID for verification
            otpSessionStore.register = {
                sessionId: data.Details,
                mobile: mobile,
                timestamp: Date.now()
            };
            
            showToast('OTP resent via SMS to ' + phoneNumber, 'success');
            
            // Start countdown timer (30 seconds)
            let countdown = 30;
            resendBtn.textContent = `Resend in ${countdown}s`;
            
            if (registerResendTimer) clearInterval(registerResendTimer);
            
            registerResendTimer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    resendBtn.textContent = `Resend in ${countdown}s`;
                } else {
                    clearInterval(registerResendTimer);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend OTP';
                }
            }, 1000);
        } else {
            // Show error
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
            showToast('Failed to resend OTP: ' + (data.Details || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
        showToast('Error resending OTP. Please try again.', 'error');
    }
}

// Reset OTP fields when modal is closed
function resetLoginModal() {
    document.getElementById('login-form').reset();
    document.getElementById('login-otp-group').style.display = 'none';
    document.getElementById('login-mobile').disabled = false;
    document.getElementById('login-otp-btn').disabled = false;
    document.getElementById('login-otp-btn').textContent = 'Send OTP';
    // Reset resend button
    const resendBtn = document.getElementById('login-resend-btn');
    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
    // Clear session store
    otpSessionStore.login = { sessionId: null, mobile: null, timestamp: null };
}

function resetRegisterModal() {
    document.getElementById('register-form').reset();
    document.getElementById('register-otp-group').style.display = 'none';
    document.getElementById('register-mobile').disabled = false;
    document.getElementById('register-otp-btn').disabled = false;
    document.getElementById('register-otp-btn').textContent = 'Send OTP';
    // Reset resend button
    const resendBtn = document.getElementById('register-resend-btn');
    if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
    }
    // Clear session store
    otpSessionStore.register = { sessionId: null, mobile: null, timestamp: null };
}

// Override modal close functions to reset OTP fields
const originalCloseLoginModal = closeLoginModal;
closeLoginModal = function() {
    originalCloseLoginModal();
    resetLoginModal();
};

const originalCloseRegisterModal = closeRegisterModal;
closeRegisterModal = function() {
    originalCloseRegisterModal();
    resetRegisterModal();
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const mobile = document.getElementById('register-mobile').value.trim();
            const otp = document.getElementById('register-otp').value.trim();

            if (!name || !mobile) return showToast('Please fill all fields', 'error');
            
            // Check if OTP session exists
            if (!otpSessionStore.register.sessionId) {
                showToast('Please click Send OTP first', 'error');
                return;
            }
            
            // Verify OTP
            if (!otp || otp.length !== 6) {
                showToast('Please enter valid 6-digit OTP', 'error');
                return;
            }

            // Show loading state on submit button
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            
            // Verify OTP via 2factor.in API
            const verificationResult = await verifyOTP(otpSessionStore.register, otp);
            
            if (!verificationResult.success) {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                showToast(verificationResult.message, 'error');
                return;
            }

            // OTP verified - create user account
            const users = _getStoredUsers();
            if (users.find(u => u.mobile === mobile)) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                showToast('An account with this mobile number already exists', 'error');
                return;
            }

            users.push({ name: name, mobile: mobile });
            _saveStoredUsers(users);

            // Auto-login after register
            const userObj = { name: name, mobile: mobile };
            sessionStorage.setItem('hotelGuestUser', JSON.stringify(userObj));
            updateAuthUI(userObj);
            closeRegisterModal();
            resetRegisterModal();
            showToast('Account created and logged in');
            
            // Reload bookings after login
            loadBookings();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const mobile = document.getElementById('login-mobile').value.trim();
            const otp = document.getElementById('login-otp').value.trim();

            if (!mobile) return showToast('Please enter mobile number', 'error');
            
            // Check if OTP session exists
            if (!otpSessionStore.login.sessionId) {
                showToast('Please click Send OTP first', 'error');
                return;
            }
            
            // Verify OTP
            if (!otp || otp.length !== 6) {
                showToast('Please enter valid 6-digit OTP', 'error');
                return;
            }

            // Show loading state on submit button
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            
            // Verify OTP via 2factor.in API
            const verificationResult = await verifyOTP(otpSessionStore.login, otp);
            
            if (!verificationResult.success) {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                showToast(verificationResult.message, 'error');
                return;
            }

            // OTP verified - check user exists
            const users = _getStoredUsers();
            const found = users.find(u => u.mobile === mobile);
            if (!found) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                return showToast('Mobile number not registered', 'error');
            }

            const userObj = { name: found.name, mobile: found.mobile };
            sessionStorage.setItem('hotelGuestUser', JSON.stringify(userObj));
            updateAuthUI(userObj);
            closeLoginModal();
            resetLoginModal();
            showToast('Logged in successfully');
            
            // Reload bookings after login
            loadBookings();
        });
    }
});

// =========================================
// PAYMENT HANDLING FUNCTIONS
// =========================================

// Validate booking form and get booking data
function validateAndGetBookingData() {
    const form = document.getElementById('booking-form');
    const formData = new FormData(form);
    const totalAmount = calculateTotalPrice();
    
    // Validate dates
    const checkIn = formData.get('checkIn');
    const checkOut = formData.get('checkOut');
    
    if (new Date(checkOut) <= new Date(checkIn)) {
        showToast('Check-out date must be after check-in date', 'error');
        return null;
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
        return null;
    }
    
    // Validate required fields
    if (!formData.get('customerName') || !formData.get('customerEmail') || !formData.get('customerPhone')) {
        showToast('Please fill all required fields', 'error');
        return null;
    }

    // Create and return booking object
    return {
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
        bookingDate: new Date().toISOString(),
        paymentStatus: 'pending',
        paymentMethod: null
    };
}

// Handle "Pay At Hotel" button click
function handlePayAtHotel() {
    // Check if Aadhaar is verified first
    if (!isAadhaarVerified()) {
        showToast('Please verify your Aadhaar before booking', 'error');
        return;
    }
    
    const bookingData = validateAndGetBookingData();
    
    if (!bookingData) {
        return; // Validation failed
    }
    
    // Set payment method
    bookingData.paymentStatus = 'pay_at_hotel';
    bookingData.paymentMethod = 'Pay At Hotel';
    
    // Save booking
    bookings.unshift(bookingData);
    saveBookings();
    
    // Close modal and show success
    closeBookingModal();
    showToast('Booking confirmed! Pay at hotel during check-in.');
    
    // Update booking history
    renderBookingHistory();
    renderRooms();
    renderHalls();
    
    // Scroll to booking history
    setTimeout(() => {
        scrollToSection('history');
    }, 500);
}

// Handle "Pay Online" button click - Opens Razorpay
function handlePayOnline() {
    // Check if Aadhaar is verified first
    if (!isAadhaarVerified()) {
        showToast('Please verify your Aadhaar before booking', 'error');
        return;
    }
    
    const bookingData = validateAndGetBookingData();
    
    if (!bookingData) {
        return; // Validation failed
    }
    
    // Store pending booking data
    pendingBookingData = bookingData;
    
    // Convert amount to paise (Razorpay expects amount in paise)
    const amountInPaise = Math.round(bookingData.totalAmount * 100);
    
    // Create Razorpay order
    // Note: In production, you should create the order on server-side for security
    // For test mode, we'll use the Razorpay Checkout
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Hotel Grand Plaza',
        description: `Booking for ${bookingData.itemName}`,
        image: 'Hotel Grand Plaza Logo.png',
        handler: function(response) {
            // Payment successful
            handlePaymentSuccess(response, bookingData);
        },
        prefill: {
            name: bookingData.customerName,
            email: bookingData.customerEmail,
            contact: bookingData.customerPhone
        },
        notes: {
            booking_id: bookingData.id,
            item_name: bookingData.itemName
        },
        theme: {
            color: '#D4AF37'
        }
    };
    
    // Open Razorpay checkout
    const rzp1 = new Razorpay(options);
    
    rzp1.on('payment.failed', function(response) {
        // Payment failed
        showToast('Payment failed. Please try again.', 'error');
        console.error('Payment failed:', response.error);
    });
    
    rzp1.open();
}

// Handle successful payment
function handlePaymentSuccess(paymentResponse, bookingData) {
    // Update booking with payment details
    bookingData.paymentStatus = 'paid';
    bookingData.paymentMethod = 'Online Payment';
    bookingData.paymentId = paymentResponse.razorpay_payment_id;
    bookingData.paymentDate = new Date().toISOString();
    
    // Save booking
    bookings.unshift(bookingData);
    saveBookings();
    
    // Close modal and show success
    closeBookingModal();
    showToast('Payment successful! Booking confirmed.');
    
    // Update booking history
    renderBookingHistory();
    renderRooms();
    renderHalls();
    
    // Scroll to booking history
    setTimeout(() => {
        scrollToSection('history');
    }, 500);
}



