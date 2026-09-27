<?php
/**
 * Pending Fees & Defaulters Registry
 */
require_once __DIR__ . '/includes/header.php';

$filterClass = $_GET['class'] ?? '';

// Fetch all classes
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

$sql = "SELECT f.*, s.student_name, s.father_name, s.father_mobile, s.roll_number, s.class_name, s.section, s.admission_number
        FROM fees f
        JOIN students s ON f.student_id = s.id
        WHERE f.school_id = ? AND f.status IN ('PENDING', 'PARTIAL') AND f.remaining_amount > 0";
$params = [$schoolId];

if (!empty($filterClass)) {
    $sql .= " AND s.class_name = ?";
    $params[] = $filterClass;
}
$sql .= " ORDER BY f.remaining_amount DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$defaulters = $stmt->fetchAll();

$totalOutstanding = 0;
foreach ($defaulters as $d) {
    $totalOutstanding += (float)$d['remaining_amount'];
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Outstanding Dues & Defaulters</h3>
    <p class="text-muted small mb-0">Total Outstanding Balance: <strong class="text-danger"><?= formatCurrency($totalOutstanding) ?></strong> across <?= count($defaulters) ?> pending invoices.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="collect_fee.php" class="btn btn-success btn-sm"><i class="bi bi-wallet2 me-1"></i> Receive Fee</a>
    <button onclick="window.print()" class="btn btn-outline-secondary btn-sm"><i class="bi bi-printer me-1"></i> Print Defaulter List</button>
  </div>
</div>

<!-- Class Filter Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="pending_fees.php" class="row g-3 align-items-end">
    <div class="col-sm-6 col-md-4">
      <label class="form-label small fw-semibold text-secondary">Filter by Class</label>
      <select name="class" class="form-select" onchange="this.form.submit()">
        <option value="">All Classes</option>
        <?php foreach ($classes as $c): ?>
          <option value="<?= e($c) ?>" <?= $filterClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="col-sm-6 col-md-3">
      <button type="submit" class="btn btn-secondary w-100">Filter Defaulters</button>
    </div>
  </form>
</div>

<!-- Table Card -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Student & Father</th>
          <th>Class & Roll</th>
          <th>Contact Phone</th>
          <th>Fee Period</th>
          <th>Monthly Fee</th>
          <th>Paid So Far</th>
          <th class="text-danger">Outstanding Balance</th>
          <th class="pe-4 text-end no-print">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($defaulters)): ?>
          <tr>
            <td colspan="8" class="text-center py-5 text-success fw-bold">
              <i class="bi bi-check-circle fs-1 d-block mb-2 text-success"></i>
              No pending fees found for this selection! All accounts are up-to-date.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($defaulters as $row): ?>
            <tr>
              <td class="ps-4">
                <div class="fw-bold text-dark"><?= e($row['student_name']) ?></div>
                <small class="text-muted">Father: <?= e($row['father_name']) ?></small>
              </td>
              <td>
                <span class="badge bg-light text-dark border"><?= e($row['class_name']) ?> (Roll <?= e($row['roll_number']) ?>)</span>
              </td>
              <td class="font-monospace small"><?= e($row['father_mobile']) ?></td>
              <td class="fw-semibold text-primary"><?= e($row['month']) ?> <?= $row['year'] ?></td>
              <td><?= formatCurrency($row['monthly_fee']) ?></td>
              <td class="text-success"><?= formatCurrency($row['paid_amount']) ?></td>
              <td class="fw-bold text-danger"><?= formatCurrency($row['remaining_amount']) ?></td>
              <td class="pe-4 text-end no-print">
                <a href="collect_fee.php?student_id=<?= $row['student_id'] ?>&month=<?= urlencode($row['month']) ?>&year=<?= $row['year'] ?>" class="btn btn-sm btn-outline-success">
                  <i class="bi bi-cash me-1"></i> Collect
                </a>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
