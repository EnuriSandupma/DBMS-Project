// CineBook - Movie Booking System
// Frontend JavaScript with PHP API integration

const API_BASE = 'api';

let currentUser = null;
let movies = [];
let showtimes = [];
let selectedMovie = null;
let selectedShowtime = null;
let selectedSeats = [];
let seatData = [];
let bookedSeats = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadMovies();
});

// API Helper
async function api(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        ...options
    };
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    const response = await fetch(url, config);
    return response.json();
}

// Check session on page load
async function checkSession() {
    const result = await api('auth.php?action=session');
    if (result.logged_in) {
        currentUser = result.user;
        updateNavigation();
    }
}

// Page Navigation
function showPage(pageName) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(pageName + 'Page').classList.add('active');

    if (pageName === 'movies' || pageName === 'home') {
        loadMovies();
    } else if (pageName === 'myBookings') {
        loadMyBookings();
    } else if (pageName === 'admin') {
        loadAdminData();
    }
}

// Load Movies from API
async function loadMovies() {
    const result = await api('movies.php');
    if (result.success) {
        movies = result.movies.map(m => ({
            id: m.Movie_ID,
            title: m.Title,
            genre: m.Genre,
            duration: m.Duration_time,
            language: m.Movie_Language,
            release_date: m.Release_date,
            description: m.Description || `A ${m.Genre} movie in ${m.Movie_Language}`,
            rating: m.Rating || (Math.random() * 2 + 3).toFixed(1)
        }));
        renderMovies();
    }
}

function renderMovies() {
    const homeContainer = document.getElementById('homeMoviesList');
    const moviesContainer = document.getElementById('moviesList');

    let html = '';
    movies.forEach(movie => {
        html += `
            <div class="col-md-4">
                <div class="movie-card" onclick="selectMovie(${movie.id})">
                    <div class="movie-poster">
                        <i class="fas fa-film"></i>
                    </div>
                    <div class="movie-card-body">
                        <h5 class="movie-title">${movie.title}</h5>
                        <div class="movie-meta">
                            <span><i class="fas fa-tag"></i> ${movie.genre}</span>
                            <span><i class="fas fa-clock"></i> ${movie.duration} min</span>
                            <span class="rating"><i class="fas fa-star"></i> ${movie.rating}</span>
                        </div>
                        <p>${movie.description}</p>
                        <button class="btn btn-primary w-100">Book Now</button>
                    </div>
                </div>
            </div>
        `;
    });

    if (homeContainer) homeContainer.innerHTML = html || '<p>No movies available</p>';
    if (moviesContainer) moviesContainer.innerHTML = html || '<p>No movies available</p>';
}

// Select Movie and Show Booking Page
async function selectMovie(movieId) {
    selectedMovie = movies.find(m => m.id == movieId);
    if (!selectedMovie) return;

    showPage('booking');

    document.getElementById('movieDetails').innerHTML = `
        <div class="movie-card">
            <div class="movie-poster">
                <i class="fas fa-film"></i>
            </div>
            <div class="movie-card-body">
                <h3>${selectedMovie.title}</h3>
                <div class="movie-meta">
                    <span><i class="fas fa-tag"></i> ${selectedMovie.genre}</span>
                    <span><i class="fas fa-clock"></i> ${selectedMovie.duration} min</span>
                    <span><i class="fas fa-language"></i> ${selectedMovie.language}</span>
                    <span class="rating"><i class="fas fa-star"></i> ${selectedMovie.rating}</span>
                </div>
                <p class="mt-3">${selectedMovie.description}</p>
            </div>
        </div>
    `;

    document.getElementById('summaryMovie').textContent = selectedMovie.title;
    await loadShowtimes();
    resetBooking();
}

// Load Showtimes from API
async function loadShowtimes() {
    const result = await api(`showtimes.php?movieId=${selectedMovie.id}`);
    if (result.success) {
        showtimes = result.showtimes.map(s => ({
            id: s.Showtime_ID,
            movie_id: s.Movie_ID,
            show_date: s.Show_Date,
            start_time: s.Start_time,
            end_time: s.End_time,
            hall_id: s.Hall_ID,
            price: 1000 // Default price
        }));

        let html = '';
        showtimes.forEach(showtime => {
            html += `
                <button class="showtime-btn" onclick="selectShowtime(${showtime.id})">
                    <div><i class="fas fa-calendar"></i> ${showtime.show_date}</div>
                    <div><i class="fas fa-clock"></i> ${showtime.start_time} - ${showtime.end_time}</div>
                </button>
            `;
        });

        document.getElementById('showtimesList').innerHTML = html || '<p>No showtimes available</p>';
    }
}

// Select Showtime and Load Seats
async function selectShowtime(showtimeId) {
    selectedShowtime = showtimes.find(s => s.id == showtimeId);

    document.querySelectorAll('.showtime-btn').forEach(btn => btn.classList.remove('active'));
    // Find the clicked button by matching showtime id
    const clickedBtn = document.querySelector(`.showtime-btn[onclick*="${showtimeId}"]`);
    if (clickedBtn) clickedBtn.classList.add('active');

    document.getElementById('summaryShowtime').textContent =
        `${selectedShowtime.show_date} ${selectedShowtime.start_time}`;

    document.getElementById('seatSelectionSection').style.display = 'block';
    await generateSeats();
}

// Generate Seats from API
async function generateSeats() {
    const result = await api(`seats.php?showtimeId=${selectedShowtime.id}`);
    if (!result.success) {
        document.getElementById('seatsContainer').innerHTML = '<p>Error loading seats</p>';
        return;
    }

    seatData = result.seats;
    const bookedSeatIds = result.bookedSeats;
    const rows = ['A', 'B', 'C', 'D', 'E'];  // Match database seats

    // Price will be determined per seat from the API based on seat type

    let html = '';
    rows.forEach(row => {
        html += `<div class="seat-row"><div class="row-label">${row}</div>`;

        for (let i = 1; i <= 10; i++) {
            const seatNo = `${row}${i}`;
            const seat = seatData.find(s => s.Seat_No === seatNo);
            const isBooked = seat ? bookedSeatIds.includes(seat.Seat_ID) : false;
            const bookedClass = isBooked ? 'booked' : '';
            const seatType = seat?.Seat_type || 'Standard';
            const seatPrice = seat?.Price || (seatType === 'Premium' ? 1500 : 1000);
            const premiumClass = seatType === 'Premium' ? 'premium' : '';

            html += `<div class="seat ${bookedClass} ${premiumClass}" 
                data-seat-id="${seat?.Seat_ID || ''}" 
                data-seat-no="${seatNo}"
                data-seat-type="${seatType}"
                data-price="${seatPrice}"
                onclick="toggleSeat('${seatNo}', ${isBooked})" title="${seatType} - LKR ${seatPrice}"></div>`;
        }


        html += '</div>';
    });

    document.getElementById('seatsContainer').innerHTML = html;
    selectedSeats = [];
    updateBookingSummary();
}

// Toggle Seat Selection
function toggleSeat(seatNo, isBooked) {
    if (isBooked) return;

    const seatElement = document.querySelector(`[data-seat-no="${seatNo}"]`);
    const seatId = seatElement.dataset.seatId;
    const price = parseFloat(seatElement.dataset.price) || 1000; // Default to 1000 if NaN

    // Validate price is a valid number
    if (isNaN(price)) {
        console.error('Invalid price for seat:', seatNo);
        return;
    }

    const existingIndex = selectedSeats.findIndex(s => s.seatNo === seatNo);

    if (existingIndex >= 0) {
        selectedSeats.splice(existingIndex, 1);
        seatElement.classList.remove('selected');
    } else {
        selectedSeats.push({ seatNo, seatId, price });
        seatElement.classList.add('selected');
    }

    updateBookingSummary();
}

// Update Booking Summary
function updateBookingSummary() {
    const ticketCount = selectedSeats.length;
    const total = selectedSeats.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);

    document.getElementById('summarySeats').textContent =
        ticketCount > 0 ? selectedSeats.map(s => s.seatNo).join(', ') : '-';
    document.getElementById('summaryTickets').textContent = ticketCount;
    document.getElementById('summaryTotal').textContent = `LKR ${total.toLocaleString()}`;

    document.getElementById('confirmBookingBtn').disabled = ticketCount === 0;
}

// Confirm Booking
async function confirmBooking() {
    if (!currentUser) {
        alert('Please login to continue booking');
        showPage('login');
        return;
    }

    if (selectedSeats.length === 0) {
        alert('Please select at least one seat');
        return;
    }

    const total = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    const result = await api('bookings.php', {
        method: 'POST',
        body: {
            customerId: currentUser.id,
            showtimeId: selectedShowtime.id,
            seats: selectedSeats.map(s => parseInt(s.seatId)),
            totalAmount: total
        }
    });

    if (result.success) {
        alert(`Booking Confirmed! Your booking ID is: ${result.bookingId}\nTotal: LKR ${total}`);
        resetBooking();
        showPage('myBookings');
    } else {
        alert('Booking failed: ' + result.message);
    }
}

// Reset Booking
function resetBooking() {
    selectedSeats = [];
    selectedShowtime = null;
    document.getElementById('seatSelectionSection').style.display = 'none';
    document.getElementById('summaryShowtime').textContent = '-';
    document.getElementById('summarySeats').textContent = '-';
    document.getElementById('summaryTickets').textContent = '0';
    document.getElementById('summaryTotal').textContent = 'LKR 0';

    document.querySelectorAll('.showtime-btn').forEach(btn => btn.classList.remove('active'));
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const isAdmin = document.getElementById('loginAsAdmin').checked;

    const result = await api('auth.php', {
        method: 'POST',
        body: {
            action: 'login',
            email: email,
            password: password,
            isAdmin: isAdmin
        }
    });

    const messageDiv = document.getElementById('loginMessage');

    if (result.success) {
        currentUser = result.user;
        updateNavigation();
        messageDiv.innerHTML = `<div class="alert alert-success">Login successful! Redirecting...</div>`;

        setTimeout(() => {
            showPage('home');
            document.getElementById('loginForm').reset();
            messageDiv.innerHTML = '';
        }, 1500);
    } else {
        messageDiv.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();

    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const nic = document.getElementById('registerNIC').value;
    const email = document.getElementById('registerEmail').value;
    const contact = document.getElementById('registerContact').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const result = await api('auth.php', {
        method: 'POST',
        body: {
            action: 'register',
            firstName: firstName,
            lastName: lastName,
            nic: nic,
            email: email,
            contact: contact,
            password: password
        }
    });

    if (result.success) {
        alert('Registration successful! Please login.');
        document.getElementById('registerForm').reset();
        showPage('login');
    } else {
        alert('Registration failed: ' + result.message);
    }
}

// Update Navigation
function updateNavigation() {
    if (currentUser) {
        document.getElementById('loginNav').style.display = 'none';
        document.getElementById('registerNav').style.display = 'none';
        document.getElementById('logoutNav').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.firstName;

        if (currentUser.isAdmin) {
            document.getElementById('adminNav').style.display = 'block';
            document.getElementById('myBookingsNav').style.display = 'none';
        } else {
            document.getElementById('myBookingsNav').style.display = 'block';
            document.getElementById('adminNav').style.display = 'none';
        }
    } else {
        document.getElementById('loginNav').style.display = 'block';
        document.getElementById('registerNav').style.display = 'block';
        document.getElementById('logoutNav').style.display = 'none';
        document.getElementById('myBookingsNav').style.display = 'none';
        document.getElementById('adminNav').style.display = 'none';
    }
}

// Logout
async function logout() {
    await api('auth.php?action=logout', { method: 'POST' });
    currentUser = null;
    updateNavigation();
    showPage('home');
    alert('Logged out successfully!');
}

// Load My Bookings
async function loadMyBookings() {
    if (!currentUser) {
        alert('Please login to view bookings');
        showPage('login');
        return;
    }

    const result = await api(`bookings.php?customerId=${currentUser.id}`);

    let html = '';
    if (!result.success || !result.bookings || result.bookings.length === 0) {
        html = '<div class="admin-card"><p class="text-center">No bookings found</p></div>';
    } else {
        result.bookings.forEach(booking => {
            html += `
                <div class="admin-card">
                    <div class="row">
                        <div class="col-md-8">
                            <h5>${booking.Movie_Title || 'N/A'}</h5>
                            <p><i class="fas fa-calendar"></i> ${booking.Show_Date || 'N/A'} ${booking.Start_time || ''}</p>
                            <p><i class="fas fa-chair"></i> Seats: ${booking.Seats || 'N/A'}</p>
                            <p><strong>Status: </strong><span class="badge bg-success">${booking.Booking_Status || 'Pending'}</span></p>
                        </div>
                        <div class="col-md-4 text-end">
                            <h4 class="text-danger">LKR ${(parseFloat(booking.Total_Amount) || 0).toLocaleString()}</h4>
                            <p class="text-muted">Booking ID: ${booking.Booking_ID}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('bookingsList').innerHTML = html;
}

// Admin Functions
function showAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => tab.style.display = 'none');
    document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).style.display = 'block';

    document.querySelectorAll('#adminTabs .nav-link').forEach(link => link.classList.remove('active'));
    // Find the correct tab link by matching the tabName
    const activeLink = document.querySelector(`#adminTabs .nav-link[onclick*="'${tabName}'"]`);
    if (activeLink) activeLink.classList.add('active');
}

async function loadAdminData() {
    await loadAdminStats();
    await loadAdminMovies();
    await loadAdminShowtimes();
    await loadAdminBookings();
}

async function loadAdminStats() {
    const result = await api('bookings.php?action=stats');
    if (result.success && result.stats) {
        document.getElementById('totalMovies').textContent = result.stats.totalMovies || 0;
        document.getElementById('totalBookings').textContent = result.stats.totalBookings || 0;
        document.getElementById('totalCustomers').textContent = result.stats.totalCustomers || 0;
        document.getElementById('totalRevenue').textContent = 'LKR ' + (parseFloat(result.stats.totalRevenue) || 0).toLocaleString();
    }
}

async function loadAdminMovies() {
    const result = await api('movies.php');
    if (!result.success) return;

    let html = '';
    result.movies.forEach(movie => {
        html += `
            <tr>
                <td>${movie.Movie_ID}</td>
                <td>${movie.Title}</td>
                <td>${movie.Genre}</td>
                <td>${movie.Duration_time} min</td>
                <td>${movie.Release_date}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteMovie(${movie.Movie_ID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    document.getElementById('adminMoviesTable').innerHTML = html;

    // Populate movie select for showtimes
    let selectHtml = '<option value="">Select Movie</option>';
    result.movies.forEach(movie => {
        selectHtml += `<option value="${movie.Movie_ID}">${movie.Title}</option>`;
    });
    document.getElementById('showtimeMovieSelect').innerHTML = selectHtml;
}

async function loadAdminShowtimes() {
    const result = await api('showtimes.php?all=true');
    if (!result.success) return;

    let html = '';
    result.showtimes.forEach(showtime => {
        html += `
            <tr>
                <td>${showtime.Showtime_ID}</td>
                <td>${showtime.Movie_Title}</td>
                <td>${showtime.Show_Date}</td>
                <td>${showtime.Start_time}</td>
                <td>${showtime.End_time}</td>
                <td>Hall ${showtime.Hall_ID}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteShowtime(${showtime.Showtime_ID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    document.getElementById('adminShowtimesTable').innerHTML = html;
}

async function loadAdminBookings() {
    const result = await api('bookings.php?action=all');

    let html = '';
    if (result.success && result.bookings.length > 0) {
        result.bookings.forEach(booking => {
            html += `
                <tr>
                    <td>${booking.Booking_ID}</td>
                    <td>${booking.Customer_Name}</td>
                    <td>${booking.Movie_Title}</td>
                    <td>${booking.Show_Date} ${booking.Start_time}</td>
                    <td>${booking.Seats}</td>
                    <td><span class="badge bg-success">${booking.Booking_Status}</span></td>
                    <td>LKR ${parseFloat(booking.Total_Amount).toLocaleString()}</td>
                </tr>
            `;
        });
    } else {
        html = '<tr><td colspan="7" class="text-center">No bookings yet</td></tr>';
    }
    document.getElementById('adminBookingsTable').innerHTML = html;
}

async function addMovie() {
    const form = document.getElementById('addMovieForm');
    const formData = new FormData(form);

    const result = await api('movies.php', {
        method: 'POST',
        body: {
            title: formData.get('title'),
            genre: formData.get('genre'),
            duration: parseInt(formData.get('duration')),
            language: formData.get('language'),
            releaseDate: formData.get('release_date'),
            description: formData.get('description')
        }
    });

    if (result.success) {
        await loadAdminMovies();
        await loadMovies();
        bootstrap.Modal.getInstance(document.getElementById('addMovieModal')).hide();
        form.reset();
        alert('Movie added successfully!');
    } else {
        alert('Failed to add movie: ' + result.message);
    }
}

async function addShowtime() {
    const form = document.getElementById('addShowtimeForm');
    const formData = new FormData(form);

    const result = await api('showtimes.php', {
        method: 'POST',
        body: {
            movieId: parseInt(formData.get('movie_id')),
            showDate: formData.get('show_date'),
            startTime: formData.get('start_time'),
            endTime: formData.get('end_time'),
            hallId: parseInt(formData.get('hall_id'))
        }
    });

    if (result.success) {
        await loadAdminShowtimes();
        bootstrap.Modal.getInstance(document.getElementById('addShowtimeModal')).hide();
        form.reset();
        alert('Showtime added successfully!');
    } else {
        alert('Failed to add showtime: ' + result.message);
    }
}

async function deleteMovie(id) {
    if (confirm('Are you sure you want to delete this movie?')) {
        const result = await api('movies.php', {
            method: 'DELETE',
            body: { movieId: id }
        });
        if (result.success) {
            await loadAdminMovies();
            await loadMovies();
            alert('Movie deleted successfully!');
        } else {
            alert('Failed to delete movie: ' + result.message);
        }
    }
}

async function deleteShowtime(id) {
    if (confirm('Are you sure you want to delete this showtime?')) {
        const result = await api('showtimes.php', {
            method: 'DELETE',
            body: { showtimeId: id }
        });
        if (result.success) {
            await loadAdminShowtimes();
            alert('Showtime deleted successfully!');
        } else {
            alert('Failed to delete showtime: ' + result.message);
        }
    }
}
