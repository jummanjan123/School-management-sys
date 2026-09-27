<?php
/**
 * Professional A4 Character Certificate Generator
 */
require_once __DIR__ . '/includes/header.php';

$studentId = (int)($_GET['student_id'] ?? 0);

// Fetch students for selector
$studStmt = $pdo->prepare("SELECT id, student_name, father_name, class_name, roll_number FROM students WHERE school_id = ? AND status = 'Active' ORDER BY class_name ASC, roll_number ASC");
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

$certNo = 'CC-' . date('Y') . '-' . str_pad((string)$studentId, 4, '0', STR_PAD_LEFT);
$issueDate = $_POST['issue_date'] ?? date('Y-m-d');
$statementText = $_POST['statement'] ?? "This is to certify that the above mentioned student has been a bona fide student of this institution. During the academic tenure, their conduct, character, morals, and discipline have been found to be exemplary and satisfactory. They actively participated in academic activities and co-curricular programs.";

$logoPath = !empty($currentSchool['logo_path']) ? $currentSchool['logo_path'] : null;
$stampPath = !empty($currentSchool['stamp_path']) ? $currentSchool['stamp_path'] : null;
$sigPath = !empty($currentSchool['signature_path']) ? $currentSchool['signature_path'] : null;
?>

<style>
  .cert-container {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    margin: 20px auto;
    background: #ffffff;
    border: 12px double #1e3a8a;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    position: relative;
    box-sizing: border-box;
  }
  .cert-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.05;
    pointer-events: none;
    width: 350px;
    height: 350px;
  }
  @media print {
    body { background: white !important; }
    .cert-container {
      margin: 0 !important;
      border: 8px double #1e3a8a !important;
      box-shadow: none !important;
      width: 100% !important;
      min-height: 100vh !important;
      padding: 15mm !important;
    }
  }
</style>

<div class="d-flex justify-content-between align-items-center mb-4 no-print">
  <div>
    <h3 class="fw-bold text-dark mb-1">Character Certificate Generator</h3>
    <p class="text-muted small mb-0">Official A4 verified certificate with school seal, Urdu slogan and principal endorsement.</p>
  </div>
  <div class="d-flex gap-2">
    <button onclick="window.print()" class="btn btn-primary"><i class="bi bi-printer-fill me-1"></i> Print Certificate (A4)</button>
  </div>
</div>

<!-- Student Selector & Settings Card -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <form method="GET" action="character_certificate.php" class="row g-3 align-items-end">
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
  <!-- Printable A4 Certificate Paper -->
  <div class="cert-container text-dark">
    
    <!-- Watermark Logo -->
    <div class="cert-watermark">
      <?= generateSchoolLogoSvg($currentSchool['name']) ?>
    </div>

    <!-- Header Section -->
    <div class="text-center pb-3 border-bottom border-2 border-primary">
      <div class="d-flex align-items-center justify-content-center gap-3 mb-2">
        <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
          <img src="<?= e($logoPath) ?>" alt="School Logo" style="width: 75px; height: 75px; object-fit: cover;" class="rounded-circle shadow-sm border border-2 border-primary">
        <?php else: ?>
          <div style="width: 75px; height: 75px;">
            <?= generateSchoolLogoSvg($currentSchool['name']) ?>
          </div>
        <?php endif; ?>
        <div>
          <h2 class="fw-bold mb-0 text-uppercase tracking-wider" style="color: #1e3a8a; font-size: 1.8rem;"><?= e($currentSchool['name']) ?></h2>
          <div class="text-muted small"><?= e($currentSchool['address'] ?: 'Campus Head Office') ?> • Tel: <?= e($currentSchool['phone'] ?: 'N/A') ?></div>
        </div>
      </div>

      <!-- Urdu Educational Slogan -->
      <div class="urdu-font fw-bold text-primary mt-1" style="font-size: 1.15rem;">
        "<?= e($currentSchool['urdu_slogan']) ?>"
      </div>
    </div>

    <!-- Certificate Title -->
    <div class="text-center my-4">
      <div class="d-inline-block border-bottom border-top border-2 border-dark py-1 px-4">
        <h3 class="fw-bold text-uppercase mb-0 tracking-wide" style="font-family: serif; letter-spacing: 2px;">Character Certificate</h3>
      </div>
    </div>

    <!-- Meta Details Row -->
    <div class="d-flex justify-content-between align-items-center mb-4 small fw-semibold text-secondary">
      <div>Certificate No: <span class="font-monospace text-dark fw-bold"><?= e($certNo) ?></span></div>
      <div>Date of Issue: <span class="text-dark fw-bold"><?= formatDate($issueDate) ?></span></div>
    </div>

    <!-- Body Paragraphs -->
    <div class="fs-6 lh-lg mb-4 text-justify" style="font-family: 'Times New Roman', serif; font-size: 1.12rem !important; line-height: 2;">
      This is to certify that 
      <strong class="border-bottom border-dark px-2 text-dark"><?= e($student['student_name']) ?></strong>, 
      Son / Daughter of 
      <strong class="border-bottom border-dark px-2 text-dark"><?= e($student['father_name']) ?></strong>, 
      bearing Admission Number 
      <strong class="border-bottom border-dark px-2 font-monospace text-dark"><?= e($student['admission_number']) ?></strong>, 
      Roll Number 
      <strong class="border-bottom border-dark px-2 text-dark"><?= e($student['roll_number']) ?></strong>, 
      has been enrolled in class 
      <strong class="border-bottom border-dark px-2 text-dark"><?= e($student['class_name']) ?> (Section <?= e($student['section']) ?>)</strong> 
      at this institution since 
      <strong class="border-bottom border-dark px-2 text-dark"><?= formatDate($student['admission_date']) ?></strong>.
      According to the school official admission register, their recorded Date of Birth is 
      <strong class="border-bottom border-dark px-2 text-dark"><?= formatDate($student['date_of_birth']) ?></strong>.
    </div>

    <!-- Statement of Character -->
    <div class="p-3 bg-light rounded-2 border mb-5" style="font-family: serif; font-size: 1.05rem; line-height: 1.8;">
      <?= e($statementText) ?>
      <br><br>
      We wish them the best of success in all their future academic and personal endeavors.
    </div>

    <!-- Signatures and Stamp Footer -->
    <div class="row align-items-end mt-5 pt-5">
      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <div class="text-muted small fst-italic">Checked By Staff</div>
        </div>
        <div class="border-top border-dark pt-1 small fw-bold text-uppercase">
          Class Incharge
        </div>
      </div>

      <div class="col-4 text-center">
        <div style="height: 60px;" class="d-flex align-items-center justify-content-center">
          <?php if ($stampPath && file_exists(__DIR__ . '/' . $stampPath)): ?>
            <img src="<?= e($stampPath) ?>" style="max-height: 65px; max-width: 110px;">
          <?php else: ?>
            <div class="rounded-circle border border-2 border-danger text-danger p-2 small fw-bold text-uppercase d-inline-block" style="transform: rotate(-10deg);">
              Institutional Seal
            </div>
          <?php endif; ?>
        </div>
        <div class="border-top border-dark pt-1 small fw-bold text-uppercase">
          Official Stamp
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
          Headmaster / Principal
        </div>
      </div>
    </div>

  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
