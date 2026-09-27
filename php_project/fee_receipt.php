<?php
/**
 * Professional Official Fee Payment Receipt
 */
require_once __DIR__ . '/includes/header.php';

$receiptNo = $_GET['receipt_no'] ?? '';

$stmt = $pdo->prepare("SELECT p.*, f.month, f.year, f.monthly_fee, f.previous_balance, f.discount, f.remaining_amount,
                              s.student_name, s.father_name, s.roll_number, s.class_name, s.section, s.admission_number
                       FROM fee_payments p
                       JOIN fees f ON p.fee_id = f.id
                       JOIN students s ON p.student_id = s.id
                       WHERE p.receipt_no = ? AND p.school_id = ?
                       LIMIT 1");
$stmt->execute([$receiptNo, $schoolId]);
$receipt = $stmt->fetch();

if (!$receipt) {
    echo "<div class='alert alert-danger'>Receipt not found or invalid.</div>";
    require_once __DIR__ . '/includes/footer.php';
    exit;
}

$logoPath = !empty($currentSchool['logo_path']) ? $currentSchool['logo_path'] : null;
$stampPath = !empty($currentSchool['stamp_path']) ? $currentSchool['stamp_path'] : null;
$sigPath = !empty($currentSchool['signature_path']) ? $currentSchool['signature_path'] : null;
?>

<div class="d-flex justify-content-between align-items-center mb-4 no-print">
  <div>
    <h3 class="fw-bold text-dark mb-1">Official Fee Receipt</h3>
    <p class="text-muted small mb-0">Receipt #: <span class="font-monospace fw-bold text-dark"><?= e($receipt['receipt_no']) ?></span></p>
  </div>
  <div class="d-flex gap-2">
    <a href="fees.php" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Fee Ledger</a>
    <a href="collect_fee.php" class="btn btn-outline-primary btn-sm"><i class="bi bi-wallet2 me-1"></i> Receive Another</a>
    <button onclick="window.print()" class="btn btn-success btn-sm"><i class="bi bi-printer-fill me-1"></i> Print Receipt</button>
  </div>
</div>

<!-- Receipt Container (Designed for crisp A5 or standard thermal / paper print) -->
<div class="d-flex justify-content-center">
  <div class="card border shadow-sm rounded-4 p-4 p-sm-5 bg-white" style="max-width: 720px; width: 100%;">
    
    <!-- Receipt Header -->
    <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
      <div class="d-flex align-items-center gap-3">
        <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
          <img src="<?= e($logoPath) ?>" alt="School Logo" class="rounded-circle shadow-sm" style="width: 70px; height: 70px; object-fit: cover; border: 3px solid #1e40af;">
        <?php else: ?>
          <div style="width: 70px; height: 70px;">
            <?= generateSchoolLogoSvg($currentSchool['name']) ?>
          </div>
        <?php endif; ?>
        <div>
          <h4 class="fw-bold text-dark mb-1 text-uppercase"><?= e($currentSchool['name']) ?></h4>
          <div class="text-muted small"><?= e($currentSchool['address'] ?: 'Campus Head Office') ?></div>
          <div class="text-muted small">Phone: <?= e($currentSchool['phone'] ?: 'Official Contact') ?></div>
        </div>
      </div>
      <div class="text-end">
        <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 fs-6 fw-bold">FEE RECEIPT</span>
        <div class="font-monospace fw-bold text-dark small mt-2">No: <?= e($receipt['receipt_no']) ?></div>
        <div class="text-muted small">Date: <?= formatDate($receipt['payment_date']) ?></div>
      </div>
    </div>

    <!-- Urdu Slogan -->
    <div class="urdu-font text-center text-primary fw-bold mb-4" style="font-size: 1.1rem;">
      "<?= e($currentSchool['urdu_slogan']) ?>"
    </div>

    <!-- Student Information Grid -->
    <div class="bg-light rounded-3 p-3 mb-4">
      <div class="row g-2 small">
        <div class="col-sm-6">
          <span class="text-muted">Student Name:</span>
          <strong class="text-dark ms-1"><?= e($receipt['student_name']) ?></strong>
        </div>
        <div class="col-sm-6">
          <span class="text-muted">Admission No:</span>
          <strong class="text-dark font-monospace ms-1"><?= e($receipt['admission_number']) ?></strong>
        </div>
        <div class="col-sm-6">
          <span class="text-muted">Father's Name:</span>
          <strong class="text-dark ms-1"><?= e($receipt['father_name']) ?></strong>
        </div>
        <div class="col-sm-6">
          <span class="text-muted">Class & Roll:</span>
          <strong class="text-dark ms-1"><?= e($receipt['class_name']) ?> (<?= e($receipt['section']) ?>) • Roll: <?= e($receipt['roll_number']) ?></strong>
        </div>
        <div class="col-sm-6">
          <span class="text-muted">Fee Period:</span>
          <strong class="text-primary ms-1"><?= e($receipt['month']) ?> <?= $receipt['year'] ?></strong>
        </div>
        <div class="col-sm-6">
          <span class="text-muted">Payment Mode:</span>
          <strong class="text-dark ms-1"><?= e($receipt['payment_method']) ?></strong>
        </div>
      </div>
    </div>

    <!-- Financial Accounting Breakdown Table -->
    <table class="table table-bordered mb-4 align-middle">
      <thead class="table-light small text-uppercase">
        <tr>
          <th>Description</th>
          <th class="text-end" style="width: 180px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Current Tuition Fee (<?= e($receipt['month']) ?> <?= $receipt['year'] ?>)</td>
          <td class="text-end fw-semibold"><?= formatCurrency($receipt['monthly_fee']) ?></td>
        </tr>
        <tr>
          <td>Previous Arrears / Balance</td>
          <td class="text-end"><?= formatCurrency($receipt['previous_balance']) ?></td>
        </tr>
        <?php if ((float)$receipt['discount'] > 0): ?>
          <tr>
            <td class="text-success">Concession / Discount Approved</td>
            <td class="text-end text-success">- <?= formatCurrency($receipt['discount']) ?></td>
          </tr>
        <?php endif; ?>
        <tr class="table-active fw-bold">
          <td>Total Net Payable</td>
          <td class="text-end">
            <?= formatCurrency(($receipt['monthly_fee'] + $receipt['previous_balance']) - $receipt['discount']) ?>
          </td>
        </tr>
        <tr class="table-success fw-bold text-success fs-6">
          <td>AMOUNT RECEIVED (PAID)</td>
          <td class="text-end text-success"><?= formatCurrency($receipt['paid_amount']) ?></td>
        </tr>
        <tr class="fw-bold <?= (float)$receipt['remaining_amount'] > 0 ? 'text-danger' : 'text-muted' ?>">
          <td>Remaining Balance Dues</td>
          <td class="text-end"><?= formatCurrency($receipt['remaining_amount']) ?></td>
        </tr>
      </tbody>
    </table>

    <?php if (!empty($receipt['notes'])): ?>
      <div class="small text-muted mb-4">
        <em>Remarks: <?= e($receipt['notes']) ?></em>
      </div>
    <?php endif; ?>

    <!-- Authorized Signatures and Stamp Section -->
    <div class="row align-items-end pt-4 mt-2">
      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <?php if ($sigPath && file_exists(__DIR__ . '/' . $sigPath)): ?>
            <img src="<?= e($sigPath) ?>" style="max-height: 50px; max-width: 140px;">
          <?php else: ?>
            <div class="text-muted small fst-italic">Authorized Signature</div>
          <?php endif; ?>
        </div>
        <div class="border-top pt-1 small fw-semibold text-secondary">
          Cashier / Accountant
        </div>
      </div>

      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <?php if ($stampPath && file_exists(__DIR__ . '/' . $stampPath)): ?>
            <img src="<?= e($stampPath) ?>" style="max-height: 55px; max-width: 100px;">
          <?php else: ?>
            <div class="rounded-circle border border-danger border-2 text-danger p-2 small fw-bold text-uppercase d-inline-block" style="transform: rotate(-10deg);">
              Official Stamp
            </div>
          <?php endif; ?>
        </div>
        <div class="border-top pt-1 small fw-semibold text-secondary">
          School Seal
        </div>
      </div>

      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <div class="text-dark fw-bold small"><?= e($currentSchool['head_name'] ?: 'Principal') ?></div>
        </div>
        <div class="border-top pt-1 small fw-semibold text-secondary">
          Head of Institution
        </div>
      </div>
    </div>

    <!-- Print Footer Note -->
    <div class="text-center text-muted small mt-4 pt-3 border-top" style="font-size: 0.72rem;">
      This is an authentic computer generated receipt issued by <?= e($currentSchool['name']) ?>.
    </div>

  </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
