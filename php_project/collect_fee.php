<?php
/**
 * Receive Student Fee Payment
 */
require_once __DIR__ . '/includes/header.php';

$studentId = (int)($_GET['student_id'] ?? 0);
$selectedMonth = $_GET['month'] ?? date('F');
$selectedYear = (int)($_GET['year'] ?? date('Y'));

$successMessage = '';
$errorMessage = '';

// Fetch all active students for dropdown
$studStmt = $pdo->prepare("SELECT id, student_name, father_name, class_name, roll_number, admission_number, monthly_fee 
                           FROM students WHERE school_id = ? AND status = 'Active' 
                           ORDER BY class_name ASC, roll_number ASC");
$studStmt->execute([$schoolId]);
$allStudents = $studStmt->fetchAll();

$currentStudent = null;
if ($studentId > 0) {
    foreach ($allStudents as $st) {
        if ((int)$st['id'] === $studentId) {
            $currentStudent = $st;
            break;
        }
    }
}

// Payment Submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $subStudentId = (int)($_POST['student_id'] ?? 0);
    $subMonth = $_POST['month'] ?? $selectedMonth;
    $subYear = (int)($_POST['year'] ?? $selectedYear);
    $monthlyFee = (float)($_POST['monthly_fee'] ?? 0.00);
    $prevBalance = (float)($_POST['previous_balance'] ?? 0.00);
    $discount = (float)($_POST['discount'] ?? 0.00);
    $paidAmount = (float)($_POST['paid_amount'] ?? 0.00);
    $payMethod = $_POST['payment_method'] ?? 'Cash';
    $notes = trim($_POST['notes'] ?? '');

    if ($subStudentId <= 0 || $paidAmount <= 0) {
        $errorMessage = "Please select a valid student and enter a payment amount greater than zero.";
    } else {
        try {
            $pdo->beginTransaction();

            // 1. Fetch or create fee invoice row
            $feeStmt = $pdo->prepare("SELECT * FROM fees WHERE school_id = ? AND student_id = ? AND month = ? AND year = ? LIMIT 1");
            $feeStmt->execute([$schoolId, $subStudentId, $subMonth, $subYear]);
            $feeRecord = $feeStmt->fetch();

            if ($feeRecord) {
                $feeId = (int)$feeRecord['id'];
                $newPaid = (float)$feeRecord['paid_amount'] + $paidAmount;
                $totalPayable = ($monthlyFee + $prevBalance) - $discount;
                $newRemaining = max(0.00, $totalPayable - $newPaid);
                $status = ($newRemaining <= 0) ? 'PAID' : 'PARTIAL';

                $updStmt = $pdo->prepare("UPDATE fees SET monthly_fee = ?, previous_balance = ?, discount = ?, paid_amount = ?, remaining_amount = ?, status = ? WHERE id = ?");
                $updStmt->execute([$monthlyFee, $prevBalance, $discount, $newPaid, $newRemaining, $status, $feeId]);
            } else {
                $totalPayable = ($monthlyFee + $prevBalance) - $discount;
                $newRemaining = max(0.00, $totalPayable - $paidAmount);
                $status = ($newRemaining <= 0) ? 'PAID' : 'PARTIAL';

                $insStmt = $pdo->prepare("INSERT INTO fees (school_id, student_id, month, year, monthly_fee, previous_balance, discount, paid_amount, remaining_amount, status) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $insStmt->execute([$schoolId, $subStudentId, $subMonth, $subYear, $monthlyFee, $prevBalance, $discount, $paidAmount, $newRemaining, $status]);
                $feeId = (int)$pdo->lastInsertId();
            }

            // 2. Generate Receipt Number
            $receiptNo = 'REC-' . date('Ym') . '-' . strtoupper(bin2hex(random_bytes(3)));

            // 3. Insert Payment Record
            $payStmt = $pdo->prepare("INSERT INTO fee_payments (school_id, fee_id, student_id, receipt_no, paid_amount, payment_method, payment_date, notes, collected_by)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $payStmt->execute([$schoolId, $feeId, $subStudentId, $receiptNo, $paidAmount, $payMethod, date('Y-m-d'), $notes, $currentUser['full_name']]);

            logActivity($pdo, $schoolId, $userId, 'Fee Collected', 'FeePayment', $receiptNo, "Collected " . formatCurrency($paidAmount) . " for student #$subStudentId (Receipt: $receiptNo)");

            $pdo->commit();

            // Redirect directly to the printable receipt
            header("Location: fee_receipt.php?receipt_no=" . urlencode($receiptNo));
            exit;

        } catch (Exception $e) {
            $pdo->rollBack();
            $errorMessage = "Payment error: " . $e->getMessage();
        }
    }
}
?>

<div class="row justify-content-center">
  <div class="col-lg-8">

    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Receive Fee Payment</h3>
        <p class="text-muted small mb-0">Record tuition fee collections and generate official school receipts.</p>
      </div>
      <a href="fees.php" class="btn btn-outline-secondary btn-sm"><i class="bi bi-arrow-left me-1"></i> Fee Ledger</a>
    </div>

    <?php if (!empty($errorMessage)): ?>
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-circle-fill me-2"></i> <?= e($errorMessage) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    <?php endif; ?>

    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      <form method="POST" action="collect_fee.php">
        <?= csrfField() ?>

        <div class="row g-3 mb-4">
          <!-- Select Student -->
          <div class="col-12">
            <label class="form-label small fw-semibold text-secondary">Select Student *</label>
            <select name="student_id" id="student_select" class="form-select form-select-lg" required onchange="onStudentChange(this)">
              <option value="">-- Choose Student by Name / Class / Roll --</option>
              <?php foreach ($allStudents as $st): ?>
                <option value="<?= $st['id'] ?>" 
                        data-fee="<?= $st['monthly_fee'] ?>"
                        data-class="<?= e($st['class_name']) ?>"
                        <?= ($currentStudent && $currentStudent['id'] === $st['id']) ? 'selected' : '' ?>>
                  <?= e($st['student_name']) ?> (Roll <?= e($st['roll_number']) ?>, <?= e($st['class_name']) ?>) - Father: <?= e($st['father_name']) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <!-- Billing Month & Year -->
          <div class="col-sm-6">
            <label class="form-label small fw-semibold text-secondary">Billing Month *</label>
            <select name="month" class="form-select" required>
              <?php 
                $months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                foreach ($months as $m): 
              ?>
                <option value="<?= $m ?>" <?= $selectedMonth === $m ? 'selected' : '' ?>><?= $m ?></option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="col-sm-6">
            <label class="form-label small fw-semibold text-secondary">Year *</label>
            <select name="year" class="form-select" required>
              <?php for ($y = date('Y') - 1; $y <= date('Y') + 1; $y++): ?>
                <option value="<?= $y ?>" <?= $selectedYear === $y ? 'selected' : '' ?>><?= $y ?></option>
              <?php endfor; ?>
            </select>
          </div>

          <!-- Financial Breakdown -->
          <div class="col-sm-4">
            <label class="form-label small fw-semibold text-secondary">Tuition Fee (Rs.)</label>
            <input type="number" step="0.01" name="monthly_fee" id="monthly_fee" class="form-control" value="<?= $currentStudent ? $currentStudent['monthly_fee'] : '2000.00' ?>" required oninput="calcRemaining()">
          </div>

          <div class="col-sm-4">
            <label class="form-label small fw-semibold text-secondary">Previous Balance (Rs.)</label>
            <input type="number" step="0.01" name="previous_balance" id="previous_balance" class="form-control" value="0.00" oninput="calcRemaining()">
          </div>

          <div class="col-sm-4">
            <label class="form-label small fw-semibold text-secondary">Discount / Concession (Rs.)</label>
            <input type="number" step="0.01" name="discount" id="discount" class="form-control" value="0.00" oninput="calcRemaining()">
          </div>

          <!-- Amount Being Paid & Method -->
          <div class="col-sm-6">
            <label class="form-label small fw-bold text-success fs-6">Amount Receiving Now (Rs.) *</label>
            <div class="input-group">
              <span class="input-group-text bg-success text-white fw-bold">PKR</span>
              <input type="number" step="0.01" name="paid_amount" id="paid_amount" class="form-control form-control-lg fw-bold text-success" value="<?= $currentStudent ? $currentStudent['monthly_fee'] : '2000.00' ?>" required oninput="calcRemaining()">
            </div>
          </div>

          <div class="col-sm-6">
            <label class="form-label small fw-semibold text-secondary">Payment Mode</label>
            <select name="payment_method" class="form-select form-select-lg">
              <option value="Cash">Cash at Counter</option>
              <option value="Bank Transfer">Bank Deposit / Transfer</option>
              <option value="EasyPaisa / JazzCash">EasyPaisa / JazzCash</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <!-- Remaining balance projection preview -->
          <div class="col-12">
            <div class="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <span class="text-muted small">Projected Outstanding Dues After Payment:</span>
                <div class="fs-5 fw-bold text-danger" id="remaining_preview">Rs. 0.00</div>
              </div>
              <span class="badge bg-secondary-subtle text-secondary" id="status_preview">Full Payment</span>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-semibold text-secondary">Payment Notes / Remarks</label>
            <input type="text" name="notes" class="form-control" placeholder="e.g. Paid in full by father at reception">
          </div>
        </div>

        <div class="border-top pt-4 text-end">
          <button type="submit" class="btn btn-success btn-lg px-5 fw-bold shadow-sm">
            <i class="bi bi-printer-fill me-2"></i> Receive & Print Official Receipt
          </button>
        </div>
      </form>
    </div>

  </div>
</div>

<script>
  function onStudentChange(select) {
    const opt = select.options[select.selectedIndex];
    if (opt && opt.dataset.fee) {
      document.getElementById('monthly_fee').value = opt.dataset.fee;
      document.getElementById('paid_amount').value = opt.dataset.fee;
      calcRemaining();
    }
  }

  function calcRemaining() {
    const fee = parseFloat(document.getElementById('monthly_fee').value) || 0;
    const prev = parseFloat(document.getElementById('previous_balance').value) || 0;
    const disc = parseFloat(document.getElementById('discount').value) || 0;
    const paid = parseFloat(document.getElementById('paid_amount').value) || 0;

    const total = (fee + prev) - disc;
    const rem = Math.max(0, total - paid);

    document.getElementById('remaining_preview').innerText = 'Rs. ' + rem.toFixed(2);
    document.getElementById('status_preview').innerText = rem <= 0 ? 'Full Payment' : 'Partial Payment';
  }
  calcRemaining();
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
