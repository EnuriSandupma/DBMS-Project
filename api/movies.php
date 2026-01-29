<?php
/**
 * CineBook - Movies API
 * Handles movie listing, creation, and deletion
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

switch ($method) {
    case 'GET':
        getMovies();
        break;
    
    case 'POST':
        addMovie($input);
        break;
    
    case 'DELETE':
        deleteMovie($input);
        break;
    
    default:
        sendError('Method not allowed', 405);
}

/**
 * Get all movies
 */
function getMovies() {
    $db = getDB();
    
    try {
        $stmt = $db->query("
            SELECT 
                Movie_ID,
                Title,
                Genre,
                Movie_Language,
                Release_date,
                Duration_time
            FROM movie
            ORDER BY Release_date DESC
        ");
        
        $movies = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'movies' => $movies
        ]);
    } catch (PDOException $e) {
        sendError('Failed to fetch movies: ' . $e->getMessage());
    }
}

/**
 * Add new movie (Admin only)
 */
function addMovie($input) {
    requireAdmin();
    
    $title = sanitize($input['title'] ?? '');
    $genre = sanitize($input['genre'] ?? '');
    $language = sanitize($input['language'] ?? '');
    $duration = intval($input['duration'] ?? 0);
    $releaseDate = $input['releaseDate'] ?? $input['release_date'] ?? '';
    
    // Validation
    if (empty($title) || empty($genre) || empty($language) || $duration <= 0) {
        sendError('Missing required fields');
    }
    
    $db = getDB();
    
    try {
        $stmt = $db->prepare("
            INSERT INTO movie (Title, Genre, Movie_Language, Duration_time, Release_date)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$title, $genre, $language, $duration, $releaseDate]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Movie added successfully',
            'movieId' => $db->lastInsertId()
        ]);
    } catch (PDOException $e) {
        sendError('Failed to add movie: ' . $e->getMessage());
    }
}

/**
 * Delete movie (Admin only)
 */
function deleteMovie($input) {
    requireAdmin();
    
    $movieId = intval($input['movieId'] ?? 0);
    
    if ($movieId <= 0) {
        sendError('Invalid movie ID');
    }
    
    $db = getDB();
    
    try {
        $stmt = $db->prepare("DELETE FROM movie WHERE Movie_ID = ?");
        $stmt->execute([$movieId]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Movie deleted successfully'
            ]);
        } else {
            sendError('Movie not found');
        }
    } catch (PDOException $e) {
        sendError('Failed to delete movie: ' . $e->getMessage());
    }
}
?>
