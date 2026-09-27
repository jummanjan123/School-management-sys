<?php
/**
 * Professional School Leaving Certificate (SLC / Transfer Certificate)
 */
require_once __DIR__ . '/includes/header.php';

$studentId = (int)($_GET['student_id'] ?? 0);

// Fetch students
$studStmt = $pdo->prepare("SELECT id, student_name, father_name, class_name, roll_number FROM students WHERE school_id = ? ORDER BY class_name ASC, roll_number ASC");
$studStmt->execute([$schoolId]);
$students = $studStmt->fetchAll();

$student = null;
if ($studentId > 0) {
    $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ? AND school_id = ? LIMIT 1");
    $stmt->execute([$studentId, $schoolId]);
    $student = $stmt->fetch();
} elseif (!empty($students)) {
    $studentId = (int)$students[0]['id'];
    $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ? AND school_id = ? LIMIT 1");
    $stmt->execute([$studentId, $schoolId]);
    $student = $stmt->fetch();
}

$certNo = 'SLC-' . date('Y') . '-' . str_pad((string)$studentId, 4, '0', STR_PAD_LEFT);
$dateOfLeaving = $_POST['date_of_leaving'] ?? date('Y-m-d');
$reason = $_POST['reason'] ?? 'Parents Relocation / Transfer to another city';
$conduct = $_POST['conduct'] ?? 'Good & Satisfactory';
$remarks = $_POST['remarks'] ?? 'All school dues, books and equipment have been fully cleared.';

$logoPath = !empty($currentSchool['logo_path']) ? $currentSchool['logo_path'] : null;
$stampPath = !empty($currentSchool['stamp_path']) ? $currentSchool['stamp_path'] : null;
$sigPath = !empty($currentSchool['signature_path']) ? $currentSchool['signature_path'] : null;
?>

<style>
  .slc-container {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    margin: 20px auto;
    background: #ffffff;
    border: 10px groove #047857;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    position: relative;
    box-sizing: border-box;
  }
  @media print {
    body { background: white !important; }
    .slc-container {
      margin: 0 !important;
      border: 8px groove #047857 !important;
      box-shadow: none !important;
      width: 100% !important;
      min-height: 100vh !important;
      padding: 15mm !important;
    }
  }
</style>

<div class="d-flex justify-content-between align-items-center mb-4 no-print">
  <div>
    <h3 class="fw-bold text-dark mb-1">School Leaving Certificate</h3>
    <p class="text-muted small mb-0">Official Transfer Certificate for school transition and admissions.</p>
  </div>
  <button onclick="window.print()" class="btn btn-success"><i class="bi bi-printer-fill me-1"></i> Print Certificate (A4)</button>
</div>

<!-- Student Selector Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="leaving_certificate.php" class="row g-3 align-items-end">
    <div class="col-md-6">
      <label class="form-label small fw-semibold text-secondary">Select Student</label>
      <select name="student_id" class="form-select" onchange="this.form.submit()">
        <?php foreach ($students as $st): ?>
          <option value="<?= $st['id'] ?>" <?= $student && $student['id'] === $st['id'] ? 'selected' : '' ?>>
            <?= e($st['student_name']) ?> (Roll <?= e($st['roll_number']) ?>, <?= e($st['class_name']) ?>) - Father: <?= e($st['father_name']) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
  </form>
</div>

<?php if ($student): ?>
  <!-- Printable A4 SLC Paper -->
  <div class="slc-container text-dark">

    <!-- Header Section -->
    <div class="text-center pb-3 border-bottom border-2 border-success">
      <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
        <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
          <img src="<?= e($logoPath) ?>" alt="School Logo" style="width: 75px; height: 75px; object-fit: cover;" class="rounded-circle shadow-sm border border-2 border-success">
        <?php else: ?>
          <div style="width: 75px; height: 75px;">
            <?= generateSchoolLogoSvg($currentSchool['name']) ?>
          </div>
        <?php endif; ?>
        <div>
          <h2 class="fw-bold mb-0 text-uppercase tracking-wider text-success" style="font-size: 1.8rem;"><?= e($currentSchool['name']) ?></h2>
          <div class="text-muted small"><?= e($currentSchool['address'] ?: 'Campus Head Office') ?> • Tel: <?= e($currentSchool['phone'] ?: 'N/A') ?></div>
        </div>
      </div>

      <!-- Urdu Educational Slogan -->
      <div class="urdu-font fw-bold text-success mt-1" style="font-size: 1.15rem;">
        "<?= e($currentSchool['urdu_slogan']) ?>"
      </div>
    </div>

    <!-- Certificate Title -->
    <div class="text-center my-4">
      <div class="d-inline-block border-bottom border-top border-2 border-dark py-1 px-4">
        <h3 class="fw-bold text-uppercase mb-0 tracking-wide text-dark" style="font-family: serif; letter-spacing: 2px;">School Leaving Certificate</h3>
      </div>
    </div>

    <!-- Meta Details Row -->
    <div class="d-flex justify-content-between align-items-center mb-4 small fw-semibold text-secondary">
      <div>SLC Registration No: <span class="font-monospace text-dark fw-bold"><?= e($certNo) ?></span></div>
      <div>Date of Issue: <span class="text-dark fw-bold"><?= formatDate(date('Y-m-d')) ?></span></div>
    </div>

    <!-- Structured Certificate Record Table -->
    <table class="table table-bordered mb-4 align-middle" style="font-size: 1.05rem;">
      <tbody>
        <tr>
          <th style="width: 35%; background: #f8fafc;">1. Student Full Name</th>
          <td class="fw-bold text-uppercase"><?= e($student['student_name']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">2. Father's Name</th>
          <td class="fw-bold text-uppercase"><?= e($student['father_name']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">3. Admission / Registration No</th>
          <td class="font-monospace fw-bold text-success"><?= e($student['admission_number']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">4. Date of Birth (as per register)</th>
          <td><?= formatDate($student['date_of_birth']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">5. Class in which student was reading</th>
          <td class="fw-bold"><?= e($student['class_name']) ?> (Section <?= e($student['section']) ?>) • Roll #<?= e($student['roll_number']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">6. Date of Admission into School</th>
          <td><?= formatDate($student['admission_date']) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">7. Date of Leaving Institution</th>
          <td class="fw-bold"><?= formatDate($dateOfLeaving) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">8. Reason for Leaving School</th>
          <td><?= e($reason) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">9. General Conduct & Discipline</th>
          <td class="fw-bold text-success"><?= e($conduct) ?></td>
        </tr>
        <tr>
          <th style="background: #f8fafc;">10. School Dues Status & Remarks</th>
          <td><?= e($remarks) ?></td>
        </tr>
      </tbody>
    </table>

    <!-- Endorsement Statement -->
    <div class="small text-muted mb-5 text-center fst-italic">
      Certified that the above mentioned information is in accordance with the official General Register (GR) of this school.
    </div>

    <!-- Signatures and Stamp Footer -->
    <div class="row align-items-end mt-5 pt-4">
      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <div class="text-muted small fst-italic">Record Verified</div>
        </div>
        <div class="border-top border-dark pt-1 small fw-bold text-uppercase">
          Prepared By (Clerk)
        </div>
      </div>

      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <?php if ($stampPath && file_exists(__DIR__ . '/' . $stampPath)): ?>
            <img src="<?= e($stampPath) ?>" style="max-height: 65px; max-width: 110px;">
          <?php else: ?>
            <div class="rounded-circle border border-2 border-success text-success p-2 small fw-bold text-uppercase d-inline-block" style="transform: rotate(-10deg);">
              Institutional Seal
            </div>
          <?php endif; ?>
        </div>
        <div class="border-top border-dark pt-1 small fw-bold text-uppercase">
          Official School Stamp
        </div>
      </div>

      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <?php if ($sigPath && file_exists(__DIR__ . '/' . $sigPath)): ?>
            <img src="<?= e($sigPath) ?>" style="max-height: 55px; max-width: 140px;">
          <?php else: ?>
            <div class="text-dark fw-bold"><?= e($currentSchool['head_name'] ?: 'Principal') ?></div>
          <?php endif; ?>
        </div>
        <div class="border-top border-dark pt-1 small fw-bold text-uppercase">
          Principal / Headmaster
        </div>
      </div>
    </div>

  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
