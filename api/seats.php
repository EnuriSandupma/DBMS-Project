<?php
/**
 * CineBook - Seats API
 * Handles seat availability and booking
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    getSeats();
} else {
    sendError('Method not allowed', 405);
}

/**
 * Get seats for a showtime
 */
function getSeats() {
    $showtimeId = isset($_GET['showtimeId']) ? intval($_GET['showtimeId']) : 0;
    
    if ($showtimeId <= 0) {
        sendError('Invalid showtime ID');
    }
    
    $db = getDB();
    
    try {
        // Get showtime info
        $stmt = $db->prepare("SELECT Hall_ID FROM showtime WHERE Showtime_ID = ?");
        $stmt->execute([$showtimeId]);
        $showtime = $stmt->fetch();
        
        if (!$showtime) {
            sendError('Showtime not found');
        }
        
        // Get all seats for this hall with price based on seat type
        $stmt = $db->prepare("
            SELECT 
                Seat_ID,
                Seat_No,
                Seat_type,
                CASE 
                    WHEN Seat_type = 'Premium' THEN 1500 
                    ELSE 1000 
                END AS Price
            FROM seat
            WHERE Hall_ID = ?
            ORDER BY Seat_No
        ");
        $stmt->execute([$showtime['Hall_ID']]);
        $seats = $stmt->fetchAll();
        
        // Get booked seats for this showtime
        $stmt = $db->prepare("
            SELECT DISTINCT t.Seat_ID
            FROM ticket t
            JOIN booking b ON t.Booking_ID = b.Booking_ID
            WHERE t.Showtime_ID = ?
            AND b.Booking_Status = 'Confirmed'
            AND t.Seat_ID IS NOT NULL
        ");
        $stmt->execute([$showtimeId]);
        $bookedSeats = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo json_encode([
            'success' => true,
            'seats' => $seats,
            'bookedSeats' => $bookedSeats
        ]);
    } catch (PDOException $e) {
        sendError('Failed to fetch seats: ' . $e->getMessage());
    }
}
?>
