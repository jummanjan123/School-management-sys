<?php
/**
 * Analytical Reports & Export Center
 */
require_once __DIR__ . '/includes/header.php';

$reportType = $_GET['type'] ?? 'student_summary';

// Overall counts
$stmt = $pdo->prepare("SELECT COUNT(*) FROM students WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totStudents = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM teachers WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totTeachers = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM staff WHERE school_id = ? AND status = 'Active'");
$stmt->execute([$schoolId]);
$totStaff = (int)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COALESCE(SUM(paid_amount), 0) FROM fee_payments WHERE school_id = ?");
$stmt->execute([$schoolId]);
$totCollected = (float)$stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COALESCE(SUM(remaining_amount), 0) FROM fees WHERE school_id = ? AND status IN ('PENDING', 'PARTIAL')");
$stmt->execute([$schoolId]);
$totPending = (float)$stmt->fetchColumn();

// Class-wise breakdown
$stmt = $pdo->prepare("SELECT class_name, COUNT(*) as count, SUM(monthly_fee) as expected_revenue 
                       FROM students WHERE school_id = ? AND status = 'Active' 
                       GROUP BY class_name ORDER BY class_name ASC");
$stmt->execute([$schoolId]);
$classBreakdown = $stmt->fetchAll();
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">Administrative Reports & Analytics</h3>
    <p class="text-muted small mb-0">Official institutional reports, student rosters, financial analytics, and inventory audit.</p>
  </div>
  <button onclick="window.print()" class="btn btn-primary"><i class="bi bi-printer me-1"></i> Print Current Report</button>
</div>

<!-- Report Navigation Tabs -->
<div class="card border-0 shadow-sm rounded-4 p-2 mb-4 no-print bg-white">
  <div class="d-flex flex-wrap gap-2">
    <a href="reports.php?type=student_summary" class="btn btn-sm <?= $reportType === 'student_summary' ? 'btn-primary' : 'btn-light text-dark' ?>">
      <i class="bi bi-mortarboard me-1"></i> Class-Wise Students
    </a>
    <a href="reports.php?type=fee_collection" class="btn btn-sm <?= $reportType === 'fee_collection' ? 'btn-primary' : 'btn-light text-dark' ?>">
      <i class="bi bi-cash-stack me-1"></i> Fee Collection Summary
    </a>
    <a href="reports.php?type=inventory_audit" class="btn btn-sm <?= $reportType === 'inventory_audit' ? 'btn-primary' : 'btn-light text-dark' ?>">
      <i class="bi bi-box-seam me-1"></i> Inventory Assets Audit
    </a>
    <a href="attendance_report.php" class="btn btn-sm btn-light text-dark">
      <i class="bi bi-calendar-check me-1"></i> Attendance Performance &rarr;
    </a>
  </div>
</div>

<!-- 1. Class-wise Student Report -->
<?php if ($reportType === 'student_summary'): ?>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
    <div class="card-header bg-white py-3">
      <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-table text-primary me-2"></i> Class-wise Student Distribution & Fee Potential</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small text-uppercase text-secondary">
          <tr>
            <th class="ps-4">Class Name</th>
            <th class="text-center">Enrolled Students</th>
            <th class="text-end">Expected Monthly Revenue</th>
            <th class="pe-4 text-end">Roster</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($classBreakdown)): ?>
            <tr><td colspan="4" class="text-center py-4 text-muted">No students enrolled yet.</td></tr>
          <?php else: ?>
            <?php foreach ($classBreakdown as $cb): ?>
              <tr>
                <td class="ps-4 fw-bold text-dark"><?= e($cb['class_name']) ?></td>
                <td class="text-center">
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 fs-6"><?= $cb['count'] ?> Students</span>
                </td>
                <td class="text-end fw-bold text-success"><?= formatCurrency($cb['expected_revenue']) ?></td>
                <td class="pe-4 text-end no-print">
                  <a href="students.php?class=<?= urlencode($cb['class_name']) ?>" class="btn btn-sm btn-outline-secondary">
                    View Class List &rarr;
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

<!-- 2. Fee Collection Summary -->
<?php elseif ($reportType === 'fee_collection'): ?>
  <div class="row g-4 mb-4">
    <div class="col-md-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-success bg-opacity-10 border border-success">
        <span class="text-success small fw-bold text-uppercase">Total Cash Inflow Collected</span>
        <h2 class="display-6 fw-bold text-success my-2"><?= formatCurrency($totCollected) ?></h2>
        <span class="text-muted small">Recorded in fee ledger</span>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-0 shadow-sm rounded-4 p-4 text-center bg-danger bg-opacity-10 border border-danger">
        <span class="text-danger small fw-bold text-uppercase">Total Outstanding Receivables</span>
        <h2 class="display-6 fw-bold text-danger my-2"><?= formatCurrency($totPending) ?></h2>
        <span class="text-muted small">Uncollected tuition fees</span>
      </div>
    </div>
  </div>

  <div class="text-center mb-4 no-print">
    <a href="pending_fees.php" class="btn btn-outline-danger me-2"><i class="bi bi-list-check me-1"></i> View Full Defaulter Roster</a>
    <a href="fee_history.php" class="btn btn-outline-success"><i class="bi bi-receipt me-1"></i> View Payment Receipts</a>
  </div>

<!-- 3. Inventory Audit -->
<?php elseif ($reportType === 'inventory_audit'): ?>
  <?php
    $stmt = $pdo->prepare("SELECT item_category, COUNT(*) as items_count, SUM(quantity) as total_qty, SUM(total_value) as total_val 
                           FROM inventory WHERE school_id = ? GROUP BY item_category");
    $stmt->execute([$schoolId]);
    $catBreakdown = $stmt->fetchAll();
  ?>
  <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
    <div class="card-header bg-white py-3">
      <h5 class="fw-bold mb-0 text-dark"><i class="bi bi-box-seam text-info me-2"></i> Category-wise Asset Valuation</h5>
    </div>
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light small text-uppercase text-secondary">
          <tr>
            <th class="ps-4">Category</th>
            <th class="text-center">Unique Item Types</th>
            <th class="text-center">Total Physical Units</th>
            <th class="pe-4 text-end">Total Valuation</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($catBreakdown)): ?>
            <tr><td colspan="4" class="text-center py-4 text-muted">No inventory recorded.</td></tr>
          <?php else: ?>
            <?php foreach ($catBreakdown as $ib): ?>
              <tr>
                <td class="ps-4 fw-bold text-dark"><?= e($ib['item_category']) ?></td>
                <td class="text-center"><?= $ib['items_count'] ?> items</td>
                <td class="text-center fw-semibold"><?= number_format($ib['total_qty']) ?> units</td>
                <td class="pe-4 text-end fw-bold text-info"><?= formatCurrency($ib['total_val']) ?></td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
