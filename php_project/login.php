<?php
/**
 * School Management System - Secure Login
 * Multi-device login: verifies credentials against MySQL and creates secure session.
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

// If already logged in, redirect to dashboard
if (!empty($_SESSION['school_id']) && !empty($_SESSION['user_id'])) {
    header("Location: dashboard.php");
    exit;
}

$errorMessage = '';
$successMessage = '';

if (isset($_GET['msg'])) {
    if ($_GET['msg'] === 'registered') {
        $successMessage = "School registration successful! Please log in with your credentials.";
    } elseif ($_GET['msg'] === 'logged_out') {
        $successMessage = "You have been logged out securely.";
    } elseif ($_GET['msg'] === 'session_expired') {
        $errorMessage = "Your session expired. Please log in again.";
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $errorMessage = "Please enter both School Username and Password.";
    } else {
        $pdo = getDBConnection();
        // Look up either in schools or users table
        $stmt = $pdo->prepare("SELECT s.id as school_id, s.name as school_name, s.status as school_status, 
                                      u.id as user_id, u.username, u.password as password_hash, u.role, u.status as user_status, u.full_name
                               FROM users u
                               JOIN schools s ON u.school_id = s.id
                               WHERE (u.username = ? OR s.username = ?)
                               LIMIT 1");
        $stmt->execute([$username, $username]);
        $account = $stmt->fetch();

        if ($account && password_verify($password, $account['password_hash'])) {
            if ($account['school_status'] !== 'active' || $account['user_status'] !== 'active') {
                $errorMessage = "This school account is currently inactive. Please contact system administrator.";
            } else {
                // Regenerate session ID to prevent session fixation
                session_regenerate_id(true);
                $_SESSION['school_id'] = (int)$account['school_id'];
                $_SESSION['user_id'] = (int)$account['user_id'];
                $_SESSION['user_name'] = $account['full_name'];
                $_SESSION['user_role'] = $account['role'];

                // Update last login
                $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                $stmt->execute([$account['user_id']]);

                logActivity($pdo, $account['school_id'], $account['user_id'], 'User Login', 'User', (string)$account['user_id'], 'Logged in from ' . ($_SERVER['REMOTE_ADDR'] ?? 'device'));

                header("Location: dashboard.php");
                exit;
            }
        } else {
            $errorMessage = "Invalid School Username or Password. Please try again.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | Smart School Management System</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .login-card {
      background: #ffffff;
      border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
    }
    .urdu-banner {
      font-family: 'Noto Nastaliq Urdu', serif;
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
      color: #1e40af;
      padding: 0.75rem 1rem;
      text-align: center;
      font-size: 0.95rem;
      direction: rtl;
    }
  </style>
</head>
<body>

<div class="login-card">
  <!-- Urdu educational slogan banner -->
  <div class="urdu-banner fw-bold">
    "تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے"
  </div>

  <div class="p-4 p-sm-5">
    <div class="text-center mb-4">
      <div class="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
        <i class="bi bi-mortarboard-fill fs-2"></i>
      </div>
      <h3 class="fw-bold text-dark mb-1">SMART SCHOOL</h3>
      <p class="text-muted small">Multi-Tenant Management Portal</p>
    </div>

    <?php if (!empty($errorMessage)): ?>
      <div class="alert alert-danger alert-dismissible fade show small py-2 px-3 mb-3" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> <?= e($errorMessage) ?>
        <button type="button" class="btn-close p-2" data-bs-dismiss="alert"></button>
      </div>
    <?php endif; ?>

    <?php if (!empty($successMessage)): ?>
      <div class="alert alert-success alert-dismissible fade show small py-2 px-3 mb-3" role="alert">
        <i class="bi bi-check-circle-fill me-1"></i> <?= e($successMessage) ?>
        <button type="button" class="btn-close p-2" data-bs-dismiss="alert"></button>
      </div>
    <?php endif; ?>

    <form method="POST" action="login.php" autocomplete="off">
      <?= csrfField() ?>

      <div class="mb-3">
        <label for="username" class="form-label small fw-semibold text-secondary">School Login / Username</label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-building"></i></span>
          <input type="text" name="username" id="username" class="form-control bg-light border-start-0 ps-0" placeholder="e.g. hjamiaschool" required autofocus>
        </div>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <label for="password" class="form-label small fw-semibold text-secondary mb-0">Password</label>
          <a href="#" onclick="alert('Please contact your system administrator or hosting database administrator to reset credentials.')" class="small text-decoration-none text-primary">Forgot Password?</a>
        </div>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-lock-fill"></i></span>
          <input type="password" name="password" id="password" class="form-control bg-light border-start-0 ps-0" placeholder="••••••••" required>
        </div>
      </div>

      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="rememberMe" name="remember_me">
        <label class="form-check-label small text-muted" for="rememberMe">Remember Me on this device</label>
      </div>

      <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold shadow-sm mb-3">
        <i class="bi bi-box-arrow-in-right me-1"></i> Log In to Dashboard
      </button>
    </form>

    <div class="text-center pt-2 border-top">
      <p class="small text-muted mb-0">
        Registering a new school? <a href="register.php" class="fw-semibold text-primary text-decoration-none">Create School Account</a>
      </p>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
