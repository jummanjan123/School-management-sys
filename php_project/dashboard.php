<?php
/**
 * School Management System - Main Dashboard
 */
require_once __DIR__ . '/includes/header.php';

$today = date('Y-m-d');

// 1. Fetch counts
$stmt = $pdo->prepare("SELECT COUNT(*) FROM students WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totalStudents = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM teachers WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totalTeachers = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM staff WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totalStaff = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM inventory WHERE school_id = ?");
$stmt->execute([$schoolId]);
$totalInventory = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM classes WHERE school_id = ?");
$stmt->execute([$schoolId]);
$totalClasses = (int)$stmt->fetchColumn();

// 2. Fetch Fee summary
$stmt = $pdo->prepare("SELECT COALESCE(SUM(paid_amount), 0) FROM fee_payments WHERE school_id = ?");
$stmt->execute([$schoolId]);
$totalFeesCollected = (float)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COALESCE(SUM(remaining_amount), 0) FROM fees WHERE school_id = ? AND status IN ('PENDING', 'PARTIAL')");
$stmt->execute([$schoolId]);
$totalPendingFees = (float)$stmt->fetchColumn();

// 3. Today's attendance summaries
$stmt = $pdo->prepare("SELECT 
    COUNT(*) as marked,
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent,
    SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as on_leave
FROM student_attendance WHERE school_id = ? AND date = ?");
$stmt->execute([$schoolId, $today]);
$studentAtt = $stmt->fetch();

$stmt = $pdo->prepare("SELECT 
    COUNT(*) as marked,
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
FROM teacher_attendance WHERE school_id = ? AND date = ?");
$stmt->execute([$schoolId, $today]);
$teacherAtt = $stmt->fetch();

$stmt = $pdo->prepare("SELECT 
    COUNT(*) as marked,
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
FROM staff_attendance WHERE school_id = ? AND date = ?");
$stmt->execute([$schoolId, $today]);
$staffAtt = $stmt->fetch();

// 4. Fetch recent activities
$stmt = $pdo->prepare("SELECT * FROM activity_logs WHERE school_id = ? ORDER BY created_at DESC LIMIT 8");
$stmt->execute([$schoolId]);
$recentActivities = $stmt->fetchAll();
?>

<!-- Welcome Banner -->
<div class="row mb-4">
  <div class="col-12">
    <div class="card border-0 shadow-sm rounded-4 text-white overflow-hidden" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
      <div class="card-body p-4 p-md-5 position-relative">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <span class="badge bg-warning text-dark px-3 py-1 mb-2 fw-semibold rounded-pill">Academic Year <?= e($currentSchool['academic_session']) ?></span>
            <h2 class="display-6 fw-bold mb-2">Welcome, <?= e($currentSchool['name']) ?></h2>
            <p class="mb-3 text-white-50">Head Administrator Portal: Real-time records, student tracking, fees ledger and PVC card generator.</p>
            <div class="urdu-font fs-5 text-warning fw-bold">
              "<?= e($currentSchool['urdu_slogan']) ?>"
            </div>
          </div>
          <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <a href="universal_add.php" class="btn btn-warning text-dark fw-bold px-4 py-2 shadow-sm rounded-pill">
              <i class="bi bi-plus-circle-fill me-1"></i> Quick Add Record
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Quick Action Shortcuts -->
<div class="row g-2 mb-4">
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="student_add.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-warning bg-opacity-25 text-warning"><i class="bi bi-person-plus-fill"></i></div>
      <span class="small fw-semibold">+ Add Student</span>
    </a>
  </div>
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="teacher_add.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-primary bg-opacity-25 text-primary"><i class="bi bi-person-video3"></i></div>
      <span class="small fw-semibold">+ Add Teacher</span>
    </a>
  </div>
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="staff_add.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-success bg-opacity-25 text-success"><i class="bi bi-people"></i></div>
      <span class="small fw-semibold">+ Add Staff</span>
    </a>
  </div>
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="inventory_add.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-info bg-opacity-25 text-info"><i class="bi bi-box-seam"></i></div>
      <span class="small fw-semibold">+ Add Inventory</span>
    </a>
  </div>
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="student_attendance.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-danger bg-opacity-25 text-danger"><i class="bi bi-check2-circle"></i></div>
      <span class="small fw-semibold">Attendance</span>
    </a>
  </div>
  <div class="col-6 col-md-3 col-lg-auto">
    <a href="collect_fee.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-success bg-opacity-25 text-success"><i class="bi bi-cash"></i></div>
      <span class="small fw-semibold">Collect Fee</span>
    </a>
  </div>
  <div class="col-12 col-md-6 col-lg-auto">
    <a href="id_cards.php" class="btn btn-white border shadow-sm w-100 py-2 text-start d-flex align-items-center gap-2">
      <div class="p-2 rounded bg-secondary bg-opacity-25 text-secondary"><i class="bi bi-person-badge"></i></div>
      <span class="small fw-semibold">Print ID Cards</span>
    </a>
  </div>
</div>

<!-- Primary Metric Cards -->
<div class="row g-3 mb-4">
  <!-- Total Students -->
  <div class="col-sm-6 col-xl-3">
    <div class="card card-metric p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <span class="text-muted small text-uppercase fw-semibold">Total Students</span>
          <h3 class="fw-bold my-1 text-warning"><?= number_format($totalStudents) ?></h3>
          <span class="badge bg-warning-subtle text-warning-emphasis">Active Enrolled</span>
        </div>
        <div class="p-3 rounded-circle bg-warning bg-opacity-10 text-warning fs-3">
          <i class="bi bi-mortarboard-fill"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Total Teachers -->
  <div class="col-sm-6 col-xl-3">
    <div class="card card-metric p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <span class="text-muted small text-uppercase fw-semibold">Total Teachers</span>
          <h3 class="fw-bold my-1 text-primary"><?= number_format($totalTeachers) ?></h3>
          <span class="badge bg-primary-subtle text-primary">Faculty Staff</span>
        </div>
        <div class="p-3 rounded-circle bg-primary bg-opacity-10 text-primary fs-3">
          <i class="bi bi-person-video3"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Total Other Staff -->
  <div class="col-sm-6 col-xl-3">
    <div class="card card-metric p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <span class="text-muted small text-uppercase fw-semibold">Other Staff</span>
          <h3 class="fw-bold my-1 text-success"><?= number_format($totalStaff) ?></h3>
          <span class="badge bg-success-subtle text-success">Support Staff</span>
        </div>
        <div class="p-3 rounded-circle bg-success bg-opacity-10 text-success fs-3">
          <i class="bi bi-people-fill"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Inventory Items -->
  <div class="col-sm-6 col-xl-3">
    <div class="card card-metric p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <span class="text-muted small text-uppercase fw-semibold">Inventory Items</span>
          <h3 class="fw-bold my-1 text-info"><?= number_format($totalInventory) ?></h3>
          <span class="badge bg-info-subtle text-info">School Assets</span>
        </div>
        <div class="p-3 rounded-circle bg-info bg-opacity-10 text-info fs-3">
          <i class="bi bi-box-seam-fill"></i>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Secondary Attendance & Financial Cards -->
<div class="row g-3 mb-4">
  <!-- Today's Student Attendance -->
  <div class="col-md-4">
    <div class="card card-metric p-3 h-100">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="fw-bold text-dark">Today's Student Attendance</span>
        <span class="badge bg-light text-muted border"><?= date('d M') ?></span>
      </div>
      <div class="d-flex align-items-baseline gap-2 mb-2">
        <h4 class="fw-bold text-success mb-0"><?= (int)($studentAtt['present'] ?? 0) ?></h4>
        <span class="text-muted small">/ <?= $totalStudents ?> Enrolled</span>
      </div>
      <div class="progress mb-2" style="height: 8px;">
        <?php $studRate = $totalStudents > 0 ? round((($studentAtt['present'] ?? 0) / $totalStudents) * 100, 1) : 0; ?>
        <div class="progress-bar bg-success" style="width: <?= $studRate ?>%"></div>
      </div>
      <div class="d-flex justify-content-between small text-muted">
        <span>Absent: <strong><?= (int)($studentAtt['absent'] ?? 0) ?></strong></span>
        <span>Leave: <strong><?= (int)($studentAtt['on_leave'] ?? 0) ?></strong></span>
        <span>Present Rate: <strong><?= $studRate ?>%</strong></span>
      </div>
    </div>
  </div>

  <!-- Today's Teacher Attendance -->
  <div class="col-md-4">
    <div class="card card-metric p-3 h-100">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="fw-bold text-dark">Faculty Attendance</span>
        <span class="badge bg-light text-muted border"><?= date('d M') ?></span>
      </div>
      <div class="d-flex align-items-baseline gap-2 mb-2">
        <h4 class="fw-bold text-primary mb-0"><?= (int)($teacherAtt['present'] ?? 0) ?></h4>
        <span class="text-muted small">/ <?= $totalTeachers ?> Teachers</span>
      </div>
      <div class="progress mb-2" style="height: 8px;">
        <?php $teachRate = $totalTeachers > 0 ? round((($teacherAtt['present'] ?? 0) / $totalTeachers) * 100, 1) : 0; ?>
        <div class="progress-bar bg-primary" style="width: <?= $teachRate ?>%"></div>
      </div>
      <div class="d-flex justify-content-between small text-muted">
        <span>Marked Today: <strong><?= (int)($teacherAtt['marked'] ?? 0) ?></strong></span>
        <span>Faculty Rate: <strong><?= $teachRate ?>%</strong></span>
      </div>
    </div>
  </div>

  <!-- Fees Summary -->
  <div class="col-md-4">
    <div class="card card-metric p-3 h-100 bg-light-subtle">
      <span class="fw-bold text-dark mb-2 d-block">Fee Accounts Ledger</span>
      <div class="row g-2 mb-2">
        <div class="col-6">
          <small class="text-muted d-block">Total Collected</small>
          <span class="fs-6 fw-bold text-success"><?= formatCurrency($totalFeesCollected) ?></span>
        </div>
        <div class="col-6">
          <small class="text-muted d-block">Outstanding</small>
          <span class="fs-6 fw-bold text-danger"><?= formatCurrency($totalPendingFees) ?></span>
        </div>
      </div>
      <a href="collect_fee.php" class="btn btn-sm btn-outline-success w-100 mt-2">
        <i class="bi bi-wallet2 me-1"></i> Receive Fee Payment
      </a>
    </div>
  </div>
</div>

<!-- Recent Activity Log Table -->
<div class="card border-0 shadow-sm rounded-3">
  <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
    <h5 class="card-title fw-bold mb-0 text-dark">
      <i class="bi bi-clock-history me-2 text-primary"></i> Recent Audit & Activity Logs
    </h5>
    <span class="badge bg-secondary-subtle text-secondary">Multi-Tenant Protected</span>
  </div>
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small text-uppercase text-secondary">
          <tr>
            <th class="ps-4">Action</th>
            <th>Category</th>
            <th>Details</th>
            <th>IP Address</th>
            <th class="pe-4 text-end">Date & Time</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($recentActivities)): ?>
            <tr>
              <td colspan="5" class="text-center py-4 text-muted">No recent activities recorded yet.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($recentActivities as $log): ?>
              <tr>
                <td class="ps-4 fw-semibold text-dark">
                  <i class="bi bi-check-circle-fill text-success me-1"></i>
                  <?= e($log['action']) ?>
                </td>
                <td><span class="badge bg-light text-dark border"><?= e($log['record_type']) ?></span></td>
                <td class="small text-muted"><?= e($log['details'] ?? '-') ?></td>
                <td class="small text-muted font-monospace"><?= e($log['ip_address'] ?? '127.0.0.1') ?></td>
                <td class="pe-4 text-end small text-muted"><?= date('d M Y, h:i A', strtotime($log['created_at'])) ?></td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
