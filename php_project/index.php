<?php
/**
 * Entry Point Router
 */
require_once __DIR__ . '/config/database.php';

if (!empty($_SESSION['school_id']) && !empty($_SESSION['user_id'])) {
    header("Location: dashboard.php");
} else {
    header("Location: login.php");
}
exit;
