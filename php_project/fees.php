<?php
/**
 * Class-wise Fee Ledger & Accounting Setup
 */
require_once __DIR__ . '/includes/header.php';

$month = $_GET['month'] ?? date('F');
$year = (int)($_GET['year'] ?? date('Y'));
$selectedClass = $_GET['class'] ?? '';

// Fetch all classes
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

if (empty($selectedClass) && !empty($classes)) {
    $selectedClass = $classes[0];
}

// Fetch or generate fee records for this class & month
$stmt = $pdo->prepare("SELECT s.id as student_id, s.student_name, s.father_name, s.roll_number, s.monthly_fee as default_fee,
                              f.id as fee_id, f.monthly_fee, f.previous_balance, f.discount, f.paid_amount, f.remaining_amount, f.status
                       FROM students s
                       LEFT JOIN fees f ON s.id = f.student_id AND f.month = ? AND f.year = ? AND f.school_id = ?
                       WHERE s.school_id = ? AND s.class_name = ? AND s.status = 'Active'
                       ORDER BY s.roll_number ASC");
$stmt->execute([$month, $year, $schoolId, $schoolId, $selectedClass]);
$studentFees = $stmt->fetchAll();

$monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Tuition Fee Ledger</h3>
    <p class="text-muted small mb-0">Class-wise fee overview, payment statuses, and student accounting.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="collect_fee.php" class="btn btn-success shadow-sm">
      <i class="bi bi-wallet2 me-1"></i> + Collect Fee
    </a>
    <a href="pending_fees.php" class="btn btn-outline-danger">
      <i class="bi bi-exclamation-circle me-1"></i> Defaulters List
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary">
      <i class="bi bi-printer me-1"></i> Print Ledger
    </button>
  </div>
</div>

<!-- Month & Class Selection Form -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="fees.php" class="row g-3 align-items-end">
    <div class="col-sm-4 col-md-3">
      <label class="form-label small fw-semibold text-secondary">Billing Month</label>
      <select name="month" class="form-select" onchange="this.form.submit()">
        <?php foreach ($monthsList as $m): ?>
          <option value="<?= $m ?>" <?= $month === $m ? 'selected' : '' ?>><?= $m ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="col-sm-4 col-md-2">
      <label class="form-label small fw-semibold text-secondary">Year</label>
      <select name="year" class="form-select" onchange="this.form.submit()">
        <?php for ($y = date('Y') - 1; $y <= date('Y') + 1; $y++): ?>
          <option value="<?= $y ?>" <?= $year === $y ? 'selected' : '' ?>><?= $y ?></option>
        <?php endfor; ?>
      </select>
    </div>

    <div class="col-sm-4 col-md-4">
      <label class="form-label small fw-semibold text-secondary">Class</label>
      <select name="class" class="form-select" onchange="this.form.submit()">
        <?php foreach ($classes as $c): ?>
          <option value="<?= e($c) ?>" <?= $selectedClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <div class="col-sm-12 col-md-3">
      <button type="submit" class="btn btn-secondary w-100">Load Class Ledger</button>
    </div>
  </form>
</div>

<!-- Class Ledger Card -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
  <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
    <h5 class="fw-bold mb-0 text-dark">
      <i class="bi bi-journal-text text-primary me-2"></i>
      <?= e($selectedClass) ?> Fee Ledger — <?= e($month) ?> <?= $year ?>
    </h5>
    <span class="badge bg-primary-subtle text-primary border border-primary-subtle"><?= count($studentFees) ?> Students</span>
  </div>

  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Roll</th>
          <th>Student & Father</th>
          <th>Monthly Fee</th>
          <th>Previous</th>
          <th>Discount</th>
          <th class="text-success">Paid Amount</th>
          <th class="text-danger">Remaining</th>
          <th>Status</th>
          <th class="pe-4 text-end no-print">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($studentFees)): ?>
          <tr>
            <td colspan="9" class="text-center py-5 text-muted">No students enrolled in <?= e($selectedClass) ?>.</td>
          </tr>
        <?php else: ?>
          <?php foreach ($studentFees as $sf): ?>
            <?php 
              $mFee = (float)($sf['monthly_fee'] ?? $sf['default_fee']);
              $prev = (float)($sf['previous_balance'] ?? 0.00);
              $disc = (float)($sf['discount'] ?? 0.00);
              $paid = (float)($sf['paid_amount'] ?? 0.00);
              $rem  = (float)($sf['remaining_amount'] ?? ($mFee + $prev - $disc - $paid));
              $stat = $sf['status'] ?? ($paid > 0 ? ($rem <= 0 ? 'PAID' : 'PARTIAL') : 'PENDING');
            ?>
            <tr>
              <td class="ps-4 fw-bold font-monospace text-primary"><?= e($sf['roll_number']) ?></td>
              <td>
                <div class="fw-bold text-dark"><?= e($sf['student_name']) ?></div>
                <small class="text-muted"><?= e($sf['father_name']) ?></small>
              </td>
              <td class="fw-semibold text-dark"><?= formatCurrency($mFee) ?></td>
              <td class="text-muted"><?= formatCurrency($prev) ?></td>
              <td class="text-muted"><?= formatCurrency($disc) ?></td>
              <td class="text-success fw-bold"><?= formatCurrency($paid) ?></td>
              <td class="text-danger fw-bold"><?= formatCurrency($rem) ?></td>
              <td>
                <?php if ($stat === 'PAID'): ?>
                  <span class="badge bg-success">PAID</span>
                <?php elseif ($stat === 'PARTIAL'): ?>
                  <span class="badge bg-warning text-dark">PARTIAL</span>
                <?php else: ?>
                  <span class="badge bg-danger">PENDING</span>
                <?php endif; ?>
              </td>
              <td class="pe-4 text-end no-print">
                <a href="collect_fee.php?student_id=<?= $sf['student_id'] ?>&month=<?= urlencode($month) ?>&year=<?= $year ?>" 
                   class="btn btn-sm btn-outline-success">
                  <i class="bi bi-wallet2 me-1"></i> Receive
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
