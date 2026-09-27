<?php
/**
 * Daily Student Attendance Registry
 */
require_once __DIR__ . '/includes/header.php';

$date = $_GET['date'] ?? date('Y-m-d');
$selectedClass = $_GET['class'] ?? '';

// Fetch all classes for the school
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($selectedClass) && !empty($classes)) {
    $selectedClass = $classes[0];
}

$successMessage = '';
$errorMessage = '';

// Handle Attendance Save Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $subDate = $_POST['date'] ?? $date;
    $attendanceData = $_POST['attendance'] ?? []; // student_id => status

    if (!empty($attendanceData)) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO student_attendance (school_id, student_id, date, status) 
                                   VALUES (?, ?, ?, ?) 
                                   ON DUPLICATE KEY UPDATE status = VALUES(status)");
            foreach ($attendanceData as $studId => $status) {
                if (in_array($status, ['Present', 'Absent', 'Leave'])) {
                    $stmt->execute([$schoolId, (int)$studId, $subDate, $status]);
                }
            }
            logActivity($pdo, $schoolId, $userId, 'Attendance Saved', 'StudentAttendance', $subDate, "Marked attendance for $selectedClass on $subDate");
            $pdo->commit();
            $successMessage = "Student attendance for $selectedClass successfully saved for " . formatDate($subDate) . "!";
            $date = $subDate;
        } catch (Exception $e) {
            $pdo->rollBack();
            $errorMessage = "Error saving attendance: " . $e->getMessage();
        }
    }
}

// Fetch students for the selected class
$stmt = $pdo->prepare("SELECT s.*, a.status as attendance_status 
                       FROM students s 
                       LEFT JOIN student_attendance a ON s.id = a.student_id AND a.date = ? AND a.school_id = ?
                       WHERE s.school_id = ? AND s.class_name = ? AND s.status = 'Active'
                       ORDER BY s.roll_number ASC, s.student_name ASC");
$stmt->execute([$date, $schoolId, $schoolId, $selectedClass]);
$students = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Student Daily Attendance</h3>
    <p class="text-muted small mb-0">Record and review student attendance. Prevents duplicates and maintains real-time statistics.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="attendance_report.php" class="btn btn-outline-primary btn-sm">
      <i class="bi bi-bar-chart me-1"></i> Attendance Reports
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary btn-sm">
      <i class="bi bi-printer me-1"></i> Print Sheet
    </button>
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

<!-- Date & Class Filter Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="student_attendance.php" class="row g-3 align-items-end">
    <div class="col-sm-5 col-md-4">
      <label class="form-label small fw-semibold text-secondary">Attendance Date</label>
      <div class="input-group">
        <span class="input-group-text bg-light"><i class="bi bi-calendar-event"></i></span>
        <input type="date" name="date" class="form-control" value="<?= e($date) ?>" required>
      </div>
    </div>
    <div class="col-sm-5 col-md-4">
      <label class="form-label small fw-semibold text-secondary">Class</label>
      <select name="class" class="form-select" onchange="this.form.submit()">
        <?php foreach ($classes as $c): ?>
          <option value="<?= e($c) ?>" <?= $selectedClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="col-sm-2 col-md-2">
      <button type="submit" class="btn btn-secondary w-100">Load Sheet</button>
    </div>
  </form>
</div>

<!-- Attendance Marking Form -->
<form method="POST" action="student_attendance.php?date=<?= urlencode($date) ?>&class=<?= urlencode($selectedClass) ?>">
  <?= csrfField() ?>
  <input type="hidden" name="date" value="<?= e($date) ?>">

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
    <div class="card-header bg-white py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
      <div>
        <h5 class="fw-bold mb-0 text-dark">
          <i class="bi bi-mortarboard-fill text-warning me-2"></i>
          <?= e($selectedClass) ?> Attendance Sheet — <?= formatDate($date) ?>
        </h5>
        <small class="text-muted"><?= count($students) ?> enrolled students found</small>
      </div>
      <div class="no-print">
        <button type="button" class="btn btn-sm btn-outline-success" onclick="markAll('Present')">
          <i class="bi bi-check-all me-1"></i> Mark All Present
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small text-uppercase text-secondary">
          <tr>
            <th class="ps-4" style="width: 100px;">Roll #</th>
            <th>Student Name & Father</th>
            <th>Admission No</th>
            <th class="pe-4 text-center" style="width: 320px;">Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($students)): ?>
            <tr>
              <td colspan="4" class="text-center py-5 text-muted">
                No active students enrolled in <?= e($selectedClass) ?>.
              </td>
            </tr>
          <?php else: ?>
            <?php foreach ($students as $s): ?>
              <?php $cur = $s['attendance_status'] ?? 'Present'; ?>
              <tr>
                <td class="ps-4 fw-bold font-monospace text-primary"><?= e($s['roll_number']) ?></td>
                <td>
                  <div class="fw-bold text-dark"><?= e($s['student_name']) ?></div>
                  <small class="text-muted">Father: <?= e($s['father_name']) ?></small>
                </td>
                <td class="font-monospace text-muted small"><?= e($s['admission_number']) ?></td>
                <td class="pe-4 text-center">
                  <div class="btn-group btn-group-sm w-100" role="group">
                    <input type="radio" class="btn-check att-radio-present" name="attendance[<?= $s['id'] ?>]" id="p_<?= $s['id'] ?>" value="Present" <?= $cur === 'Present' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-success fw-semibold" for="p_<?= $s['id'] ?>"><i class="bi bi-check-lg"></i> Present</label>

                    <input type="radio" class="btn-check att-radio-absent" name="attendance[<?= $s['id'] ?>]" id="a_<?= $s['id'] ?>" value="Absent" <?= $cur === 'Absent' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-danger fw-semibold" for="a_<?= $s['id'] ?>"><i class="bi bi-x-lg"></i> Absent</label>

                    <input type="radio" class="btn-check att-radio-leave" name="attendance[<?= $s['id'] ?>]" id="l_<?= $s['id'] ?>" value="Leave" <?= $cur === 'Leave' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-warning text-dark fw-semibold" for="l_<?= $s['id'] ?>"><i class="bi bi-clock-history"></i> Leave</label>
                  </div>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

    <?php if (!empty($students)): ?>
      <div class="card-footer bg-white p-3 text-end no-print">
        <button type="submit" class="btn btn-primary px-4 fw-bold shadow-sm">
          <i class="bi bi-save me-1"></i> Save Attendance Sheet
        </button>
      </div>
    <?php endif; ?>
  </div>
</form>

<script>
  function markAll(status) {
    if (status === 'Present') {
      document.querySelectorAll('.att-radio-present').forEach(el => el.checked = true);
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
