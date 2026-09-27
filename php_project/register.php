<?php
/**
 * School Management System - Multi-School Registration
 * Registers a new independent tenant with secure password hashing and default classes.
 */
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/functions.php';

$errorMessage = '';
$formData = [
    'school_name' => '',
    'username' => '',
    'phone' => '',
    'head_name' => '',
    'address' => ''
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $schoolName = trim($_POST['school_name'] ?? '');
    $username   = strtolower(trim($_POST['username'] ?? ''));
    $password   = $_POST['password'] ?? '';
    $confirmPass = $_POST['confirm_password'] ?? '';
    $phone      = trim($_POST['phone'] ?? '');
    $headName   = trim($_POST['head_name'] ?? 'Principal');
    $address    = trim($_POST['address'] ?? '');

    $formData = [
        'school_name' => $schoolName,
        'username'    => $username,
        'phone'       => $phone,
        'head_name'   => $headName,
        'address'     => $address
    ];

    // Validation
    if (empty($schoolName) || empty($username) || empty($password)) {
        $errorMessage = "School Name, Username, and Password are required.";
    } elseif (strlen($username) < 3 || !preg_match('/^[a-z0-9_-]+$/', $username)) {
        $errorMessage = "Username must be at least 3 characters and contain only lowercase letters, numbers, and dashes.";
    } elseif (strlen($password) < 6) {
        $errorMessage = "Password must be at least 6 characters long.";
    } elseif ($password !== $confirmPass) {
        $errorMessage = "Passwords do not match. Please re-enter.";
    } else {
        $pdo = getDBConnection();

        // Check for duplicate username
        $checkStmt = $pdo->prepare("SELECT id FROM schools WHERE username = ? LIMIT 1");
        $checkStmt->execute([$username]);
        if ($checkStmt->fetch()) {
            $errorMessage = "The username '$username' is already registered. Please choose another username.";
        } else {
            try {
                $pdo->beginTransaction();

                $schoolUuid = 'SCH-' . strtoupper(bin2hex(random_bytes(4)));
                $passwordHash = password_hash($password, PASSWORD_BCRYPT);

                // 1. Insert into schools
                $stmt = $pdo->prepare("INSERT INTO schools (school_uuid, name, username, password, phone, address, head_name) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$schoolUuid, $schoolName, $username, $passwordHash, $phone, $address, $headName]);
                $newSchoolId = (int)$pdo->lastInsertId();

                // 2. Insert Head Administrator user
                $userStmt = $pdo->prepare("INSERT INTO users (school_id, username, password, full_name, role) 
                                           VALUES (?, ?, ?, ?, 'head_admin')");
                $userStmt->execute([$newSchoolId, $username, $passwordHash, $headName]);
                $newUserId = (int)$pdo->lastInsertId();

                // 3. Seed Default Classes
                $defaultClasses = [
                    ['name' => 'Play Group', 'order' => 1, 'fee' => 1500.00],
                    ['name' => 'Nursery',    'order' => 2, 'fee' => 1500.00],
                    ['name' => 'Prep',       'order' => 3, 'fee' => 1800.00],
                    ['name' => 'Class 1',    'order' => 4, 'fee' => 2000.00],
                    ['name' => 'Class 2',    'order' => 5, 'fee' => 2000.00],
                    ['name' => 'Class 3',    'order' => 6, 'fee' => 2200.00],
                    ['name' => 'Class 4',    'order' => 7, 'fee' => 2200.00],
                    ['name' => 'Class 5',    'order' => 8, 'fee' => 2500.00],
                    ['name' => 'Class 6',    'order' => 9, 'fee' => 2800.00],
                    ['name' => 'Class 7',    'order' => 10, 'fee' => 2800.00],
                    ['name' => 'Class 8',    'order' => 11, 'fee' => 3000.00],
                    ['name' => 'Class 9',    'order' => 12, 'fee' => 3500.00],
                    ['name' => 'Class 10',   'order' => 13, 'fee' => 3500.00]
                ];
                $classStmt = $pdo->prepare("INSERT INTO classes (school_id, name, numeric_order, monthly_fee) VALUES (?, ?, ?, ?)");
                foreach ($defaultClasses as $c) {
                    $classStmt->execute([$newSchoolId, $c['name'], $c['order'], $c['fee']]);
                }

                logActivity($pdo, $newSchoolId, $newUserId, 'School Registered', 'School', (string)$newSchoolId, "Registered school: $schoolName");

                $pdo->commit();
                header("Location: login.php?msg=registered");
                exit;

            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                error_log("Registration error: " . $e->getMessage());
                $errorMessage = "Registration failed due to a system error. Please try again.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register School | Smart School Management System</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .register-card {
      background: #ffffff;
      border-radius: 1.25rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      width: 100%;
      max-width: 580px;
    }
  </style>
</head>
<body>

<div class="register-card p-4 p-sm-5">
  <div class="text-center mb-4">
    <div class="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
      <i class="bi bi-mortarboard-fill fs-2"></i>
    </div>
    <h3 class="fw-bold text-dark mb-1">Register New School</h3>
    <p class="text-muted small">Multi-tenant cloud architecture. Multi-device accessible.</p>
  </div>

  <?php if (!empty($errorMessage)): ?>
    <div class="alert alert-danger alert-dismissible fade show small py-2 px-3 mb-3" role="alert">
      <i class="bi bi-exclamation-circle-fill me-1"></i> <?= e($errorMessage) ?>
      <button type="button" class="btn-close p-2" data-bs-dismiss="alert"></button>
    </div>
  <?php endif; ?>

  <form method="POST" action="register.php">
    <?= csrfField() ?>

    <div class="row g-3 mb-3">
      <div class="col-12">
        <label class="form-label small fw-semibold text-secondary">Official School Name *</label>
        <input type="text" name="school_name" class="form-control" placeholder="e.g. Hjamia Model High School" value="<?= e($formData['school_name']) ?>" required>
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">School Username / Login *</label>
        <div class="input-group">
          <span class="input-group-text bg-light text-muted"><i class="bi bi-at"></i></span>
          <input type="text" name="username" class="form-control" placeholder="e.g. hjamiaschool" value="<?= e($formData['username']) ?>" required>
        </div>
        <small class="text-muted" style="font-size: 0.72rem;">Use only letters, numbers and hyphens.</small>
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">Head / Principal Name</label>
        <input type="text" name="head_name" class="form-control" placeholder="e.g. Prof. Muhammad Tariq" value="<?= e($formData['head_name']) ?>">
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">Contact Phone</label>
        <input type="text" name="phone" class="form-control" placeholder="0300-1234567" value="<?= e($formData['phone']) ?>">
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">School Address</label>
        <input type="text" name="address" class="form-control" placeholder="City / Campus Location" value="<?= e($formData['address']) ?>">
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">Admin Password *</label>
        <input type="password" name="password" class="form-control" placeholder="Min 6 characters" required>
      </div>

      <div class="col-sm-6">
        <label class="form-label small fw-semibold text-secondary">Confirm Password *</label>
        <input type="password" name="confirm_password" class="form-control" placeholder="Repeat password" required>
      </div>
    </div>

    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold shadow-sm mb-3">
      <i class="bi bi-check2-circle me-1"></i> Complete Registration & Activate
    </button>
  </form>

  <div class="text-center pt-2 border-top">
    <p class="small text-muted mb-0">
      Already have a school account? <a href="login.php" class="fw-semibold text-primary text-decoration-none">Log In Here</a>
    </p>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
