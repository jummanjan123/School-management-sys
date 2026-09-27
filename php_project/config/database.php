<?php
/**
 * Smart School Management System
 * Database Connection & Configuration File
 * Compatible with Hostinger / cPanel PHP 8+ & MySQL
 */

// Report errors in development, hide raw trace in production
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Database Credentials - configure these with your Hostinger MySQL details
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'u123456789_school');
define('DB_USER', getenv('DB_USER') ?: 'u123456789_user');
define('DB_PASS', getenv('DB_PASS') ?: 'YourStrongDbPassword123#');
define('DB_CHARSET', 'utf8mb4');

// Base Application Settings
define('APP_NAME', 'Smart School Management System');
define('DEFAULT_URDU_SLOGAN', 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', 'uploads/');

// Secure Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    // If running over HTTPS, set secure cookie
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', '1');
    }
    session_start();
}

/**
 * Returns PDO Database Instance with Prepared Statement Protection
 * @return PDO
 */
function getDBConnection(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Enforce real prepared statements
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Failed: " . $e->getMessage());
            die("<div style='font-family:sans-serif;padding:30px;background:#fef2f2;border:1px solid #f87171;color:#991b1b;border-radius:8px;max-width:600px;margin:50px auto;'>
                <h3>Database Connection Error</h3>
                <p>Could not connect to the MySQL database. Please verify your credentials in <code>config/database.php</code> or check your Hostinger MySQL database status.</p>
            </div>");
        }
    }
    return $pdo;
}
