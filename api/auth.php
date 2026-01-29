<?php

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();
$action = $_GET['action'] ?? $input['action'] ?? '';

// Handle different actions
switch ($action) {
    case 'login':
        handleLogin($input);
        break;
    
    case 'register':
        handleRegister($input);
        break;
    
    case 'logout':
        handleLogout();
        break;
    
    case 'session':
        checkSession();
        break;
    
    default:
        sendError('Invalid action');
}

/**
 * Handle user login
 */
function handleLogin($input) {
    $email = sanitize($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $isAdmin = $input['isAdmin'] ?? false;
    
    if (empty($email) || empty($password)) {
        sendError('Email and password are required');
    }
    
    if (!isValidEmail($email)) {
        sendError('Invalid email format');
    }
    
    $db = getDB();
    
    if ($isAdmin) {
        // Admin login
        $stmt = $db->prepare("SELECT * FROM admin WHERE Admin_email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && verifyPassword($password, $user['Admin_Password_Hash'])) {
            $_SESSION['user_id'] = $user['Admin_ID'];
            $_SESSION['first_name'] = $user['Admin_First_Name'];
            $_SESSION['last_name'] = $user['Admin_Last_Name'];
            $_SESSION['email'] = $user['Admin_email'];
            $_SESSION['is_admin'] = true;
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['Admin_ID'],
                    'firstName' => $user['Admin_First_Name'],
                    'lastName' => $user['Admin_Last_Name'],
                    'email' => $user['Admin_email'],
                    'isAdmin' => true
                ]
            ]);
        } else {
            sendError('Invalid admin credentials');
        }
    } else {
        // Customer login
        $stmt = $db->prepare("SELECT * FROM customer WHERE Email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && verifyPassword($password, $user['Customer_Password_Hash'])) {
            $_SESSION['user_id'] = $user['Customer_ID'];
            $_SESSION['first_name'] = $user['Customer_First_Name'];
            $_SESSION['last_name'] = $user['Customer_Last_Name'];
            $_SESSION['email'] = $user['Email'];
            $_SESSION['is_admin'] = false;
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['Customer_ID'],
                    'firstName' => $user['Customer_First_Name'],
                    'lastName' => $user['Customer_Last_Name'],
                    'email' => $user['Email'],
                    'isAdmin' => false
                ]
            ]);
        } else {
            sendError('Invalid credentials');
        }
    }
}

/**
 * Handle user registration
 */
function handleRegister($input) {
    $firstName = sanitize($input['firstName'] ?? '');
    $lastName = sanitize($input['lastName'] ?? '');
    $email = sanitize($input['email'] ?? '');
    $contact = sanitize($input['contact'] ?? $input['phone'] ?? '');
    $nic = sanitize($input['nic'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validation
    if (empty($firstName) || empty($lastName) || empty($email) || empty($contact) || empty($password)) {
        sendError('All fields are required (firstName, lastName, email, contact, password). NIC is optional.');
    }
    
    if (!isValidEmail($email)) {
        sendError('Invalid email format');
    }
    
    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters');
    }
    
    $db = getDB();
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT Customer_ID FROM customer WHERE Email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already registered');
    }
    
    // Hash password and insert user
    $hashedPassword = hashPassword($password);
    
    try {
        $stmt = $db->prepare("
            INSERT INTO customer (Customer_First_Name, Customer_Last_Name, Email, Customer_Contact, NIC, Customer_Password_Hash)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([$firstName, $lastName, $email, $contact, $nic, $hashedPassword]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful'
        ]);
    } catch (PDOException $e) {
        sendError('Registration failed: ' . $e->getMessage());
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    session_destroy();
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

/**
 * Check current session
 */
function checkSession() {
    if (isLoggedIn()) {
        echo json_encode([
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'firstName' => $_SESSION['first_name'],
                'lastName' => $_SESSION['last_name'],
                'email' => $_SESSION['email'],
                'isAdmin' => $_SESSION['is_admin']
            ]
        ]);
    } else {
        echo json_encode([
            'logged_in' => false
        ]);
    }
}
?>
