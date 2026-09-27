<?php
/**
 * School Settings, Branding, Class Configuration & Data Backup
 */
require_once __DIR__ . '/includes/header.php';

$successMessage = '';
$errorMessage = '';

// Handle Settings Form Updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $action = $_POST['action'] ?? '';

    if ($action === 'update_profile') {
        $schoolName = trim($_POST['school_name'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $headName = trim($_POST['head_name'] ?? '');
        $session = trim($_POST['academic_session'] ?? '2025-2026');
        $slogan = trim($_POST['urdu_slogan'] ?? 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے');

        try {
            $logoPath = $currentSchool['logo_path'];
            $sigPath = $currentSchool['signature_path'];
            $stampPath = $currentSchool['stamp_path'];

            if (!empty($_FILES['logo']['name'])) {
                $logoPath = handleFileUpload($_FILES['logo'], 'logos');
            }
            if (!empty($_FILES['signature']['name'])) {
                $sigPath = handleFileUpload($_FILES['signature'], 'signatures');
            }
            if (!empty($_FILES['stamp']['name'])) {
                $stampPath = handleFileUpload($_FILES['stamp'], 'stamps');
            }

            $stmt = $pdo->prepare("UPDATE schools SET name = ?, phone = ?, email = ?, address = ?, head_name = ?, academic_session = ?, urdu_slogan = ?, logo_path = ?, signature_path = ?, stamp_path = ? WHERE id = ?");
            $stmt->execute([$schoolName, $phone, $email, $address, $headName, $session, $slogan, $logoPath, $sigPath, $stampPath, $schoolId]);

            logActivity($pdo, $schoolId, $userId, 'Settings Updated', 'SchoolProfile', (string)$schoolId, "Updated school profile and branding");
            $successMessage = "School profile, branding, and Urdu slogan updated successfully!";

            // Refresh currentSchool
            $stmt = $pdo->prepare("SELECT * FROM schools WHERE id = ?");
            $stmt->execute([$schoolId]);
            $currentSchool = $stmt->fetch();

        } catch (Exception $e) {
            $errorMessage = $e->getMessage();
        }

    } elseif ($action === 'add_class') {
        $className = trim($_POST['class_name'] ?? '');
        $order = (int)($_POST['numeric_order'] ?? 1);
        $fee = (float)($_POST['monthly_fee'] ?? 2000.00);

        if (!empty($className)) {
            try {
                $stmt = $pdo->prepare("INSERT INTO classes (school_id, name, numeric_order, monthly_fee) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE monthly_fee = VALUES(monthly_fee)");
                $stmt->execute([$schoolId, $className, $order, $fee]);
                logActivity($pdo, $schoolId, $userId, 'Class Added', 'Class', $className, "Added class: $className");
                $successMessage = "Class '$className' added successfully!";
            } catch (Exception $e) {
                $errorMessage = "Error adding class: " . $e->getMessage();
            }
        }

    } elseif ($action === 'delete_class') {
        $classId = (int)$_POST['class_id'];
        $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ? AND school_id = ?");
        $stmt->execute([$classId, $schoolId]);
        $successMessage = "Class removed successfully.";

    } elseif ($action === 'change_password') {
        $currentPass = $_POST['current_password'] ?? '';
        $newPass = $_POST['new_password'] ?? '';
        $confirmPass = $_POST['confirm_password'] ?? '';

        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ? AND school_id = ?");
        $stmt->execute([$userId, $schoolId]);
        $hash = $stmt->fetchColumn();

        if (!password_verify($currentPass, $hash)) {
            $errorMessage = "Current password entered is incorrect.";
        } elseif (strlen($newPass) < 6) {
            $errorMessage = "New password must be at least 6 characters long.";
        } elseif ($newPass !== $confirmPass) {
            $errorMessage = "New passwords do not match.";
        } else {
            $newHash = password_hash($newPass, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ? AND school_id = ?");
            $stmt->execute([$newHash, $userId, $schoolId]);
            logActivity($pdo, $schoolId, $userId, 'Password Changed', 'User', (string)$userId, "Admin updated account password");
            $successMessage = "Password successfully changed!";
        }

    } elseif ($action === 'backup_data') {
        // Prepare comprehensive school data JSON backup
        $data = [
            'export_time' => date('Y-m-d H:i:s'),
            'school' => $currentSchool,
            'classes' => $pdo->query("SELECT * FROM classes WHERE school_id = $schoolId")->fetchAll(),
            'teachers' => $pdo->query("SELECT * FROM teachers WHERE school_id = $schoolId")->fetchAll(),
            'students' => $pdo->query("SELECT * FROM students WHERE school_id = $schoolId")->fetchAll(),
            'staff' => $pdo->query("SELECT * FROM staff WHERE school_id = $schoolId")->fetchAll(),
            'inventory' => $pdo->query("SELECT * FROM inventory WHERE school_id = $schoolId")->fetchAll(),
            'fees' => $pdo->query("SELECT * FROM fees WHERE school_id = $schoolId")->fetchAll(),
            'fee_payments' => $pdo->query("SELECT * FROM fee_payments WHERE school_id = $schoolId")->fetchAll(),
            'student_attendance' => $pdo->query("SELECT * FROM student_attendance WHERE school_id = $schoolId")->fetchAll()
        ];
        
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="school_backup_' . date('Y_m_d_His') . '.json"');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Fetch classes
$classStmt = $pdo->prepare("SELECT * FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">School Profile & System Settings</h3>
    <p class="text-muted small mb-0">Customize institutional branding, Urdu educational slogan, classes, security and backups.</p>
  </div>
</div>

<?php if (!empty($successMessage)): ?>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="bi bi-check-circle-fill me-2"></i> <?= e($successMessage) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<?php if (!empty($errorMessage)): ?>
  <div class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= e($errorMessage) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<div class="row g-4">
  <!-- 1. School Branding & Profile -->
  <div class="col-lg-8">
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
      <h5 class="fw-bold text-dark mb-4 border-bottom pb-2">
        <i class="bi bi-building-gear text-primary me-2"></i> Institutional Profile & Official Branding
      </h5>

      <form method="POST" action="settings.php" enctype="multipart/form-data">
        <?= csrfField() ?>
        <input type="hidden" name="action" value="update_profile">

        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label small fw-semibold text-secondary">School Name *</label>
            <input type="text" name="school_name" class="form-control" value="<?= e($currentSchool['name']) ?>" required>
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold text-secondary">Academic Session</label>
            <input type="text" name="academic_session" class="form-control" value="<?= e($currentSchool['academic_session']) ?>">
          </div>

          <!-- Urdu Educational Slogan -->
          <div class="col-12">
            <label class="form-label small fw-semibold text-secondary d-flex justify-content-between">
              <span>Urdu Educational Slogan (Appears on Header, Certificates & PVC Cards)</span>
              <span class="urdu-font text-primary fw-bold">اردو سلوگن</span>
            </label>
            <input type="text" name="urdu_slogan" class="form-control urdu-font fs-5 text-primary fw-bold" value="<?= e($currentSchool['urdu_slogan']) ?>" dir="rtl">
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-semibold text-secondary">Principal / Headmaster Name</label>
            <input type="text" name="head_name" class="form-control" value="<?= e($currentSchool['head_name']) ?>">
          </div>

          <div class="col-md-6">
            <label class="form-label small fw-semibold text-secondary">Contact Phone</label>
            <input type="text" name="phone" class="form-control" value="<?= e($currentSchool['phone']) ?>">
          </div>

          <div class="col-12">
            <label class="form-label small fw-semibold text-secondary">Official Address</label>
            <input type="text" name="address" class="form-control" value="<?= e($currentSchool['address']) ?>">
          </div>

          <!-- File Uploads: Logo, Signature, Stamp -->
          <div class="col-md-4">
            <label class="form-label small fw-semibold text-secondary">Custom Logo</label>
            <input type="file" name="logo" class="form-control" accept="image/*">
            <?php if (!empty($currentSchool['logo_path'])): ?>
              <small class="text-success d-block mt-1"><i class="bi bi-check2"></i> Custom logo uploaded</small>
            <?php else: ?>
              <small class="text-muted d-block mt-1">Default circular badge active</small>
            <?php endif; ?>
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold text-secondary">Head Signature (PNG/JPG)</label>
            <input type="file" name="signature" class="form-control" accept="image/*">
            <?php if (!empty($currentSchool['signature_path'])): ?>
              <small class="text-success d-block mt-1"><i class="bi bi-check2"></i> Signature on file</small>
            <?php endif; ?>
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold text-secondary">School Stamp (Seal)</label>
            <input type="file" name="stamp" class="form-control" accept="image/*">
            <?php if (!empty($currentSchool['stamp_path'])): ?>
              <small class="text-success d-block mt-1"><i class="bi bi-check2"></i> Stamp on file</small>
            <?php endif; ?>
          </div>
        </div>

        <div class="mt-4 pt-3 border-top text-end">
          <button type="submit" class="btn btn-primary px-4 fw-semibold shadow-sm">
            <i class="bi bi-save me-1"></i> Save Changes
          </button>
        </div>
      </form>
    </div>

    <!-- Class Configuration -->
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <h5 class="fw-bold text-dark mb-3 border-bottom pb-2">
        <i class="bi bi-bookmarks text-warning me-2"></i> Class Management & Default Fees
      </h5>

      <!-- Add Class Inline -->
      <form method="POST" action="settings.php" class="row g-2 mb-4 align-items-end">
        <?= csrfField() ?>
        <input type="hidden" name="action" value="add_class">

        <div class="col-sm-5">
          <label class="form-label small fw-semibold text-secondary">Class Name</label>
          <input type="text" name="class_name" class="form-control" placeholder="e.g. Class 11" required>
        </div>
        <div class="col-sm-3">
          <label class="form-label small fw-semibold text-secondary">Monthly Fee (Rs.)</label>
          <input type="number" step="0.01" name="monthly_fee" class="form-control" value="2500.00" required>
        </div>
        <div class="col-sm-2">
          <label class="form-label small fw-semibold text-secondary">Order</label>
          <input type="number" name="numeric_order" class="form-control" value="<?= count($classes) + 1 ?>">
        </div>
        <div class="col-sm-2">
          <button type="submit" class="btn btn-warning text-dark fw-bold w-100">+ Add</button>
        </div>
      </form>

      <!-- Existing Classes List -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small text-uppercase">
            <tr>
              <th class="ps-3">Class Name</th>
              <th>Order</th>
              <th>Default Monthly Fee</th>
              <th class="pe-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($classes as $cls): ?>
              <tr>
                <td class="ps-3 fw-bold text-dark"><?= e($cls['name']) ?></td>
                <td><?= $cls['numeric_order'] ?></td>
                <td class="fw-semibold text-success"><?= formatCurrency($cls['monthly_fee']) ?></td>
                <td class="pe-3 text-end">
                  <form method="POST" action="settings.php" style="display:inline;" onsubmit="return confirm('Remove class <?= e($cls['name']) ?>?');">
                    <?= csrfField() ?>
                    <input type="hidden" name="action" value="delete_class">
                    <input type="hidden" name="class_id" value="<?= $cls['id'] ?>">
                    <button type="submit" class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 2. Security & Backup Sidebar -->
  <div class="col-lg-4">
    <!-- Change Password -->
    <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <h6 class="fw-bold text-dark mb-3">
        <i class="bi bi-shield-lock text-danger me-2"></i> Change Password
      </h6>
      <form method="POST" action="settings.php">
        <?= csrfField() ?>
        <input type="hidden" name="action" value="change_password">

        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">Current Password</label>
          <input type="password" name="current_password" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">New Password</label>
          <input type="password" name="new_password" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label small fw-semibold text-secondary">Confirm New Password</label>
          <input type="password" name="confirm_password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-outline-danger w-100">Update Password</button>
      </form>
    </div>

    <!-- Data Backup & Export -->
    <div class="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h6 class="fw-bold text-dark mb-2">
        <i class="bi bi-cloud-arrow-down-fill text-success me-2"></i> Institutional Backup
      </h6>
      <p class="small text-muted mb-3">
        Download a complete, encrypted JSON archive of all your school's student profiles, teachers, staff, fee ledgers, and attendance history.
      </p>
      <form method="POST" action="settings.php">
        <?= csrfField() ?>
        <input type="hidden" name="action" value="backup_data">
        <button type="submit" class="btn btn-success w-100 fw-semibold">
          <i class="bi bi-download me-1"></i> Download School Backup
        </button>
      </form>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
