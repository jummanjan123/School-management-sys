<?php
/**
 * Core Application Functions & Multi-Tenant Helpers
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/csrf.php';

/**
 * Sanitize string for HTML output (XSS protection)
 */
function e(?string $string): string {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Log activity for the authenticated school
 */
function logActivity(PDO $pdo, int $schoolId, ?int $userId, string $action, string $recordType, ?string $recordId = null, ?string $details = null): void {
    try {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $stmt = $pdo->prepare("INSERT INTO activity_logs (school_id, user_id, action, record_type, record_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$schoolId, $userId, $action, $recordType, $recordId, $details, $ip]);
    } catch (Exception $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

/**
 * Generate Next Unique Code
 */
function generateNextCode(PDO $pdo, int $schoolId, string $table, string $column, string $prefix): string {
    $stmt = $pdo->prepare("SELECT $column FROM $table WHERE school_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->execute([$schoolId]);
    $last = $stmt->fetchColumn();

    if ($last && preg_match('/' . preg_quote($prefix, '/') . '(\d+)/', $last, $matches)) {
        $nextNumber = intval($matches[1]) + 1;
    } else {
        $nextNumber = 1001;
    }
    return $prefix . str_pad((string)$nextNumber, 4, '0', STR_PAD_LEFT);
}

/**
 * Secure File Upload Handler
 */
function handleFileUpload(array $file, string $subfolder = 'misc'): ?string {
    if (empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    $maxBytes = 5 * 1024 * 1024; // 5MB

    if ($file['size'] > $maxBytes) {
        throw new Exception("Uploaded file exceeds 5MB limit.");
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']);
    if (!in_array($mime, $allowedMimes, true)) {
        throw new Exception("Invalid file type ($mime). Only JPG, PNG, and WebP are allowed.");
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExts, true)) {
        throw new Exception("Invalid file extension.");
    }

    $targetDir = rtrim(UPLOAD_DIR, '/') . '/' . trim($subfolder, '/') . '/';
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    $fileName = bin2hex(random_bytes(16)) . '.' . $ext;
    $targetPath = $targetDir . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception("Failed to save uploaded file.");
    }

    return UPLOAD_URL . trim($subfolder, '/') . '/' . $fileName;
}

/**
 * Generate Circular Badge Logo SVG from School Name
 */
function generateSchoolLogoSvg(string $schoolName): string {
    $words = explode(' ', trim($schoolName));
    $initials = '';
    foreach ($words as $w) {
        if (!empty($w)) {
            $initials .= mb_strtoupper(mb_substr($w, 0, 1));
            if (mb_strlen($initials) >= 3) break;
        }
    }
    if (empty($initials)) $initials = 'SCH';

    $shortName = mb_strimwidth($schoolName, 0, 18, '..');

    return '<svg class="w-12 h-12 rounded-full shadow-md" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="schoolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#schoolGrad)" stroke="#fbbf24" stroke-width="3" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="2,2" />
      <polygon points="50,15 53,24 62,24 55,30 57,39 50,33 43,39 45,30 38,24 47,24" fill="#fbbf24" />
      <text x="50" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">' . htmlspecialchars($initials, ENT_QUOTES) . '</text>
      <text x="50" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="600" fill="#fde68a" text-anchor="middle">' . htmlspecialchars($shortName, ENT_QUOTES) . '</text>
    </svg>';
}

/**
 * Format currency in PKR / Standard Rupees
 */
function formatCurrency($amount): string {
    return 'Rs. ' . number_format((float)$amount, 2);
}

/**
 * Format standard readable date
 */
function formatDate(?string $date): string {
    if (!$date || $date === '0000-00-00') return '-';
    return date('d M Y', strtotime($date));
}
