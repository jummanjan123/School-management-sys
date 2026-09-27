<?php
/**
 * Student Information System Directory
 */
require_once __DIR__ . '/includes/header.php';

$search = trim($_GET['search'] ?? '');
$filterClass = trim($_GET['class'] ?? '');
$filterStatus = trim($_GET['status'] ?? '');

// Fetch classes for filter
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

$sql = "SELECT * FROM students WHERE school_id = ?";
$params = [$schoolId];

if (!empty($search)) {
    $sql .= " AND (student_name LIKE ? OR father_name LIKE ? OR roll_number LIKE ? OR admission_number LIKE ? OR father_mobile LIKE ?)";
    $like = "%$search%";
    array_push($params, $like, $like, $like, $like, $like);
}
if (!empty($filterClass)) {
    $sql .= " AND class_name = ?";
    $params[] = $filterClass;
}
if (!empty($filterStatus)) {
    $sql .= " AND status = ?";
    $params[] = $filterStatus;
}
$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    verifyCsrfToken();
    $deleteId = (int)$_POST['id'];
    $stmt = $pdo->prepare("DELETE FROM students WHERE id = ? AND school_id = ?");
    $stmt->execute([$deleteId, $schoolId]);
    logActivity($pdo, $schoolId, $userId, 'Student Deleted', 'Student', (string)$deleteId, "Deleted student record #$deleteId");
    header("Location: students.php?msg=deleted");
    exit;
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Student Records & Admissions</h3>
    <p class="text-muted small mb-0">Complete student roster, class lists, printable PVC cards, character and leaving certificates.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="universal_add.php?type=student" class="btn btn-warning text-dark fw-bold shadow-sm">
      <i class="bi bi-mortarboard-fill me-1"></i> + New Admission
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary">
      <i class="bi bi-printer me-1"></i> Print Roster
    </button>
  </div>
</div>

<!-- Search & Filter Card -->
<div class="card border-0 shadow-sm rounded-3 mb-4 no-print">
  <div class="card-body p-3">
    <form method="GET" action="students.php" class="row g-2 align-items-center">
      <div class="col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
          <input type="text" name="search" class="form-control bg-light" placeholder="Search by Name, Father, Roll, Admission No..." value="<?= e($search) ?>">
        </div>
      </div>
      <div class="col-sm-3 col-md-3">
        <select name="class" class="form-select bg-light">
          <option value="">All Classes</option>
          <?php foreach ($classes as $c): ?>
            <option value="<?= e($c) ?>" <?= $filterClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="col-sm-2 col-md-2">
        <select name="status" class="form-select bg-light">
          <option value="">All Statuses</option>
          <option value="Active" <?= $filterStatus === 'Active' ? 'selected' : '' ?>>Active</option>
          <option value="Inactive" <?= $filterStatus === 'Inactive' ? 'selected' : '' ?>>Inactive</option>
          <option value="Left" <?= $filterStatus === 'Left' ? 'selected' : '' ?>>Left</option>
        </select>
      </div>
      <div class="col-sm-2 col-md-2 d-flex gap-2">
        <button type="submit" class="btn btn-secondary w-100">Filter</button>
        <?php if (!empty($search) || !empty($filterClass) || !empty($filterStatus)): ?>
          <a href="students.php" class="btn btn-outline-danger" title="Clear Filters"><i class="bi bi-x-lg"></i></a>
        <?php endif; ?>
      </div>
    </form>
  </div>
</div>

<!-- Students Table -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Adm # / Roll</th>
          <th>Student Details</th>
          <th>Class & Sec</th>
          <th>Father / Mobile</th>
          <th>Monthly Fee</th>
          <th>Status</th>
          <th class="pe-4 text-end no-print">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($students)): ?>
          <tr>
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-mortarboard fs-1 d-block mb-2 text-secondary"></i>
              No students found. <a href="universal_add.php?type=student" class="text-primary fw-semibold">Admit a student</a> now.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($students as $s): ?>
            <tr>
              <td class="ps-4">
                <span class="fw-bold font-monospace text-dark"><?= e($s['admission_number']) ?></span>
                <span class="badge bg-light text-secondary border d-block mt-1">Roll: <?= e($s['roll_number']) ?></span>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <?php if (!empty($s['photo_path'])): ?>
                    <img src="<?= e($s['photo_path']) ?>" class="rounded-circle shadow-sm" style="width: 40px; height: 40px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-circle bg-warning bg-opacity-20 text-warning-emphasis fw-bold d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                      <?= mb_substr($s['student_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                  <div>
                    <a href="student_view.php?id=<?= $s['id'] ?>" class="text-dark fw-bold text-decoration-none">
                      <?= e($s['student_name']) ?>
                    </a>
                    <small class="text-muted d-block"><?= e($s['gender']) ?> • Adm: <?= formatDate($s['admission_date']) ?></small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2 py-1">
                  <?= e($s['class_name']) ?> (<?= e($s['section']) ?>)
                </span>
              </td>
              <td>
                <div class="text-dark fw-semibold"><?= e($s['father_name']) ?></div>
                <div class="font-monospace small text-muted"><i class="bi bi-telephone me-1"></i><?= e($s['father_mobile']) ?></div>
              </td>
              <td class="fw-semibold text-dark"><?= formatCurrency($s['monthly_fee']) ?></td>
              <td>
                <span class="badge <?= $s['status'] === 'Active' ? 'bg-success' : 'bg-secondary' ?>">
                  <?= e($s['status']) ?>
                </span>
              </td>
              <td class="pe-4 text-end no-print">
                <div class="dropdown">
                  <button class="btn btn-sm btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Actions
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><a class="dropdown-item" href="student_view.php?id=<?= $s['id'] ?>"><i class="bi bi-eye text-primary me-2"></i> View Profile & Stats</a></li>
                    <li><a class="dropdown-item" href="collect_fee.php?student_id=<?= $s['id'] ?>"><i class="bi bi-cash text-success me-2"></i> Collect Fee</a></li>
                    <li><a class="dropdown-item" href="id_cards.php?type=student&id=<?= $s['id'] ?>"><i class="bi bi-person-badge text-warning me-2"></i> PVC ID Card (Yellow)</a></li>
                    <li><a class="dropdown-item" href="character_certificate.php?student_id=<?= $s['id'] ?>"><i class="bi bi-award text-info me-2"></i> Character Certificate</a></li>
                    <li><a class="dropdown-item" href="leaving_certificate.php?student_id=<?= $s['id'] ?>"><i class="bi bi-file-earmark-text text-danger me-2"></i> Leaving Certificate</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button type="button" class="dropdown-item text-danger" onclick="confirmDelete(<?= $s['id'] ?>, '<?= e(addslashes($s['student_name'])) ?>')"><i class="bi bi-trash me-2"></i> Delete Student</button></li>
                  </ul>
                </div>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Hidden Delete Form -->
<form id="deleteStudentForm" method="POST" action="students.php" style="display:none;">
  <?= csrfField() ?>
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="id" id="deleteStudentId">
</form>

<script>
  function confirmDelete(id, name) {
    if (confirm("Are you sure you want to permanently delete student '" + name + "'? All fee records and attendance will be removed.")) {
      document.getElementById('deleteStudentId').value = id;
      document.getElementById('deleteStudentForm').submit();
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
