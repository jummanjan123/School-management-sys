<?php
/**
 * Professional PVC ID Card Generator
 * Blue Theme for Teachers, Yellow Theme for Students, Green Theme for Other Staff
 */
require_once __DIR__ . '/includes/header.php';

$type = $_GET['type'] ?? 'student'; // student | teacher | staff
$targetId = (int)($_GET['id'] ?? 0);
$selectedClass = $_GET['class'] ?? '';

// Fetch classes
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classes = $classStmt->fetchAll(PDO::FETCH_COLUMN);

$cards = [];

if ($type === 'student') {
    if ($targetId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM students WHERE id = ? AND school_id = ?");
        $stmt->execute([$targetId, $schoolId]);
        $cards = $stmt->fetchAll();
    } else {
        $sql = "SELECT * FROM students WHERE school_id = ? AND status = 'Active'";
        $params = [$schoolId];
        if (!empty($selectedClass)) {
            $sql .= " AND class_name = ?";
            $params[] = $selectedClass;
        }
        $sql .= " ORDER BY class_name ASC, roll_number ASC LIMIT 20";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $cards = $stmt->fetchAll();
    }
} elseif ($type === 'teacher') {
    if ($targetId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM teachers WHERE id = ? AND school_id = ?");
        $stmt->execute([$targetId, $schoolId]);
        $cards = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM teachers WHERE school_id = ? AND status = 'Active' ORDER BY full_name ASC LIMIT 20");
        $stmt->execute([$schoolId]);
        $cards = $stmt->fetchAll();
    }
} else {
    // staff
    if ($targetId > 0) {
        $stmt = $pdo->prepare("SELECT * FROM staff WHERE id = ? AND school_id = ?");
        $stmt->execute([$targetId, $schoolId]);
        $cards = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT * FROM staff WHERE school_id = ? AND status = 'Active' ORDER BY full_name ASC LIMIT 20");
        $stmt->execute([$schoolId]);
        $cards = $stmt->fetchAll();
    }
}

$logoPath = !empty($currentSchool['logo_path']) ? $currentSchool['logo_path'] : null;
$sigPath = !empty($currentSchool['signature_path']) ? $currentSchool['signature_path'] : null;
?>

<style>
  /* PVC ID Card Dimensions: 85.6mm x 53.98mm scaled for display & high-res print */
  .pvc-card {
    width: 320px;
    height: 480px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid rgba(0,0,0,0.1);
    margin: 15px auto;
    page-break-inside: avoid;
  }
  .pvc-hole {
    width: 40px;
    height: 10px;
    background: #e2e8f0;
    border-radius: 20px;
    margin: 6px auto 0;
    border: 1px solid #cbd5e1;
  }
  /* Theme Headers */
  .theme-teacher-header {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: white;
  }
  .theme-student-header {
    background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
    color: white;
  }
  .theme-staff-header {
    background: linear-gradient(135deg, #15803d 0%, #22c55e 100%);
    color: white;
  }

  @media print {
    .pvc-container {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 20px !important;
      justify-content: center !important;
    }
    .pvc-card {
      box-shadow: none !important;
      border: 1px solid #94a3b8 !important;
      margin: 10px !important;
    }
  }
</style>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 no-print">
  <div>
    <h3 class="fw-bold text-dark mb-1">PVC Smart ID Card Studio</h3>
    <p class="text-muted small mb-0">High-resolution standard PVC identity cards with role-specific color coding.</p>
  </div>
  <div class="d-flex gap-2">
    <button onclick="window.print()" class="btn btn-primary shadow-sm"><i class="bi bi-printer-fill me-1"></i> Print Cards (PDF)</button>
  </div>
</div>

<!-- Category Switcher & Filters -->
<div class="card border-0 shadow-sm rounded-4 p-3 mb-4 no-print bg-white">
  <div class="row g-3 align-items-center">
    <div class="col-md-6">
      <div class="btn-group w-100" role="group">
        <a href="id_cards.php?type=student" class="btn <?= $type === 'student' ? 'btn-warning fw-bold text-dark' : 'btn-outline-warning text-dark' ?>">
          <i class="bi bi-mortarboard-fill me-1"></i> Students (Yellow)
        </a>
        <a href="id_cards.php?type=teacher" class="btn <?= $type === 'teacher' ? 'btn-primary fw-bold' : 'btn-outline-primary' ?>">
          <i class="bi bi-person-video3 me-1"></i> Teachers (Blue)
        </a>
        <a href="id_cards.php?type=staff" class="btn <?= $type === 'staff' ? 'btn-success fw-bold' : 'btn-outline-success' ?>">
          <i class="bi bi-people-fill me-1"></i> Staff (Green)
        </a>
      </div>
    </div>

    <?php if ($type === 'student'): ?>
      <div class="col-md-4">
        <form method="GET" action="id_cards.php" class="d-flex gap-2">
          <input type="hidden" name="type" value="student">
          <select name="class" class="form-select form-select-sm" onchange="this.form.submit()">
            <option value="">All Classes (Batch of 20)</option>
            <?php foreach ($classes as $c): ?>
              <option value="<?= e($c) ?>" <?= $selectedClass === $c ? 'selected' : '' ?>><?= e($c) ?></option>
            <?php endforeach; ?>
          </select>
        </form>
      </div>
    <?php endif; ?>
  </div>
</div>

<!-- ID Cards Display Grid -->
<div class="row g-4 justify-content-center pvc-container">
  <?php if (empty($cards)): ?>
    <div class="col-12 text-center py-5 text-muted">
      <i class="bi bi-person-badge fs-1 d-block mb-2"></i>
      No cards to display for this selection.
    </div>
  <?php else: ?>
    <?php foreach ($cards as $item): ?>
      <div class="col-auto">

        <!-- 1. TEACHER BLUE THEME CARD -->
        <?php if ($type === 'teacher'): ?>
          <div class="pvc-card">
            <div>
              <div class="pvc-hole"></div>
              <!-- Card Header -->
              <div class="theme-teacher-header p-3 text-center position-relative">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
                    <img src="<?= e($logoPath) ?>" style="width: 32px; height: 32px; object-fit: cover;" class="rounded-circle bg-white p-1">
                  <?php else: ?>
                    <div style="width: 32px; height: 32px;">
                      <?= generateSchoolLogoSvg($currentSchool['name']) ?>
                    </div>
                  <?php endif; ?>
                  <div class="fw-bold text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;"><?= e($currentSchool['name']) ?></div>
                </div>
                <div class="urdu-font fw-bold" style="font-size: 0.78rem; opacity: 0.95;">
                  "<?= e($currentSchool['urdu_slogan']) ?>"
                </div>
                <div class="badge bg-white text-primary fw-bold text-uppercase px-2 py-0 mt-1" style="font-size: 0.65rem;">
                  Faculty Identity Card
                </div>
              </div>

              <!-- Photo & Details -->
              <div class="p-3 text-center">
                <div class="mb-2">
                  <?php if (!empty($item['photo_path'])): ?>
                    <img src="<?= e($item['photo_path']) ?>" class="rounded-3 shadow-sm border border-2 border-primary" style="width: 85px; height: 95px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-3 bg-light text-primary fw-bold mx-auto d-flex align-items-center justify-content-center border border-2 border-primary" style="width: 85px; height: 95px; font-size: 2rem;">
                      <?= mb_substr($item['full_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                </div>

                <h6 class="fw-bold text-dark mb-0 text-uppercase"><?= e($item['full_name']) ?></h6>
                <div class="text-primary fw-semibold small mb-2"><?= e($item['designation']) ?></div>

                <div class="bg-light rounded-3 p-2 text-start small border" style="font-size: 0.72rem; line-height: 1.5;">
                  <div><strong>Emp ID:</strong> <span class="font-monospace text-primary"><?= e($item['employee_id']) ?></span></div>
                  <div><strong>Qualification:</strong> <?= e($item['qualification'] ?: 'Faculty') ?></div>
                  <div><strong>Level:</strong> <?= e($item['teaching_level']) ?> Level</div>
                  <div><strong>CNIC:</strong> <?= e($item['cnic'] ?: '-') ?></div>
                  <div><strong>Mobile:</strong> <?= e($item['mobile_number']) ?></div>
                  <div><strong>Valid Until:</strong> <?= date('Y') + 1 ?>-12-31</div>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar & Signature -->
            <div class="p-2 border-top bg-light d-flex justify-content-between align-items-end px-3">
              <div style="font-size: 0.65rem;" class="text-muted">
                Official Campus Property
              </div>
              <div class="text-center">
                <?php if ($sigPath && file_exists(__DIR__ . '/' . $sigPath)): ?>
                  <img src="<?= e($sigPath) ?>" style="max-height: 26px; max-width: 70px;">
                <?php else: ?>
                  <div style="font-size: 0.65rem; font-style: italic;">Principal</div>
                <?php endif; ?>
                <div style="font-size: 0.6rem; border-top: 1px solid #94a3b8;" class="text-muted">Signature</div>
              </div>
            </div>
          </div>

        <!-- 2. STUDENT YELLOW/GOLD THEME CARD -->
        <?php elseif ($type === 'student'): ?>
          <div class="pvc-card">
            <div>
              <div class="pvc-hole"></div>
              <!-- Card Header -->
              <div class="theme-student-header p-3 text-center position-relative">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
                    <img src="<?= e($logoPath) ?>" style="width: 32px; height: 32px; object-fit: cover;" class="rounded-circle bg-white p-1">
                  <?php else: ?>
                    <div style="width: 32px; height: 32px;">
                      <?= generateSchoolLogoSvg($currentSchool['name']) ?>
                    </div>
                  <?php endif; ?>
                  <div class="fw-bold text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;"><?= e($currentSchool['name']) ?></div>
                </div>
                <div class="urdu-font fw-bold" style="font-size: 0.78rem; opacity: 0.95;">
                  "<?= e($currentSchool['urdu_slogan']) ?>"
                </div>
                <div class="badge bg-dark text-warning fw-bold text-uppercase px-2 py-0 mt-1" style="font-size: 0.65rem;">
                  Student Identity Card
                </div>
              </div>

              <!-- Photo & Details -->
              <div class="p-3 text-center">
                <div class="mb-2">
                  <?php if (!empty($item['photo_path'])): ?>
                    <img src="<?= e($item['photo_path']) ?>" class="rounded-3 shadow-sm border border-2 border-warning" style="width: 85px; height: 95px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-3 bg-light text-warning-emphasis fw-bold mx-auto d-flex align-items-center justify-content-center border border-2 border-warning" style="width: 85px; height: 95px; font-size: 2rem;">
                      <?= mb_substr($item['student_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                </div>

                <h6 class="fw-bold text-dark mb-0 text-uppercase"><?= e($item['student_name']) ?></h6>
                <div class="text-warning-emphasis fw-bold small mb-2"><?= e($item['class_name']) ?> (Section <?= e($item['section']) ?>)</div>

                <div class="bg-light rounded-3 p-2 text-start small border" style="font-size: 0.72rem; line-height: 1.5;">
                  <div><strong>Father's Name:</strong> <?= e($item['father_name']) ?></div>
                  <div><strong>Roll Number:</strong> <span class="badge bg-warning text-dark fw-bold"><?= e($item['roll_number']) ?></span></div>
                  <div><strong>Admission No:</strong> <span class="font-monospace text-dark fw-semibold"><?= e($item['admission_number']) ?></span></div>
                  <div><strong>Student Code:</strong> <?= e($item['student_code']) ?></div>
                  <div><strong>Father Mobile:</strong> <?= e($item['father_mobile']) ?></div>
                  <div><strong>Academic Session:</strong> <?= e($currentSchool['academic_session']) ?></div>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar & Signature -->
            <div class="p-2 border-top bg-light d-flex justify-content-between align-items-end px-3">
              <div style="font-size: 0.65rem;" class="text-muted">
                Student ID
              </div>
              <div class="text-center">
                <?php if ($sigPath && file_exists(__DIR__ . '/' . $sigPath)): ?>
                  <img src="<?= e($sigPath) ?>" style="max-height: 26px; max-width: 70px;">
                <?php else: ?>
                  <div style="font-size: 0.65rem; font-style: italic;">Principal</div>
                <?php endif; ?>
                <div style="font-size: 0.6rem; border-top: 1px solid #94a3b8;" class="text-muted">Authorized Signature</div>
              </div>
            </div>
          </div>

        <!-- 3. OTHER STAFF GREEN THEME CARD -->
        <?php else: ?>
          <div class="pvc-card">
            <div>
              <div class="pvc-hole"></div>
              <!-- Card Header -->
              <div class="theme-staff-header p-3 text-center position-relative">
                <div class="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <?php if ($logoPath && file_exists(__DIR__ . '/' . $logoPath)): ?>
                    <img src="<?= e($logoPath) ?>" style="width: 32px; height: 32px; object-fit: cover;" class="rounded-circle bg-white p-1">
                  <?php else: ?>
                    <div style="width: 32px; height: 32px;">
                      <?= generateSchoolLogoSvg($currentSchool['name']) ?>
                    </div>
                  <?php endif; ?>
                  <div class="fw-bold text-uppercase" style="font-size: 0.85rem; letter-spacing: 0.5px;"><?= e($currentSchool['name']) ?></div>
                </div>
                <div class="urdu-font fw-bold" style="font-size: 0.78rem; opacity: 0.95;">
                  "<?= e($currentSchool['urdu_slogan']) ?>"
                </div>
                <div class="badge bg-white text-success fw-bold text-uppercase px-2 py-0 mt-1" style="font-size: 0.65rem;">
                  Staff Identity Card
                </div>
              </div>

              <!-- Photo & Details -->
              <div class="p-3 text-center">
                <div class="mb-2">
                  <?php if (!empty($item['photo_path'])): ?>
                    <img src="<?= e($item['photo_path']) ?>" class="rounded-3 shadow-sm border border-2 border-success" style="width: 85px; height: 95px; object-fit: cover;">
                  <?php else: ?>
                    <div class="rounded-3 bg-light text-success fw-bold mx-auto d-flex align-items-center justify-content-center border border-2 border-success" style="width: 85px; height: 95px; font-size: 2rem;">
                      <?= mb_substr($item['full_name'], 0, 1) ?>
                    </div>
                  <?php endif; ?>
                </div>

                <h6 class="fw-bold text-dark mb-0 text-uppercase"><?= e($item['full_name']) ?></h6>
                <div class="text-success fw-bold small mb-2"><?= e($item['designation']) ?></div>

                <div class="bg-light rounded-3 p-2 text-start small border" style="font-size: 0.72rem; line-height: 1.5;">
                  <div><strong>Staff ID:</strong> <span class="font-monospace text-success fw-bold"><?= e($item['staff_code']) ?></span></div>
                  <div><strong>Father:</strong> <?= e($item['father_name'] ?: '-') ?></div>
                  <div><strong>CNIC:</strong> <?= e($item['cnic'] ?: '-') ?></div>
                  <div><strong>Mobile:</strong> <?= e($item['mobile']) ?></div>
                  <div><strong>Validity:</strong> <?= date('Y') + 1 ?>-12-31</div>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar & Signature -->
            <div class="p-2 border-top bg-light d-flex justify-content-between align-items-end px-3">
              <div style="font-size: 0.65rem;" class="text-muted">
                Staff Card
              </div>
              <div class="text-center">
                <?php if ($sigPath && file_exists(__DIR__ . '/' . $sigPath)): ?>
                  <img src="<?= e($sigPath) ?>" style="max-height: 26px; max-width: 70px;">
                <?php else: ?>
                  <div style="font-size: 0.65rem; font-style: italic;">Principal</div>
                <?php endif; ?>
                <div style="font-size: 0.6rem; border-top: 1px solid #94a3b8;" class="text-muted">Authorized Signature</div>
              </div>
            </div>
          </div>
        <?php endif; ?>

      </div>
    <?php endforeach; ?>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
