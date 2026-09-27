<?php
/**
 * Support Staff Management Directory
 */
require_once __DIR__ . '/includes/header.php';

$search = trim($_GET['search'] ?? '');
$filterDesignation = trim($_GET['designation'] ?? '');

$sql = "SELECT * FROM staff WHERE school_id = ?";
$params = [$schoolId];

if (!empty($search)) {
    $sql .= " AND (full_name LIKE ? OR staff_code LIKE ? OR cnic LIKE ? OR mobile LIKE ?)";
    $like = "%$search%";
    array_push($params, $like, $like, $like, $like);
}
if (!empty($filterDesignation)) {
    $sql .= " AND designation = ?";
    $params[] = $filterDesignation;
}
$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$staffList = $stmt->fetchAll();

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    verifyCsrfToken();
    $deleteId = (int)$_POST['id'];
    $stmt = $pdo->prepare("DELETE FROM staff WHERE id = ? AND school_id = ?");
    $stmt->execute([$deleteId, $schoolId]);
    logActivity($pdo, $schoolId, $userId, 'Staff Deleted', 'Staff', (string)$deleteId, "Deleted staff record #$deleteId");
    header("Location: staff.php?msg=deleted");
    exit;
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Other Support Staff</h3>
    <p class="text-muted small mb-0">Non-teaching staff: administration, security, custodial, laboratory, and transportation.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="universal_add.php?type=staff" class="btn btn-success shadow-sm">
      <i class="bi bi-person-plus-fill me-1"></i> + Add Staff
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary">
      <i class="bi bi-printer me-1"></i> Print Roster
    </button>
  </div>
</div>

<!-- Search & Filter Card -->
<div class="card border-0 shadow-sm rounded-3 mb-4 no-print">
  <div class="card-body p-3">
    <form method="GET" action="staff.php" class="row g-2 align-items-center">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
          <input type="text" name="search" class="form-control bg-light" placeholder="Search by Name, Staff ID, CNIC or Mobile..." value="<?= e($search) ?>">
        </div>
      </div>
      <div class="col-md-4">
        <select name="designation" class="form-select bg-light">
          <option value="">All Designations</option>
          <option value="Clerk" <?= $filterDesignation === 'Clerk' ? 'selected' : '' ?>>Clerk</option>
          <option value="Computer Operator" <?= $filterDesignation === 'Computer Operator' ? 'selected' : '' ?>>Computer Operator</option>
          <option value="Security Guard" <?= $filterDesignation === 'Security Guard' ? 'selected' : '' ?>>Security Guard</option>
          <option value="Peon" <?= $filterDesignation === 'Peon' ? 'selected' : '' ?>>Peon</option>
          <option value="Mali" <?= $filterDesignation === 'Mali' ? 'selected' : '' ?>>Mali</option>
          <option value="PTI" <?= $filterDesignation === 'PTI' ? 'selected' : '' ?>>PTI</option>
          <option value="Driver" <?= $filterDesignation === 'Driver' ? 'selected' : '' ?>>Driver</option>
        </select>
      </div>
      <div class="col-md-2 d-flex gap-2">
        <button type="submit" class="btn btn-secondary w-100">Filter</button>
        <?php if (!empty($search) || !empty($filterDesignation)): ?>
          <a href="staff.php" class="btn btn-outline-danger" title="Clear Filters"><i class="bi bi-x-lg"></i></a>
        <?php endif; ?>
      </div>
    </form>
  </div>
</div>

<!-- Staff Table -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Staff ID</th>
          <th>Staff Name</th>
          <th>Designation</th>
          <th>Mobile</th>
          <th>Salary</th>
          <th>Status</th>
          <th class="pe-4 text-end no-print">Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($staffList)): ?>
          <tr>
            <td colspan="7" class="text-center py-5 text-muted">
              <i class="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
              No staff members recorded yet. <a href="universal_add.php?type=staff" class="text-success fw-semibold">Add staff</a> now.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($staffList as $st): ?>
            <tr>
              <td class="ps-4 font-monospace fw-semibold text-success"><?= e($st['staff_code']) ?></td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <?php if (!empty($st['photo_path'])): ?>
                    <img src="<?= e($st['photo_path']) ?>" class="rounded-circle shadow-sm" style="width: 38px; height: 38px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-circle bg-success bg-opacity-10 text-success fw-bold d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                      <?= mb_substr($st['full_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                  <div>
                    <span class="text-dark fw-bold d-block"><?= e($st['full_name']) ?></span>
                    <small class="text-muted"><?= e($st['father_name'] ?: 'Staff Member') ?></small>
                  </div>
                </div>
              </td>
              <td><span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><?= e($st['designation']) ?></span></td>
              <td class="font-monospace small"><?= e($st['mobile']) ?></td>
              <td class="fw-semibold text-dark"><?= formatCurrency($st['salary']) ?></td>
              <td><span class="badge <?= $st['status'] === 'Active' ? 'bg-success' : 'bg-secondary' ?>"><?= e($st['status']) ?></span></td>
              <td class="pe-4 text-end no-print">
                <div class="btn-group btn-group-sm">
                  <a href="id_cards.php?type=staff&id=<?= $st['id'] ?>" class="btn btn-outline-success" title="Print PVC Card (Green)">
                    <i class="bi bi-person-badge"></i> Card
                  </a>
                  <button type="button" class="btn btn-outline-danger" onclick="confirmDelete(<?= $st['id'] ?>, '<?= e(addslashes($st['full_name'])) ?>')" title="Delete">
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
<form id="deleteStaffForm" method="POST" action="staff.php" style="display:none;">
  <?= csrfField() ?>
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="id" id="deleteStaffId">
</form>

<script>
  function confirmDelete(id, name) {
    if (confirm("Are you sure you want to remove staff member '" + name + "'?")) {
      document.getElementById('deleteStaffId').value = id;
      document.getElementById('deleteStaffForm').submit();
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
