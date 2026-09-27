<?php
/**
 * Teacher Management Directory
 */
require_once __DIR__ . '/includes/header.php';

$search = trim($_GET['search'] ?? '');
$filterLevel = trim($_GET['level'] ?? '');
$filterStatus = trim($_GET['status'] ?? '');

$sql = "SELECT * FROM teachers WHERE school_id = ?";
$params = [$schoolId];

if (!empty($search)) {
    $sql .= " AND (full_name LIKE ? OR employee_id LIKE ? OR cnic LIKE ? OR mobile_number LIKE ?)";
    $like = "%$search%";
    array_push($params, $like, $like, $like, $like);
}
if (!empty($filterLevel)) {
    $sql .= " AND teaching_level = ?";
    $params[] = $filterLevel;
}
if (!empty($filterStatus)) {
    $sql .= " AND status = ?";
    $params[] = $filterStatus;
}
$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$teachers = $stmt->fetchAll();

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    verifyCsrfToken();
    $deleteId = (int)$_POST['id'];
    $stmt = $pdo->prepare("DELETE FROM teachers WHERE id = ? AND school_id = ?");
    $stmt->execute([$deleteId, $schoolId]);
    logActivity($pdo, $schoolId, $userId, 'Teacher Deleted', 'Teacher', (string)$deleteId, "Deleted teacher record #$deleteId");
    header("Location: teachers.php?msg=deleted");
    exit;
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Faculty & Teachers</h3>
    <p class="text-muted small mb-0">Manage teaching faculty, credentials, assignments, and PVC ID cards.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="universal_add.php?type=teacher" class="btn btn-primary shadow-sm">
      <i class="bi bi-person-plus-fill me-1"></i> + Add Teacher
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary">
      <i class="bi bi-printer me-1"></i> Print List
    </button>
  </div>
</div>

<!-- Search & Filter Card -->
<div class="card border-0 shadow-sm rounded-3 mb-4 no-print">
  <div class="card-body p-3">
    <form method="GET" action="teachers.php" class="row g-2 align-items-center">
      <div class="col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
          <input type="text" name="search" class="form-control bg-light" placeholder="Search by Name, Employee ID, CNIC or Mobile..." value="<?= e($search) ?>">
        </div>
      </div>
      <div class="col-sm-3 col-md-3">
        <select name="level" class="form-select bg-light">
          <option value="">All Levels (Primary, Middle, High)</option>
          <option value="Primary" <?= $filterLevel === 'Primary' ? 'selected' : '' ?>>Primary</option>
          <option value="Middle" <?= $filterLevel === 'Middle' ? 'selected' : '' ?>>Middle</option>
          <option value="High" <?= $filterLevel === 'High' ? 'selected' : '' ?>>High</option>
        </select>
      </div>
      <div class="col-sm-2 col-md-2">
        <select name="status" class="form-select bg-light">
          <option value="">All Statuses</option>
          <option value="Active" <?= $filterStatus === 'Active' ? 'selected' : '' ?>>Active</option>
          <option value="Inactive" <?= $filterStatus === 'Inactive' ? 'selected' : '' ?>>Inactive</option>
        </select>
      </div>
      <div class="col-sm-2 col-md-2 d-flex gap-2">
        <button type="submit" class="btn btn-secondary w-100">Filter</button>
        <?php if (!empty($search) || !empty($filterLevel) || !empty($filterStatus)): ?>
          <a href="teachers.php" class="btn btn-outline-danger" title="Clear Filters"><i class="bi bi-x-lg"></i></a>
        <?php endif; ?>
      </div>
    </form>
  </div>
</div>

<!-- Teachers Table -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Emp ID / Code</th>
          <th>Teacher Name</th>
          <th>Designation & Subject</th>
          <th>Level</th>
          <th>Mobile</th>
          <th>Status</th>
          <th class="pe-4 text-end no-print">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($teachers)): ?>
          <tr>
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-person-x fs-1 d-block mb-2 text-secondary"></i>
              No teachers found. <a href="universal_add.php?type=teacher" class="text-primary fw-semibold">Add a teacher</a> to get started.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($teachers as $t): ?>
            <tr>
              <td class="ps-4 font-monospace fw-semibold text-primary">
                <?= e($t['employee_id']) ?>
              </td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <?php if (!empty($t['photo_path'])): ?>
                    <img src="<?= e($t['photo_path']) ?>" class="rounded-circle" style="width: 38px; height: 38px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                      <?= mb_substr($t['full_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                  <div>
                    <a href="teacher_view.php?id=<?= $t['id'] ?>" class="text-dark fw-bold text-decoration-none d-block">
                      <?= e($t['full_name']) ?>
                    </a>
                    <small class="text-muted"><?= e($t['qualification'] ?? 'Teacher') ?></small>
                  </div>
                </div>
              </td>
              <td>
                <span class="fw-semibold text-dark"><?= e($t['designation']) ?></span>
                <small class="d-block text-muted"><?= e($t['subject'] ?: 'General') ?></small>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary border border-primary-subtle"><?= e($t['teaching_level']) ?></span>
              </td>
              <td class="font-monospace small"><?= e($t['mobile_number']) ?></td>
              <td>
                <span class="badge <?= $t['status'] === 'Active' ? 'bg-success' : 'bg-secondary' ?>">
                  <?= e($t['status']) ?>
                </span>
              </td>
              <td class="pe-4 text-end no-print">
                <div class="btn-group btn-group-sm">
                  <a href="teacher_view.php?id=<?= $t['id'] ?>" class="btn btn-outline-secondary" title="View Profile & Attendance">
                    <i class="bi bi-eye"></i>
                  </a>
                  <a href="id_cards.php?type=teacher&id=<?= $t['id'] ?>" class="btn btn-outline-warning" title="Teacher PVC Card">
                    <i class="bi bi-person-badge"></i>
                  </a>
                  <button type="button" class="btn btn-outline-danger" onclick="confirmDelete(<?= $t['id'] ?>, '<?= e(addslashes($t['full_name'])) ?>')" title="Delete Teacher">
                    <i class="bi bi-trash"></i>
                  </button>
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
<form id="deleteForm" method="POST" action="teachers.php" style="display:none;">
  <?= csrfField() ?>
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="id" id="deleteId">
</form>

<script>
  function confirmDelete(id, name) {
    if (confirm("Are you sure you want to permanently delete teacher '" + name + "'? All attendance records will be removed.")) {
      document.getElementById('deleteId').value = id;
      document.getElementById('deleteForm').submit();
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
