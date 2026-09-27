<?php
/**
 * Authentication & Multi-Tenant Authorization Guard
 * Every protected page must include this file at the very top.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/functions.php';

// Check if school session exists
if (empty($_SESSION['school_id']) || empty($_SESSION['user_id'])) {
    header("Location: login.php?msg=session_expired");
    exit;
}

$pdo = getDBConnection();
$schoolId = (int)$_SESSION['school_id'];
$userId = (int)$_SESSION['user_id'];

// Fetch verified school record
$stmt = $pdo->prepare("SELECT * FROM schools WHERE id = ? AND status = 'active' LIMIT 1");
$stmt->execute([$schoolId]);
$currentSchool = $stmt->fetch();

if (!$currentSchool) {
    // School does not exist or was suspended
    session_unset();
    session_destroy();
    header("Location: login.php?msg=account_inactive");
    exit;
}

// Fetch current user details
$stmt = $pdo->prepare("SELECT id, username, full_name, role FROM users WHERE id = ? AND school_id = ? AND status = 'active' LIMIT 1");
$stmt->execute([$userId, $schoolId]);
$currentUser = $stmt->fetch();

if (!$currentUser) {
    session_unset();
    session_destroy();
    header("Location: login.php?msg=user_inactive");
    exit;
}
