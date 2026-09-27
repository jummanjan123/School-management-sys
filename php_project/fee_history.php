<?php
/**
 * Fee Payment Transaction History
 */
require_once __DIR__ . '/includes/header.php';

$search = trim($_GET['search'] ?? '');

$sql = "SELECT p.*, s.student_name, s.father_name, s.class_name, s.roll_number, f.month, f.year
        FROM fee_payments p
        JOIN students s ON p.student_id = s.id
        JOIN fees f ON p.fee_id = f.id
        WHERE p.school_id = ?";
$params = [$schoolId];

if (!empty($search)) {
    $sql .= " AND (p.receipt_no LIKE ? OR s.student_name LIKE ? OR s.father_name LIKE ?)";
    $like = "%$search%";
    array_push($params, $like, $like, $like);
}
$sql .= " ORDER BY p.id DESC LIMIT 100";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$payments = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Fee Payment Transactions</h3>
    <p class="text-muted small mb-0">Audit history of all collected tuition receipts and payment slips.</p>
  </div>
  <a href="collect_fee.php" class="btn btn-success btn-sm"><i class="bi bi-wallet2 me-1"></i> Receive Fee</a>
</div>

<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="fee_history.php" class="row g-2 align-items-center">
    <div class="col-md-9">
      <div class="input-group">
        <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
        <input type="text" name="search" class="form-control bg-light" placeholder="Search by Receipt Number, Student Name, Father..." value="<?= e($search) ?>">
      </div>
    </div>
    <div class="col-md-3 d-flex gap-2">
      <button type="submit" class="btn btn-secondary w-100">Search Receipts</button>
      <?php if (!empty($search)): ?>
        <a href="fee_history.php" class="btn btn-outline-danger"><i class="bi bi-x-lg"></i></a>
      <?php endif; ?>
    </div>
  </form>
</div>

<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Receipt No</th>
          <th>Date</th>
          <th>Student Details</th>
          <th>Billing Month</th>
          <th>Paid Amount</th>
          <th>Mode</th>
          <th>Received By</th>
          <th class="pe-4 text-end no-print">Receipt</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($payments)): ?>
          <tr>
            <td colspan="8" class="text-center py-5 text-muted">No payment records found.</td>
          </tr>
        <?php else: ?>
          <?php foreach ($payments as $p): ?>
            <tr>
              <td class="ps-4 font-monospace fw-bold text-primary"><?= e($p['receipt_no']) ?></td>
              <td><?= formatDate($p['payment_date']) ?></td>
              <td>
                <div class="fw-bold text-dark"><?= e($p['student_name']) ?></div>
                <small class="text-muted"><?= e($p['class_name']) ?> (Roll <?= e($p['roll_number']) ?>)</small>
              </td>
              <td><span class="badge bg-light text-dark border"><?= e($p['month']) ?> <?= $p['year'] ?></span></td>
              <td class="fw-bold text-success"><?= formatCurrency($p['paid_amount']) ?></td>
              <td><span class="badge bg-secondary-subtle text-secondary"><?= e($p['payment_method']) ?></span></td>
              <td class="small text-muted"><?= e($p['collected_by'] ?: 'Admin') ?></td>
              <td class="pe-4 text-end no-print">
                <a href="fee_receipt.php?receipt_no=<?= urlencode($p['receipt_no']) ?>" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-printer me-1"></i> View Receipt
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
