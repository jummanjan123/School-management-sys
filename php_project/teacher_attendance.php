<?php
/**
 * Faculty / Teacher Daily Attendance Registry
 */
require_once __DIR__ . '/includes/header.php';

$date = $_GET['date'] ?? date('Y-m-d');
$successMessage = '';
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $subDate = $_POST['date'] ?? $date;
    $attData = $_POST['attendance'] ?? [];

    if (!empty($attData)) {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("INSERT INTO teacher_attendance (school_id, teacher_id, date, status)
                                   VALUES (?, ?, ?, ?)
                                   ON DUPLICATE KEY UPDATE status = VALUES(status)");
            foreach ($attData as $teachId => $status) {
                if (in_array($status, ['Present', 'Absent', 'Leave'])) {
                    $stmt->execute([$schoolId, (int)$teachId, $subDate, $status]);
                }
            }
            logActivity($pdo, $schoolId, $userId, 'Attendance Saved', 'TeacherAttendance', $subDate, "Marked faculty attendance for $subDate");
            $pdo->commit();
            $successMessage = "Teacher attendance successfully saved for " . formatDate($subDate) . "!";
            $date = $subDate;
        } catch (Exception $e) {
            $pdo->rollBack();
            $errorMessage = "Error saving attendance: " . $e->getMessage();
        }
    }
}

// Fetch teachers with attendance on date
$stmt = $pdo->prepare("SELECT t.*, a.status as attendance_status 
                       FROM teachers t
                       LEFT JOIN teacher_attendance a ON t.id = a.teacher_id AND a.date = ? AND a.school_id = ?
                       WHERE t.school_id = ? AND t.status = 'Active'
                       ORDER BY t.full_name ASC");
$stmt->execute([$date, $schoolId, $schoolId]);
$teachers = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Teacher & Faculty Attendance</h3>
    <p class="text-muted small mb-0">Record and review daily teacher attendance for faculty accountability.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="attendance_report.php" class="btn btn-outline-primary btn-sm"><i class="bi bi-bar-chart me-1"></i> Attendance Reports</a>
    <button onclick="window.print()" class="btn btn-outline-secondary btn-sm"><i class="bi bi-printer me-1"></i> Print Sheet</button>
  </div>
</div>

<?php if (!empty($successMessage)): ?>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <i class="bi bi-check-circle-fill me-2"></i> <?= e($successMessage) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  </div>
<?php endif; ?>

<!-- Date Filter Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="teacher_attendance.php" class="row g-3 align-items-end">
    <div class="col-sm-6 col-md-4">
      <label class="form-label small fw-semibold text-secondary">Attendance Date</label>
      <div class="input-group">
        <span class="input-group-text bg-light"><i class="bi bi-calendar-event"></i></span>
        <input type="date" name="date" class="form-control" value="<?= e($date) ?>" required onchange="this.form.submit()">
      </div>
    </div>
    <div class="col-sm-6 col-md-3">
      <button type="submit" class="btn btn-secondary w-100">Load Date Sheet</button>
    </div>
  </form>
</div>

<form method="POST" action="teacher_attendance.php?date=<?= urlencode($date) ?>">
  <?= csrfField() ?>
  <input type="hidden" name="date" value="<?= e($date) ?>">

  <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
      <h5 class="fw-bold mb-0 text-dark">
        <i class="bi bi-person-video3 text-primary me-2"></i> Faculty Attendance — <?= formatDate($date) ?>
      </h5>
      <button type="button" class="btn btn-sm btn-outline-success no-print" onclick="markAll('Present')">
        <i class="bi bi-check-all me-1"></i> Mark All Present
      </button>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small text-uppercase text-secondary">
          <tr>
            <th class="ps-4">Emp ID</th>
            <th>Teacher Name & Subject</th>
            <th>Level</th>
            <th class="pe-4 text-center" style="width: 320px;">Status</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($teachers)): ?>
            <tr>
              <td colspan="4" class="text-center py-5 text-muted">No active teachers registered.</td>
            </tr>
          <?php else: ?>
            <?php foreach ($teachers as $t): ?>
              <?php $cur = $t['attendance_status'] ?? 'Present'; ?>
              <tr>
                <td class="ps-4 font-monospace fw-semibold text-primary"><?= e($t['employee_id']) ?></td>
                <td>
                  <div class="fw-bold text-dark"><?= e($t['full_name']) ?></div>
                  <small class="text-muted"><?= e($t['designation']) ?> • <?= e($t['subject'] ?: 'General') ?></small>
                </td>
                <td><span class="badge bg-primary-subtle text-primary border border-primary-subtle"><?= e($t['teaching_level']) ?></span></td>
                <td class="pe-4 text-center">
                  <div class="btn-group btn-group-sm w-100">
                    <input type="radio" class="btn-check att-radio-present" name="attendance[<?= $t['id'] ?>]" id="tp_<?= $t['id'] ?>" value="Present" <?= $cur === 'Present' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-success fw-semibold" for="tp_<?= $t['id'] ?>"><i class="bi bi-check-lg"></i> Present</label>

                    <input type="radio" class="btn-check" name="attendance[<?= $t['id'] ?>]" id="ta_<?= $t['id'] ?>" value="Absent" <?= $cur === 'Absent' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-danger fw-semibold" for="ta_<?= $t['id'] ?>"><i class="bi bi-x-lg"></i> Absent</label>

                    <input type="radio" class="btn-check" name="attendance[<?= $t['id'] ?>]" id="tl_<?= $t['id'] ?>" value="Leave" <?= $cur === 'Leave' ? 'checked' : '' ?>>
                    <label class="btn btn-outline-warning text-dark fw-semibold" for="tl_<?= $t['id'] ?>"><i class="bi bi-clock-history"></i> Leave</label>
                  </div>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

    <?php if (!empty($teachers)): ?>
      <div class="card-footer bg-white p-3 text-end no-print">
        <button type="submit" class="btn btn-primary px-4 fw-bold shadow-sm">
          <i class="bi bi-save me-1"></i> Save Teacher Attendance
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
