<?php
/**
 * CineBook - Bookings API
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

switch ($method) {
    case 'GET':
        getBookings();
        break;
    
    case 'POST':
        createBooking($input);
        break;
    
    default:
        sendError('Method not allowed', 405);
}

/**
 * Get bookings
 */
function getBookings() {
    $customerId = isset($_GET['customerId']) ? intval($_GET['customerId']) : null;
    $action = $_GET['action'] ?? '';
    
    $db = getDB();
    
    try {
        if ($action === 'stats') {
            // Get statistics for admin dashboard
            requireAdmin();
            
            $stats = [];
            
            // Total movies
            $stmt = $db->query("SELECT COUNT(*) as count FROM movie");
            $stats['totalMovies'] = $stmt->fetch()['count'];
            
            // Total bookings
            $stmt = $db->query("SELECT COUNT(*) as count FROM booking");
            $stats['totalBookings'] = $stmt->fetch()['count'];
            
            // Total customers
            $stmt = $db->query("SELECT COUNT(*) as count FROM customer");
            $stats['totalCustomers'] = $stmt->fetch()['count'];
            
            // Total revenue (sum of all ticket prices for confirmed bookings)
            $stmt = $db->query("
                SELECT COALESCE(SUM(t.Price), 0) as total 
                FROM ticket t
                JOIN booking b ON t.Booking_ID = b.Booking_ID 
                WHERE b.Booking_Status = 'Confirmed'
            ");
            $stats['totalRevenue'] = $stmt->fetch()['total'];
            
            echo json_encode([
                'success' => true,
                'stats' => $stats
            ]);
            
        } elseif ($action === 'all') {
            // Get all bookings (Admin only)
            requireAdmin();
            
            $stmt = $db->query("
                SELECT 
                    b.Booking_ID,
                    b.Booking_Status,
                    b.TimeStamping as Booking_Date,
                    CONCAT(c.Customer_First_Name, ' ', c.Customer_Last_Name) as Customer_Name,
                    m.Title as Movie_Title,
                    s.Show_Date,
                    s.Start_time,
                    GROUP_CONCAT(DISTINCT st.Seat_No ORDER BY st.Seat_No SEPARATOR ', ') as Seats,
                    COALESCE(SUM(t.Price), 0) as Total_Amount
                FROM booking b
                JOIN customer c ON b.Customer_ID = c.Customer_ID
                LEFT JOIN ticket t ON b.Booking_ID = t.Booking_ID
                LEFT JOIN showtime s ON t.Showtime_ID = s.Showtime_ID
                LEFT JOIN movie m ON s.Movie_ID = m.Movie_ID
                LEFT JOIN seat st ON t.Seat_ID = st.Seat_ID
                GROUP BY b.Booking_ID, b.Booking_Status, b.TimeStamping, c.Customer_First_Name, c.Customer_Last_Name, m.Title, s.Show_Date, s.Start_time
                ORDER BY b.TimeStamping DESC
            ");
            
            $bookings = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'bookings' => $bookings
            ]);
            
        } elseif ($customerId) {
            // Get bookings for specific customer
            requireAuth();
            
            // Ensure customer can only see their own bookings
            if ($_SESSION['user_id'] != $customerId && !isAdmin()) {
                sendError('Unauthorized', 403);
            }
            
            $stmt = $db->prepare("
                SELECT 
                    b.Booking_ID,
                    b.Booking_Status,
                    b.TimeStamping as Booking_Date,
                    m.Title as Movie_Title,
                    s.Show_Date,
                    s.Start_time,
                    s.End_time,
                    GROUP_CONCAT(DISTINCT st.Seat_No ORDER BY st.Seat_No SEPARATOR ', ') as Seats,
                    COALESCE(SUM(t.Price), 0) as Total_Amount
                FROM booking b
                LEFT JOIN ticket t ON b.Booking_ID = t.Booking_ID
                LEFT JOIN showtime s ON t.Showtime_ID = s.Showtime_ID
                LEFT JOIN movie m ON s.Movie_ID = m.Movie_ID
                LEFT JOIN seat st ON t.Seat_ID = st.Seat_ID
                WHERE b.Customer_ID = ?
                GROUP BY b.Booking_ID, b.Booking_Status, b.TimeStamping, m.Title, s.Show_Date, s.Start_time, s.End_time
                ORDER BY b.TimeStamping DESC
            ");
            
            $stmt->execute([$customerId]);
            $bookings = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'bookings' => $bookings
            ]);
            
        } else {
            sendError('Missing parameters');
        }
    } catch (PDOException $e) {
        sendError('Failed to fetch bookings: ' . $e->getMessage());
    }
}

/**
 * Create new booking
 */
function createBooking($input) {
    requireAuth();
    
    $customerId = intval($input['customerId'] ?? 0);
    $showtimeId = intval($input['showtimeId'] ?? 0);
    $seats = $input['seats'] ?? [];
    $ticketPrice = floatval($input['ticketPrice'] ?? 1000); // Default price
    
    // Validation
    if ($customerId <= 0 || $showtimeId <= 0 || empty($seats)) {
        sendError('Missing required fields');
    }
    
    // Ensure customer can only book for themselves
    if ($_SESSION['user_id'] != $customerId && !isAdmin()) {
        sendError('Unauthorized', 403);
    }
    
    $db = getDB();
    
    try {
        // Begin transaction
        $db->beginTransaction();
        
        // Check if seats are still available
        $placeholders = str_repeat('?,', count($seats) - 1) . '?';
        $stmt = $db->prepare("
            SELECT COUNT(*) as booked_count
            FROM ticket t
            JOIN booking b ON t.Booking_ID = b.Booking_ID
            WHERE t.Showtime_ID = ?
            AND t.Seat_ID IN ($placeholders)
            AND b.Booking_Status = 'Confirmed'
        ");
        $stmt->execute(array_merge([$showtimeId], $seats));
        $result = $stmt->fetch();
        
        if ($result['booked_count'] > 0) {
            $db->rollBack();
            sendError('Some seats are already booked. Please refresh and try again.');
        }
        
        // Create booking
        $stmt = $db->prepare("
            INSERT INTO booking (Customer_ID, Booking_Status)
            VALUES (?, 'Confirmed')
        ");
        $stmt->execute([$customerId]);
        $bookingId = $db->lastInsertId();
        
        // Create tickets for each seat with price from database
        $ticketStmt = $db->prepare("
            INSERT INTO ticket (Booking_ID, Seat_ID, Showtime_ID, Price)
            VALUES (?, ?, ?, ?)
        ");
        
        $priceStmt = $db->prepare("
            SELECT CASE WHEN Seat_type = 'Premium' THEN 1500 ELSE 1000 END AS Price 
            FROM seat WHERE Seat_ID = ?
        ");
        
        foreach ($seats as $seatId) {
            // Get the correct price for this seat
            $priceStmt->execute([$seatId]);
            $seatRow = $priceStmt->fetch();
            $seatPrice = $seatRow ? $seatRow['Price'] : 1000;
            
            $ticketStmt->execute([$bookingId, $seatId, $showtimeId, $seatPrice]);
        }
        
        // Commit transaction
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Booking created successfully',
            'bookingId' => $bookingId
        ]);
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Failed to create booking: ' . $e->getMessage());
    }
}
?>
