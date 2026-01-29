<?php


require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

switch ($method) {
    case 'GET':
        getShowtimes();
        break;
    
    case 'POST':
        addShowtime($input);
        break;
    
    case 'DELETE':
        deleteShowtime($input);
        break;
    
    default:
        sendError('Method not allowed', 405);
}

/**
 * Get showtimes
 */
function getShowtimes() {
    $db = getDB();
    $movieId = isset($_GET['movieId']) ? intval($_GET['movieId']) : null;
    $all = isset($_GET['all']) && $_GET['all'] === 'true';
    
    try {
        if ($all) {
            // Get all showtimes with movie info (for admin)
            $stmt = $db->query("
                SELECT 
                    s.Showtime_ID,
                    s.Show_Date,
                    s.Start_time,
                    s.End_time,
                    s.Hall_ID,
                    s.Movie_ID,
                    m.Title as Movie_Title
                FROM showtime s
                JOIN movie m ON s.Movie_ID = m.Movie_ID
                ORDER BY s.Show_Date DESC, s.Start_time DESC
            ");
        } elseif ($movieId) {
            // Get showtimes for specific movie
            $stmt = $db->prepare("
                SELECT 
                    s.Showtime_ID,
                    s.Show_Date,
                    s.Start_time,
                    s.End_time,
                    s.Hall_ID,
                    s.Movie_ID,
                    m.Title as Movie_Title
                FROM showtime s
                JOIN movie m ON s.Movie_ID = m.Movie_ID
                WHERE s.Movie_ID = ?
                AND s.Show_Date >= CURDATE()
                ORDER BY s.Show_Date, s.Start_time
            ");
            $stmt->execute([$movieId]);
        } else {
            sendError('Missing parameters');
        }
        
        $showtimes = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'showtimes' => $showtimes
        ]);
    } catch (PDOException $e) {
        sendError('Failed to fetch showtimes: ' . $e->getMessage());
    }
}

/**
 * Add new showtime (Admin only)
 */
function addShowtime($input) {
    requireAdmin();
    
    $movieId = intval($input['movieId'] ?? $input['movie_id'] ?? 0);
    $hallId = intval($input['hallId'] ?? $input['hall_id'] ?? 0);
    $showDate = $input['showDate'] ?? $input['show_date'] ?? '';
    $startTime = $input['startTime'] ?? $input['start_time'] ?? '';
    $endTime = $input['endTime'] ?? $input['end_time'] ?? '';
    
    // Validation
    if ($movieId <= 0 || $hallId <= 0 || empty($showDate) || empty($startTime) || empty($endTime)) {
        sendError('Missing required fields');
    }
    
    $db = getDB();
    
    try {
        // Check if hall exists
        $stmt = $db->prepare("SELECT Hall_ID FROM hall WHERE Hall_ID = ?");
        $stmt->execute([$hallId]);
        if (!$stmt->fetch()) {
            sendError('Invalid hall ID');
        }
        
        // Insert showtime
        $stmt = $db->prepare("
            INSERT INTO showtime (Movie_ID, Hall_ID, Show_Date, Start_time, End_time)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$movieId, $hallId, $showDate, $startTime, $endTime]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Showtime added successfully',
            'showtimeId' => $db->lastInsertId()
        ]);
    } catch (PDOException $e) {
        sendError('Failed to add showtime: ' . $e->getMessage());
    }
}

/**
 * Delete showtime (Admin only)
 */
function deleteShowtime($input) {
    requireAdmin();
    
    $showtimeId = intval($input['showtimeId'] ?? 0);
    
    if ($showtimeId <= 0) {
        sendError('Invalid showtime ID');
    }
    
    $db = getDB();
    
    try {
        $stmt = $db->prepare("DELETE FROM showtime WHERE Showtime_ID = ?");
        $stmt->execute([$showtimeId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Showtime deleted successfully'
            ]);
        } else {
            sendError('Showtime not found');
        }
    } catch (PDOException $e) {
        sendError('Failed to delete showtime: ' . $e->getMessage());
    }
}
?>
