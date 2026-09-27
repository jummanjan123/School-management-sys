<?php
/**
 * Analytical Attendance Reports & Performance Summary
 */
require_once __DIR__ . '/includes/header.php';

$role = $_GET['role'] ?? 'student';
$startDate = $_GET['start_date'] ?? date('Y-m-01');
$endDate = $_GET['end_date'] ?? date('Y-m-d');
$filterClass = $_GET['class'] ?? '';

// Fetch Classes
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

$reportRows = [];

if ($role === 'student') {
    $sql = "SELECT s.id, s.student_code as code, s.student_name as name, s.roll_number, s.class_name,
                   COUNT(a.id) as total_marked,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                   SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                   SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) as leave_count
            FROM students s
            LEFT JOIN student_attendance a ON s.id = a.student_id AND a.date BETWEEN ? AND ? AND a.school_id = ?
            WHERE s.school_id = ? AND s.status = 'Active'";
    $params = [$startDate, $endDate, $schoolId, $schoolId];
    if (!empty($filterClass)) {
        $sql .= " AND s.class_name = ?";
        $params[] = $filterClass;
    }
    $sql .= " GROUP BY s.id ORDER BY s.class_name, s.roll_number ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $reportRows = $stmt->fetchAll();

} elseif ($role === 'teacher') {
    $sql = "SELECT t.id, t.employee_id as code, t.full_name as name, t.designation as sub_title, t.teaching_level,
                   COUNT(a.id) as total_marked,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                   SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                   SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) as leave_count
            FROM teachers t
            LEFT JOIN teacher_attendance a ON t.id = a.teacher_id AND a.date BETWEEN ? AND ? AND a.school_id = ?
            WHERE t.school_id = ? AND t.status = 'Active'
            GROUP BY t.id ORDER BY t.full_name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$startDate, $endDate, $schoolId, $schoolId]);
    $reportRows = $stmt->fetchAll();

} else {
    // staff
    $sql = "SELECT st.id, st.staff_code as code, st.full_name as name, st.designation as sub_title,
                   COUNT(a.id) as total_marked,
                   SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_count,
                   SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
                   SUM(CASE WHEN a.status = 'Leave' THEN 1 ELSE 0 END) as leave_count
            FROM staff st
            LEFT JOIN staff_attendance a ON st.id = a.staff_id AND a.date BETWEEN ? AND ? AND a.school_id = ?
            WHERE st.school_id = ? AND st.status = 'Active'
            GROUP BY st.id ORDER BY st.full_name ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$startDate, $endDate, $schoolId, $schoolId]);
    $reportRows = $stmt->fetchAll();
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Attendance Analytics & Reports</h3>
    <p class="text-muted small mb-0">Period: <?= formatDate($startDate) ?> to <?= formatDate($endDate) ?> • Multi-role tracking</p>
  </div>
  <button onclick="window.print()" class="btn btn-outline-secondary">
    <i class="bi bi-printer me-1"></i> Print Official Report
  </button>
</div>

<!-- Filters Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="attendance_report.php" class="row g-3 align-items-end">
    <div class="col-sm-3">
      <label class="form-label small fw-semibold text-secondary">Target Category</label>
      <select name="role" class="form-select" onchange="this.form.submit()">
        <option value="student" <?= $role === 'student' ? 'selected' : '' ?>>Students</option>
        <option value="teacher" <?= $role === 'teacher' ? 'selected' : '' ?>>Teachers</option>
        <option value="staff" <?= $role === 'staff' ? 'selected' : '' ?>>Other Staff</option>
      </select>
    </div>

    <div class="col-sm-3">
      <label class="form-label small fw-semibold text-secondary">From Date</label>
      <input type="date" name="start_date" class="form-control" value="<?= e($startDate) ?>">
    </div>

    <div class="col-sm-3">
      <label class="form-label small fw-semibold text-secondary">To Date</label>
      <input type="date" name="end_date" class="form-control" value="<?= e($endDate) ?>">
    </div>

    <?php if ($role === 'student'): ?>
      <div class="col-sm-2">
        <label class="form-label small fw-semibold text-secondary">Class</label>
        <select name="class" class="form-select">
          <option value="">All Classes</option>
          <?php foreach ($classes as $c): ?>
            <option value="<?= e($c) ?>" <?= $filterClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
    <?php endif; ?>

    <div class="col-sm-1">
      <button type="submit" class="btn btn-primary w-100"><i class="bi bi-funnel"></i></button>
    </div>
  </form>
</div>

<!-- Report Table -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">ID / Code</th>
          <th>Name</th>
          <th>Details</th>
          <th class="text-center">Total Days</th>
          <th class="text-center text-success">Present</th>
          <th class="text-center text-danger">Absent</th>
          <th class="text-center text-warning">Leave</th>
          <th class="pe-4 text-end">Attendance %</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($reportRows)): ?>
          <tr>
            <td colspan="8" class="text-center py-5 text-muted">No attendance data recorded for this selection.</td>
          </tr>
        <?php else: ?>
          <?php foreach ($reportRows as $row): ?>
            <?php 
              $tot = (int)$row['total_marked'];
              $pres = (int)$row['present_count'];
              $pct = $tot > 0 ? round(($pres / $tot) * 100, 1) : 0.0;
            ?>
            <tr>
              <td class="ps-4 font-monospace fw-semibold text-primary"><?= e($row['code']) ?></td>
              <td class="fw-bold text-dark"><?= e($row['name']) ?></td>
              <td>
                <?php if ($role === 'student'): ?>
                  <span class="badge bg-light text-dark border"><?= e($row['class_name']) ?> (Roll <?= e($row['roll_number']) ?>)</span>
                <?php else: ?>
                  <span class="badge bg-light text-dark border"><?= e($row['sub_title']) ?></span>
                <?php endif; ?>
              </td>
              <td class="text-center fw-bold"><?= $tot ?></td>
              <td class="text-center fw-bold text-success"><?= $pres ?></td>
              <td class="text-center fw-bold text-danger"><?= (int)$row['absent_count'] ?></td>
              <td class="text-center fw-bold text-warning-emphasis"><?= (int)$row['leave_count'] ?></td>
              <td class="pe-4 text-end">
                <div class="d-flex align-items-center justify-content-end gap-2">
                  <div class="progress flex-grow-1" style="width: 70px; height: 6px;">
                    <div class="progress-bar <?= $pct >= 80 ? 'bg-success' : ($pct >= 60 ? 'bg-warning' : 'bg-danger') ?>" style="width: <?= $pct ?>%"></div>
                  </div>
                  <span class="fw-bold small"><?= $pct ?>%</span>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
