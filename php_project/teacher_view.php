<?php
/**
 * Teacher Profile & Individual Attendance Report
 */
require_once __DIR__ . '/includes/header.php';

$teacherId = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM teachers WHERE id = ? AND school_id = ? LIMIT 1");
$stmt->execute([$teacherId, $schoolId]);
$teacher = $stmt->fetch();

if (!$teacher) {
    header("Location: teachers.php");
    exit;
}

// Fetch Attendance Statistics
$stmt = $pdo->prepare("SELECT 
    COUNT(*) as total_days,
    SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
    SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
    SUM(CASE WHEN status = 'Leave' THEN 1 ELSE 0 END) as leave_days
FROM teacher_attendance WHERE school_id = ? AND teacher_id = ?");
$stmt->execute([$schoolId, $teacherId]);
$attStats = $stmt->fetch();

$totalDays = (int)($attStats['total_days'] ?? 0);
$presentDays = (int)($attStats['present_days'] ?? 0);
$absentDays = (int)($attStats['absent_days'] ?? 0);
$leaveDays = (int)($attStats['leave_days'] ?? 0);
$attendancePct = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0.00;

// Fetch Attendance Logs (Last 30 records)
$stmt = $pdo->prepare("SELECT * FROM teacher_attendance WHERE school_id = ? AND teacher_id = ? ORDER BY date DESC LIMIT 30");
$stmt->execute([$schoolId, $teacherId]);
$attendanceLogs = $stmt->fetchAll();
?>

<div class="d-flex justify-content-between align-items-center mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1"><?= e($teacher['full_name']) ?></h3>
    <p class="text-muted small mb-0">Teacher Profile & Attendance Statistics</p>
  </div>
  <div class="d-flex gap-2 no-print">
    <a href="teachers.php" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Back to Teachers</a>
    <a href="id_cards.php?type=teacher&id=<?= $teacher['id'] ?>" class="btn btn-primary btn-sm"><i class="bi bi-person-badge me-1"></i> Print PVC Card</a>
    <button onclick="window.print()" class="btn btn-outline-dark btn-sm"><i class="bi bi-printer me-1"></i> Print Report</button>
  </div>
</div>

<div class="row g-4">
  <!-- Profile Summary Card -->
  <div class="col-lg-4">
    <div class="card border-0 shadow-sm rounded-4 text-center p-4">
      <div class="mb-3">
        <?php if (!empty($teacher['photo_path'])): ?>
          <img src="<?= e($teacher['photo_path']) ?>" class="rounded-circle shadow" style="width: 110px; height: 110px; object-fit: cover; border: 4px solid #2563eb;">
        <?php else: ?>
          <div class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold mx-auto d-flex align-items-center justify-content-center" style="width: 110px; height: 110px; font-size: 2.5rem; border: 4px solid #2563eb;">
            <?= mb_substr($teacher['full_name'], 0, 1) ?>
          </div>
        <?php endif; ?>
      </div>
      <h5 class="fw-bold text-dark mb-1"><?= e($teacher['full_name']) ?></h5>
      <span class="badge bg-primary px-3 py-1 mb-3"><?= e($teacher['designation']) ?></span>

      <div class="text-start border-top pt-3 small">
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Employee ID:</span>
          <span class="fw-bold font-monospace"><?= e($teacher['employee_id']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Teaching Level:</span>
          <span class="fw-semibold"><?= e($teacher['teaching_level']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Subject:</span>
          <span class="fw-semibold"><?= e($teacher['subject'] ?: 'All') ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Mobile:</span>
          <span class="fw-semibold font-monospace"><?= e($teacher['mobile_number']) ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">CNIC:</span>
          <span class="fw-semibold font-monospace"><?= e($teacher['cnic'] ?: '-') ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Qualification:</span>
          <span class="fw-semibold"><?= e($teacher['qualification'] ?: '-') ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Father / Husband:</span>
          <span class="fw-semibold"><?= e($teacher['father_name'] ?: '-') ?></span>
        </div>
        <div class="d-flex justify-content-between py-1">
          <span class="text-muted">Status:</span>
          <span class="badge <?= $teacher['status'] === 'Active' ? 'bg-success' : 'bg-secondary' ?>"><?= e($teacher['status']) ?></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Attendance Statistics & History -->
  <div class="col-lg-8">
    <!-- Attendance Stat Cards -->
    <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
      <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart-fill text-primary me-2"></i> Attendance Performance Summary</h5>
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
          <span class="fw-bold text-dark">Overall Attendance Ratio</span>
          <span class="fw-bold fs-5 text-primary"><?= $attendancePct ?>%</span>
        </div>
        <div class="progress" style="height: 12px;">
          <div class="progress-bar bg-primary" style="width: <?= $attendancePct ?>%"></div>
        </div>
      </div>
    </div>

    <!-- Attendance Log Table -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-header bg-white py-3">
        <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-calendar3 me-2 text-primary"></i> Attendance History</h6>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light small text-uppercase text-secondary">
            <tr>
              <th class="ps-4">Date</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <?php if (empty($attendanceLogs)): ?>
              <tr>
                <td colspan="3" class="text-center py-4 text-muted">No attendance records found yet.</td>
              </tr>
            <?php else: ?>
              <?php foreach ($attendanceLogs as $log): ?>
                <tr>
                  <td class="ps-4 fw-semibold"><?= formatDate($log['date']) ?></td>
                  <td>
                    <?php if ($log['status'] === 'Present'): ?>
                      <span class="badge bg-success">Present</span>
                    <?php elseif ($log['status'] === 'Absent'): ?>
                      <span class="badge bg-danger">Absent</span>
                    <?php else: ?>
                      <span class="badge bg-warning text-dark">Leave</span>
                    <?php endif; ?>
                  </td>
                  <td class="small text-muted"><?= e($log['remarks'] ?: '-') ?></td>
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
