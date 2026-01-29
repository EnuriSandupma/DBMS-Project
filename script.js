    // Application State
        let currentUser = null;
        let movies = [];
        let showtimes = [];
        let bookings = [];
        let selectedMovie = null;
        let selectedShowtime = null;
        let selectedSeats = [];

        // Initialize with sample data 
        function initializeData() {
            movies = [
                {
                    id: 1,
                    title: "The Grand Adventure",
                    genre: "Action",
                    duration: 148,
                    language: "English",
                    release_date: "2025-01-15",
                    description: "An epic journey across uncharted territories filled with danger and excitement.",
                    rating: 4.5
                },
                {
                    id: 2,
                    title: "Love in Paris",
                    genre: "Romance",
                    duration: 120,
                    language: "English",
                    release_date: "2025-01-10",
                    description: "A heartwarming tale of love and discovery in the city of lights.",
                    rating: 4.2
                },
                {
                    id: 3,
                    title: "Mystery Island",
                    genre: "Thriller",
                    duration: 135,
                    language: "English",
                    release_date: "2025-01-20",
                    description: "Uncover the secrets hidden beneath the surface of a remote island.",
                    rating: 4.7
                }
            ];

            showtimes = [
                { id: 1, movie_id: 1, show_date: "2025-01-21", start_time: "10:00", end_time: "12:28", hall_id: 1 },
                { id: 2, movie_id: 1, show_date: "2025-01-21", start_time: "14:00", end_time: "16:28", hall_id: 1 },
                { id: 3, movie_id: 1, show_date: "2025-01-21", start_time: "18:00", end_time: "20:28", hall_id: 1 },
                { id: 4, movie_id: 2, show_date: "2025-01-21", start_time: "11:00", end_time: "13:00", hall_id: 1 },
                { id: 5, movie_id: 2, show_date: "2025-01-21", start_time: "15:00", end_time: "17:00", hall_id: 1 },
                { id: 6, movie_id: 3, show_date: "2025-01-21", start_time: "12:00", end_time: "14:15", hall_id: 1 },
                { id: 7, movie_id: 3, show_date: "2025-01-21", start_time: "17:00", end_time: "19:15", hall_id: 1 }
            ];

            loadMovies();
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

        // Load Movies
        function loadMovies() {
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

            if (homeContainer) homeContainer.innerHTML = html;
            if (moviesContainer) moviesContainer.innerHTML = html;
        }

        // Select Movie and Show Booking Page
        function selectMovie(movieId) {
            selectedMovie = movies.find(m => m.id === movieId);
            if (!selectedMovie) return;

            showPage('booking');
            
            const movieDetailsHTML = `
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
            
            document.getElementById('movieDetails').innerHTML = movieDetailsHTML;
            document.getElementById('summaryMovie').textContent = selectedMovie.title;
            
            loadShowtimes();
            resetBooking();
        }

        // Load Showtimes
        function loadShowtimes() {
            const movieShowtimes = showtimes.filter(s => s.movie_id === selectedMovie.id);
            
            let html = '';
            movieShowtimes.forEach(showtime => {
                html += `
                    <button class="showtime-btn" onclick="selectShowtime(${showtime.id})">
                        <div><i class="fas fa-calendar"></i> ${showtime.show_date}</div>
                        <div><i class="fas fa-clock"></i> ${showtime.start_time} - ${showtime.end_time}</div>
                    </button>
                `;
            });
            
            document.getElementById('showtimesList').innerHTML = html;
        }

        // Select Showtime
        function selectShowtime(showtimeId) {
            selectedShowtime = showtimes.find(s => s.id === showtimeId);
            
            document.querySelectorAll('.showtime-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.closest('.showtime-btn').classList.add('active');
            
            document.getElementById('summaryShowtime').textContent = 
                `${selectedShowtime.show_date} ${selectedShowtime.start_time}`;
            
            document.getElementById('seatSelectionSection').style.display = 'block';
            generateSeats();
        }

        // Generate Seats
        function generateSeats() {
            const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const seatsPerRow = 10;
            
            let html = '';
            rows.forEach(row => {
                html += `<div class="seat-row">
                    <div class="row-label">${row}</div>`;
                
                for (let i = 1; i <= seatsPerRow; i++) {
                    const seatNo = `${row}${i}`;
                    const isBooked = Math.random() > 0.8;
                    const bookedClass = isBooked ? 'booked' : '';
                    
                    html += `<div class="seat ${bookedClass}" 
                        data-seat="${seatNo}" 
                        onclick="toggleSeat('${seatNo}', ${isBooked})"></div>`;
                }
                
                html += '</div>';
            });
            
            document.getElementById('seatsContainer').innerHTML = html;
        }

        // Toggle Seat Selection
        function toggleSeat(seatNo, isBooked) {
            if (isBooked) return;
            
            const seatElement = document.querySelector(`[data-seat="${seatNo}"]`);
            
            if (selectedSeats.includes(seatNo)) {
                selectedSeats = selectedSeats.filter(s => s !== seatNo);
                seatElement.classList.remove('selected');
            } else {
                selectedSeats.push(seatNo);
                seatElement.classList.add('selected');
            }
            
            updateBookingSummary();
        }

        // Update Booking Summary
        function updateBookingSummary() {
            const ticketPrice = 1000;
            const ticketCount = selectedSeats.length;
            const total = ticketCount * ticketPrice;
            
            document.getElementById('summarySeats').textContent = 
                selectedSeats.length > 0 ? selectedSeats.join(', ') : '-';
            document.getElementById('summaryTickets').textContent = ticketCount;
            document.getElementById('summaryTotal').textContent = `LKR ${total.toLocaleString()}`;
            
            document.getElementById('confirmBookingBtn').disabled = ticketCount === 0;
        }

        // Confirm Booking
        function confirmBooking() {
            if (!currentUser) {
                alert('Please login to continue booking');
                showPage('login');
                return;
            }
            
            if (selectedSeats.length === 0) {
                alert('Please select at least one seat');
                return;
            }
            
            const booking = {
                id: bookings.length + 1,
                customer_id: currentUser.id,
                movie: selectedMovie.title,
                showtime: `${selectedShowtime.show_date} ${selectedShowtime.start_time}`,
                seats: selectedSeats.join(', '),
                ticketCount: selectedSeats.length,
                total: selectedSeats.length * 1000,
                status: 'Confirmed',
                timestamp: new Date().toISOString()
            };
            
            bookings.push(booking);
            
            alert('Booking Confirmed! Your booking ID is: ' + booking.id);
            resetBooking();
            showPage('myBookings');
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
            
            document.querySelectorAll('.showtime-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        }

        // Handle Login
        function handleLogin(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const email = formData.get('email') || event.target[0].value;
            
            // Simulate login (Replace with actual API call)
            if (email === 'admin@cinebook.com') {
                currentUser = { id: 1, email: email, role: 'admin', name: 'Admin User' };
                document.getElementById('adminNav').style.display = 'block';
            } else {
                currentUser = { id: 2, email: email, role: 'customer', name: 'Customer User' };
            }
            
            updateNavigation();
            alert('Login successful!');
            showPage('home');
        }

        // Handle Register
        function handleRegister(event) {
            event.preventDefault();
            
            // Simulate registration (Replace with actual API call)
            alert('Registration successful! Please login.');
            showPage('login');
        }

        // Update Navigation
        function updateNavigation() {
            if (currentUser) {
                document.getElementById('loginNav').style.display = 'none';
                document.getElementById('registerNav').style.display = 'none';
                document.getElementById('logoutNav').style.display = 'block';
                document.getElementById('myBookingsNav').style.display = 'block';
                
                if (currentUser.role === 'admin') {
                    document.getElementById('adminNav').style.display = 'block';
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
        function logout() {
            currentUser = null;
            updateNavigation();
            showPage('home');
            alert('Logged out successfully!');
        }

        // Load My Bookings
        function loadMyBookings() {
            if (!currentUser) {
                alert('Please login to view bookings');
                showPage('login');
                return;
            }
            
            const userBookings = bookings.filter(b => b.customer_id === currentUser.id);
            
            let html = '';
            if (userBookings.length === 0) {
                html = '<div class="admin-card"><p class="text-center">No bookings found</p></div>';
            } else {
                userBookings.forEach(booking => {
                    html += `
                        <div class="admin-card">
                            <div class="row">
                                <div class="col-md-8">
                                    <h5>${booking.movie}</h5>
                                    <p><i class="fas fa-calendar"></i> ${booking.showtime}</p>
                                    <p><i class="fas fa-chair"></i> Seats: ${booking.seats}</p>
                                    <p><strong>Status: </strong><span class="badge bg-success">${booking.status}</span></p>
                                </div>
                                <div class="col-md-4 text-end">
                                    <h4 class="text-danger">LKR ${booking.total.toLocaleString()}</h4>
                                    <p class="text-muted">Booking ID: ${booking.id}</p>
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
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.style.display = 'none';
            });
            document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).style.display = 'block';
            
            document.querySelectorAll('#adminTabs .nav-link').forEach(link => {
                link.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        function loadAdminData() {
            loadAdminMovies();
            loadAdminShowtimes();
            loadAdminBookings();
        }

        function loadAdminMovies() {
            let html = '';
            movies.forEach(movie => {
                html += `
                    <tr>
                        <td>${movie.id}</td>
                        <td>${movie.title}</td>
                        <td>${movie.genre}</td>
                        <td>${movie.duration} min</td>
                        <td>${movie.release_date}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editMovie(${movie.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMovie(${movie.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById('adminMoviesTable').innerHTML = html;
            
            // Populate movie select for showtimes
            let selectHtml = '<option value="">Select Movie</option>';
            movies.forEach(movie => {
                selectHtml += `<option value="${movie.id}">${movie.title}</option>`;
            });
            document.getElementById('showtimeMovieSelect').innerHTML = selectHtml;
        }

        function loadAdminShowtimes() {
            let html = '';
            showtimes.forEach(showtime => {
                const movie = movies.find(m => m.id === showtime.movie_id);
                html += `
                    <tr>
                        <td>${showtime.id}</td>
                        <td>${movie ? movie.title : 'Unknown'}</td>
                        <td>${showtime.show_date}</td>
                        <td>${showtime.start_time}</td>
                        <td>${showtime.end_time}</td>
                        <td>Hall ${showtime.hall_id}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteShowtime(${showtime.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            document.getElementById('adminShowtimesTable').innerHTML = html;
        }

        function loadAdminBookings() {
            let html = '';
            bookings.forEach(booking => {
                html += `
                    <tr>
                        <td>${booking.id}</td>
                        <td>Customer #${booking.customer_id}</td>
                        <td>${booking.movie}</td>
                        <td>${booking.showtime}</td>
                        <td>${booking.seats}</td>
                        <td><span class="badge bg-success">${booking.status}</span></td>
                        <td>LKR ${booking.total.toLocaleString()}</td>
                    </tr>
                `;
            });
            document.getElementById('adminBookingsTable').innerHTML = html || '<tr><td colspan="7" class="text-center">No bookings yet</td></tr>';
        }

        function addMovie() {
            const form = document.getElementById('addMovieForm');
            const formData = new FormData(form);
            
            const newMovie = {
                id: movies.length + 1,
                title: formData.get('title'),
                genre: formData.get('genre'),
                duration: parseInt(formData.get('duration')),
                language: formData.get('language'),
                release_date: formData.get('release_date'),
                description: formData.get('description'),
                rating: 0
            };
            
            movies.push(newMovie);
            loadAdminMovies();
            loadMovies();
            
            bootstrap.Modal.getInstance(document.getElementById('addMovieModal')).hide();
            form.reset();
            alert('Movie added successfully!');
        }

        function addShowtime() {
            const form = document.getElementById('addShowtimeForm');
            const formData = new FormData(form);
            
            const newShowtime = {
                id: showtimes.length + 1,
                movie_id: parseInt(formData.get('movie_id')),
                show_date: formData.get('show_date'),
                start_time: formData.get('start_time'),
                end_time: formData.get('end_time'),
                hall_id: parseInt(formData.get('hall_id'))
            };
            
            showtimes.push(newShowtime);
            loadAdminShowtimes();
            
            bootstrap.Modal.getInstance(document.getElementById('addShowtimeModal')).hide();
            form.reset();
            alert('Showtime added successfully!');
        }

        function deleteMovie(id) {
            if (confirm('Are you sure you want to delete this movie?')) {
                movies = movies.filter(m => m.id !== id);
                loadAdminMovies();
                loadMovies();
                alert('Movie deleted successfully!');
            }
        }

        function deleteShowtime(id) {
            if (confirm('Are you sure you want to delete this showtime?')) {
                showtimes = showtimes.filter(s => s.id !== id);
                loadAdminShowtimes();
                alert('Showtime deleted successfully!');
            }
        }

        // Initialize app
        initializeData();
        updateNavigation();