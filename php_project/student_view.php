<?php
/**
 * Student Profile, Attendance Statistics & Fee History
 */
require_once __DIR__ . '/includes/header.php';

$studentId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM students WHERE id = ? AND school_id = ? LIMIT 1");
$stmt->execute([$studentId, $schoolId]);
$student = $stmt->fetch();

if (!$student) {
    header("Location: students.php");
    exit;
}

// Attendance Stats
$stmt = $pdo->prepare("SELECT 
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
    SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
    SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leave_days
FROM student_attendance WHERE school_id = ? AND student_id = ?");
$stmt->execute([$schoolId, $studentId]);
$attStats = $stmt->fetch();

$totalDays = (int)($attStats['total_days'] ?? 0);
$presentDays = (int)($attStats['present_days'] ?? 0);
$absentDays = (int)($attStats['absent_days'] ?? 0);
$leaveDays = (int)($attStats['leave_days'] ?? 0);
$attendancePct = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0.00;

// Fee Invoices
$stmt = $pdo->prepare("SELECT * FROM fees WHERE school_id = ? AND student_id = ? ORDER BY year DESC, id DESC");
$stmt->execute([$schoolId, $studentId]);
$feeInvoices = $stmt->fetchAll();

// Payment Transactions
$stmt = $pdo->prepare("SELECT * FROM fee_payments WHERE school_id = ? AND student_id = ? ORDER BY payment_date DESC LIMIT 10");
$stmt->execute([$schoolId, $studentId]);
$payments = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1"><?= e($student['student_name']) ?></h3>
    <p class="text-muted small mb-0">Admission #<?= e($student['admission_number']) ?> • <?= e($student['class_name']) ?> (<?= e($student['section']) ?>)</p>
  </div>
  <div class="d-flex flex-wrap gap-2 no-print">
    <a href="students.php" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Students</a>
    <a href="collect_fee.php?student_id=<?= $student['id'] ?>" class="btn btn-success btn-sm"><i class="bi bi-cash me-1"></i> Collect Fee</a>
    <a href="id_cards.php?type=student&id=<?= $student['id'] ?>" class="btn btn-warning text-dark btn-sm fw-semibold"><i class="bi bi-person-badge me-1"></i> PVC Card</a>
    <a href="character_certificate.php?student_id=<?= $student['id'] ?>" class="btn btn-info text-white btn-sm"><i class="bi bi-award me-1"></i> Character Cert</a>
    <a href="leaving_certificate.php?student_id=<?= $student['id'] ?>" class="btn btn-danger btn-sm"><i class="bi bi-file-earmark-text me-1"></i> Leaving Cert</a>
  </div>
</div>

<div class="row g-4">
  <!-- Profile Column -->
  <div class="col-lg-4">
    <div class="card border-0 shadow-sm rounded-4 text-center p-4">
      <div class="mb-3">
        <?php if (!empty($student['photo_path'])): ?>
          <img src="<?= e($student['photo_path']) ?>" class="rounded-circle shadow" style="width: 110px; height: 110px; object-fit: cover; border: 4px solid #f59e0b;">
        <?php else: ?>
          <div class="rounded-circle bg-warning bg-opacity-20 text-warning-emphasis fw-bold mx-auto d-flex align-items-center justify-content-center" style="width: 110px; height: 110px; font-size: 2.5rem; border: 4px solid #f59e0b;">
            <?= mb_substr($student['student_name'], 0, 1) ?>
          </div>
        <?php endif; ?>
      </div>
      <h5 class="fw-bold text-dark mb-1"><?= e($student['student_name']) ?></h5>
      <span class="badge bg-warning text-dark px-3 py-1 mb-3"><?= e($student['class_name']) ?> - Roll #<?= e($student['roll_number']) ?></span>

      <div class="text-start border-top pt-3 small">
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Father's Name:</span>
          <span class="fw-bold text-dark"><?= e($student['father_name']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Father's Mobile:</span>
          <span class="fw-semibold font-monospace"><?= e($student['father_mobile']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Mother's Name:</span>
          <span class="fw-semibold"><?= e($student['mother_name'] ?: '-') ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Gender / DOB:</span>
          <span><?= e($student['gender']) ?> • <?= formatDate($student['date_of_birth']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Admission Date:</span>
          <span><?= formatDate($student['admission_date']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Monthly Fee:</span>
          <span class="fw-bold text-success"><?= formatCurrency($student['monthly_fee']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Address:</span>
          <span class="text-end"><?= e($student['address'] ?: '-') ?></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Performance & Finance Column -->
  <div class="col-lg-8">
    <!-- Attendance Statistics -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
      <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart-fill text-warning me-2"></i> Attendance Statistics</h5>
      <div class="row g-3 text-center">
        <div class="col-3">
          <div class="p-3 bg-light rounded-3">
            <small class="text-muted d-block">Working Days</small>
            <h4 class="fw-bold text-dark my-1"><?= $totalDays ?></h4>
          </div>
        </div>
        <div class="col-3">
          <div class="p-3 bg-success bg-opacity-10 rounded-3">
            <small class="text-success d-block">Present</small>
            <h4 class="fw-bold text-success my-1"><?= $presentDays ?></h4>
          </div>
        </div>
        <div class="col-3">
          <div class="p-3 bg-danger bg-opacity-10 rounded-3">
            <small class="text-danger d-block">Absent</small>
            <h4 class="fw-bold text-danger my-1"><?= $absentDays ?></h4>
          </div>
        </div>
        <div class="col-3">
          <div class="p-3 bg-warning bg-opacity-10 rounded-3">
            <small class="text-warning-emphasis d-block">Leave</small>
            <h4 class="fw-bold text-warning-emphasis my-1"><?= $leaveDays ?></h4>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="fw-bold text-dark">Overall Attendance Rate</span>
          <span class="fw-bold fs-5 text-warning-emphasis"><?= $attendancePct ?>%</span>
        </div>
        <div class="progress" style="height: 12px;">
          <div class="progress-bar bg-warning" style="width: <?= $attendancePct ?>%"></div>
        </div>
      </div>
    </div>

    <!-- Fee Invoices Ledger -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-receipt me-2 text-success"></i> Tuition Fee Invoices</h6>
        <a href="collect_fee.php?student_id=<?= $student['id'] ?>" class="btn btn-sm btn-outline-success">Receive Fee</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small text-uppercase text-secondary">
            <tr>
              <th class="ps-4">Month/Year</th>
              <th>Tuition Fee</th>
              <th>Discount</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th class="pe-4 text-end">Status</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($feeInvoices)): ?>
              <tr>
                <td colspan="6" class="text-center py-3 text-muted">No fee records generated yet.</td>
              </tr>
            <?php else: ?>
              <?php foreach ($feeInvoices as $f): ?>
                <tr>
                  <td class="ps-4 fw-semibold"><?= e($f['month']) ?> <?= $f['year'] ?></td>
                  <td><?= formatCurrency($f['monthly_fee']) ?></td>
                  <td><?= formatCurrency($f['discount']) ?></td>
                  <td class="text-success fw-bold"><?= formatCurrency($f['paid_amount']) ?></td>
                  <td class="text-danger fw-bold"><?= formatCurrency($f['remaining_amount']) ?></td>
                  <td class="pe-4 text-end">
                    <?php if ($f['status'] === 'PAID'): ?>
                      <span class="badge bg-success">PAID</span>
                    <?php elseif ($f['status'] === 'PARTIAL'): ?>
                      <span class="badge bg-warning text-dark">PARTIAL</span>
                    <?php else: ?>
                      <span class="badge bg-danger">PENDING</span>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
