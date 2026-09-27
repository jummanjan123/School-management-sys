<?php
/**
 * Universal Add Record Portal
 * Allows adding Teacher, Student, Other Staff, or Inventory from one unified screen.
 */
require_once __DIR__ . '/includes/header.php';

$selectedType = $_GET['type'] ?? 'student';
$successMessage = '';
$errorMessage = '';

// Fetch classes for student select dropdown
$classStmt = $pdo->prepare("SELECT name FROM classes WHERE school_id = ? ORDER BY numeric_order ASC");
$classStmt->execute([$schoolId]);
$classList = $classStmt->fetchAll(PDO::FETCH_COLUMN);
if (empty($classList)) {
    $classList = ['Play Group', 'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrfToken();
    $target = $_POST['record_category'] ?? '';

    try {
        if ($target === 'teacher') {
            $code = generateNextCode($pdo, $schoolId, 'teachers', 'teacher_code', 'TCH-');
            $empId = trim($_POST['employee_id'] ?? $code);
            $fullName = trim($_POST['full_name'] ?? '');
            $fatherName = trim($_POST['father_name'] ?? '');
            $gender = $_POST['gender'] ?? 'Male';
            $qualification = trim($_POST['qualification'] ?? '');
            $cnic = trim($_POST['cnic'] ?? '');
            $mobile = trim($_POST['mobile_number'] ?? '');
            $marital = $_POST['marital_status'] ?? 'Single';
            $dob = !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null;
            $enrolment = !empty($_POST['date_of_enrolment']) ? $_POST['date_of_enrolment'] : date('Y-m-d');
            $level = $_POST['teaching_level'] ?? 'Primary';
            $subject = trim($_POST['subject'] ?? '');
            $designation = trim($_POST['designation'] ?? 'Teacher');
            $emergency = trim($_POST['emergency_contact'] ?? '');
            $status = $_POST['status'] ?? 'Active';
            $address = trim($_POST['address'] ?? '');

            if (empty($fullName) || empty($mobile)) {
                throw new Exception("Full Name and Mobile Number are required for Teacher.");
            }

            $photoPath = null;
            if (!empty($_FILES['photo']['name'])) {
                $photoPath = handleFileUpload($_FILES['photo'], 'teachers');
            }

            $stmt = $pdo->prepare("INSERT INTO teachers (school_id, teacher_code, employee_id, full_name, father_name, gender, qualification, cnic, address, mobile_number, marital_status, date_of_birth, date_of_enrolment, teaching_level, subject, designation, emergency_contact, photo_path, status) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$schoolId, $code, $empId, $fullName, $fatherName, $gender, $qualification, $cnic, $address, $mobile, $marital, $dob, $enrolment, $level, $subject, $designation, $emergency, $photoPath, $status]);

            logActivity($pdo, $schoolId, $userId, 'Teacher Added', 'Teacher', $code, "Added teacher: $fullName ($code)");
            $successMessage = "Teacher '$fullName' ($code) registered successfully!";
            $selectedType = 'teacher';

        } elseif ($target === 'student') {
            $studentCode = generateNextCode($pdo, $schoolId, 'students', 'student_code', 'STD-');
            $admNo = trim($_POST['admission_number'] ?? $studentCode);
            $studentName = trim($_POST['student_name'] ?? '');
            $fatherName = trim($_POST['father_name'] ?? '');
            $motherName = trim($_POST['mother_name'] ?? '');
            $fatherMobile = trim($_POST['father_mobile'] ?? '');
            $rollNumber = trim($_POST['roll_number'] ?? '01');
            $className = trim($_POST['class_name'] ?? 'Class 1');
            $section = trim($_POST['section'] ?? 'A');
            $admissionDate = !empty($_POST['admission_date']) ? $_POST['admission_date'] : date('Y-m-d');
            $dob = !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null;
            $gender = $_POST['gender'] ?? 'Male';
            $address = trim($_POST['address'] ?? '');
            $prevSchool = trim($_POST['previous_school'] ?? '');
            $guardianName = trim($_POST['guardian_name'] ?? '');
            $guardianContact = trim($_POST['guardian_contact'] ?? '');
            $monthlyFee = (float)($_POST['monthly_fee'] ?? 2000.00);
            $status = $_POST['status'] ?? 'Active';

            if (empty($studentName) || empty($fatherName) || empty($fatherMobile)) {
                throw new Exception("Student Name, Father Name, and Father Mobile are required.");
            }

            $photoPath = null;
            if (!empty($_FILES['photo']['name'])) {
                $photoPath = handleFileUpload($_FILES['photo'], 'students');
            }

            $stmt = $pdo->prepare("INSERT INTO students (school_id, student_code, student_name, father_name, mother_name, father_mobile, roll_number, class_name, section, admission_number, admission_date, date_of_birth, gender, address, previous_school, guardian_name, guardian_contact, monthly_fee, photo_path, status)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$schoolId, $studentCode, $studentName, $fatherName, $motherName, $fatherMobile, $rollNumber, $className, $section, $admNo, $admissionDate, $dob, $gender, $address, $prevSchool, $guardianName, $guardianContact, $monthlyFee, $photoPath, $status]);
            $studentId = $pdo->lastInsertId();

            // Auto-create initial monthly fee record
            $currentMonth = date('F');
            $currentYear = (int)date('Y');
            $feeStmt = $pdo->prepare("INSERT INTO fees (school_id, student_id, month, year, monthly_fee, remaining_amount, status) VALUES (?, ?, ?, ?, ?, ?, 'PENDING')");
            $feeStmt->execute([$schoolId, $studentId, $currentMonth, $currentYear, $monthlyFee, $monthlyFee]);

            logActivity($pdo, $schoolId, $userId, 'Student Added', 'Student', $studentCode, "Admitted student: $studentName ($studentCode) in $className");
            $successMessage = "Student '$studentName' ($studentCode) admitted successfully in $className!";
            $selectedType = 'student';

        } elseif ($target === 'staff') {
            $staffCode = generateNextCode($pdo, $schoolId, 'staff', 'staff_code', 'STF-');
            $fullName = trim($_POST['full_name'] ?? '');
            $fatherName = trim($_POST['father_name'] ?? '');
            $mobile = trim($_POST['mobile'] ?? '');
            $cnic = trim($_POST['cnic'] ?? '');
            $designation = trim($_POST['designation'] ?? 'Security Guard');
            $salary = (float)($_POST['salary'] ?? 0.00);
            $emergency = trim($_POST['emergency_contact'] ?? '');
            $address = trim($_POST['address'] ?? '');
            $status = $_POST['status'] ?? 'Active';
            $doj = !empty($_POST['date_of_joining']) ? $_POST['date_of_joining'] : date('Y-m-d');
            $dob = !empty($_POST['date_of_birth']) ? $_POST['date_of_birth'] : null;

            if (empty($fullName) || empty($mobile)) {
                throw new Exception("Full Name and Mobile are required for staff.");
            }

            $photoPath = null;
            if (!empty($_FILES['photo']['name'])) {
                $photoPath = handleFileUpload($_FILES['photo'], 'staff');
            }

            $stmt = $pdo->prepare("INSERT INTO staff (school_id, staff_code, full_name, father_name, photo_path, cnic, mobile, address, date_of_birth, date_of_joining, designation, salary, emergency_contact, status)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$schoolId, $staffCode, $fullName, $fatherName, $photoPath, $cnic, $mobile, $address, $dob, $doj, $designation, $salary, $emergency, $status]);

            logActivity($pdo, $schoolId, $userId, 'Staff Added', 'Staff', $staffCode, "Added staff: $fullName ($designation)");
            $successMessage = "Staff member '$fullName' ($staffCode) registered successfully!";
            $selectedType = 'staff';

        } elseif ($target === 'inventory') {
            $itemCode = generateNextCode($pdo, $schoolId, 'inventory', 'item_code', 'INV-');
            $itemName = trim($_POST['item_name'] ?? '');
            $category = trim($_POST['item_category'] ?? 'Furniture');
            $quantity = (int)($_POST['quantity'] ?? 1);
            $unit = trim($_POST['unit'] ?? 'Pcs');
            $price = (float)($_POST['purchase_price'] ?? 0.00);
            $total = $quantity * $price;
            $purchaseDate = !empty($_POST['purchase_date']) ? $_POST['purchase_date'] : date('Y-m-d');
            $supplier = trim($_POST['supplier'] ?? '');
            $condition = $_POST['item_condition'] ?? 'Good';
            $location = trim($_POST['location'] ?? 'Main Store');
            $description = trim($_POST['description'] ?? '');
            $remarks = trim($_POST['remarks'] ?? '');

            if (empty($itemName)) {
                throw new Exception("Item Name is required.");
            }

            $photoPath = null;
            if (!empty($_FILES['photo']['name'])) {
                $photoPath = handleFileUpload($_FILES['photo'], 'inventory');
            }

            $stmt = $pdo->prepare("INSERT INTO inventory (school_id, item_code, item_name, item_category, quantity, unit, purchase_price, total_value, purchase_date, supplier, item_condition, location, description, photo_path, remarks)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$schoolId, $itemCode, $itemName, $category, $quantity, $unit, $price, $total, $purchaseDate, $supplier, $condition, $location, $description, $photoPath, $remarks]);

            logActivity($pdo, $schoolId, $userId, 'Inventory Added', 'Inventory', $itemCode, "Added item: $itemName (Qty: $quantity)");
            $successMessage = "Inventory item '$itemName' ($itemCode) added successfully!";
            $selectedType = 'inventory';
        }
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
    }
}
?>

<div class="row justify-content-center">
  <div class="col-lg-10">

    <!-- Header & Intro -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Universal Add Record</h3>
        <p class="text-muted small mb-0">Select a category to quickly register students, teachers, other staff, or inventory.</p>
      </div>
      <a href="dashboard.php" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i> Dashboard
      </a>
    </div>

    <?php if (!empty($successMessage)): ?>
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2 fs-5"></i> <?= e($successMessage) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    <?php endif; ?>

    <?php if (!empty($errorMessage)): ?>
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i> <?= e($errorMessage) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    <?php endif; ?>

    <!-- 4 Big Selection Category Buttons -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <button type="button" onclick="switchCategory('student')" id="btn-student" 
                class="btn w-100 p-3 text-start shadow-sm border category-tab <?= $selectedType === 'student' ? 'btn-warning text-dark border-warning' : 'btn-light text-dark' ?>">
          <div class="fs-3 mb-1"><i class="bi bi-mortarboard-fill"></i></div>
          <div class="fw-bold">STUDENT</div>
          <small class="opacity-75">New Admission</small>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button type="button" onclick="switchCategory('teacher')" id="btn-teacher" 
                class="btn w-100 p-3 text-start shadow-sm border category-tab <?= $selectedType === 'teacher' ? 'btn-primary text-white border-primary' : 'btn-light text-dark' ?>">
          <div class="fs-3 mb-1"><i class="bi bi-person-video3"></i></div>
          <div class="fw-bold">TEACHER</div>
          <small class="opacity-75">Faculty Enrolment</small>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button type="button" onclick="switchCategory('staff')" id="btn-staff" 
                class="btn w-100 p-3 text-start shadow-sm border category-tab <?= $selectedType === 'staff' ? 'btn-success text-white border-success' : 'btn-light text-dark' ?>">
          <div class="fs-3 mb-1"><i class="bi bi-people-fill"></i></div>
          <div class="fw-bold">OTHER STAFF</div>
          <small class="opacity-75">Support Staff</small>
        </button>
      </div>

      <div class="col-6 col-md-3">
        <button type="button" onclick="switchCategory('inventory')" id="btn-inventory" 
                class="btn w-100 p-3 text-start shadow-sm border category-tab <?= $selectedType === 'inventory' ? 'btn-info text-white border-info' : 'btn-light text-dark' ?>">
          <div class="fs-3 mb-1"><i class="bi bi-box-seam-fill"></i></div>
          <div class="fw-bold">INVENTORY</div>
          <small class="opacity-75">Equipment / Assets</small>
        </button>
      </div>
    </div>

    <!-- Forms Container -->
    <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
      
      <!-- 1. STUDENT FORM -->
      <div id="form-student" class="category-form" style="display: <?= $selectedType === 'student' ? 'block' : 'none' ?>;">
        <h4 class="fw-bold text-dark border-bottom pb-3 mb-4">
          <i class="bi bi-mortarboard text-warning me-2"></i> Register New Student
        </h4>
        <form method="POST" action="universal_add.php?type=student" enctype="multipart/form-data">
          <?= csrfField() ?>
          <input type="hidden" name="record_category" value="student">

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Student Name *</label>
              <input type="text" name="student_name" class="form-control" required placeholder="e.g. Ali Ahmed">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Father's Name *</label>
              <input type="text" name="father_name" class="form-control" required placeholder="e.g. Muhammad Ahmed">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Father's Mobile *</label>
              <input type="text" name="father_mobile" class="form-control" required placeholder="0300-1234567">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mother's Name</label>
              <input type="text" name="mother_name" class="form-control" placeholder="Optional">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Gender</label>
              <select name="gender" class="form-select">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Admission Class *</label>
              <select name="class_name" class="form-select" required>
                <?php foreach ($classList as $cls): ?>
                  <option value="<?= e($cls) ?>"><?= e($cls) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Section</label>
              <input type="text" name="section" class="form-control" value="A">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Roll Number</label>
              <input type="text" name="roll_number" class="form-control" placeholder="e.g. 01">
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Admission Date</label>
              <input type="date" name="admission_date" class="form-control" value="<?= date('Y-m-d') ?>">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Date of Birth</label>
              <input type="date" name="date_of_birth" class="form-control">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Monthly Tuition Fee (Rs.)</label>
              <input type="number" step="0.01" name="monthly_fee" class="form-control" value="2000.00">
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Residential Address</label>
              <input type="text" name="address" class="form-control" placeholder="House/Street/Town">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Student Photo</label>
              <input type="file" name="photo" class="form-control" accept="image/*">
            </div>
          </div>

          <div class="mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-warning px-4 py-2 fw-bold text-dark shadow-sm">
              <i class="bi bi-check2-circle me-1"></i> Save & Enrol Student
            </button>
          </div>
        </form>
      </div>

      <!-- 2. TEACHER FORM -->
      <div id="form-teacher" class="category-form" style="display: <?= $selectedType === 'teacher' ? 'block' : 'none' ?>;">
        <h4 class="fw-bold text-dark border-bottom pb-3 mb-4">
          <i class="bi bi-person-video3 text-primary me-2"></i> Register New Teacher
        </h4>
        <form method="POST" action="universal_add.php?type=teacher" enctype="multipart/form-data">
          <?= csrfField() ?>
          <input type="hidden" name="record_category" value="teacher">

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Teacher Full Name *</label>
              <input type="text" name="full_name" class="form-control" required placeholder="e.g. Asad Malik">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Father's / Husband's Name</label>
              <input type="text" name="father_name" class="form-control" placeholder="e.g. Malik Qasim">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mobile Number *</label>
              <input type="text" name="mobile_number" class="form-control" required placeholder="0300-1234567">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">CNIC Number</label>
              <input type="text" name="cnic" class="form-control" placeholder="35201-1234567-1">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Gender</label>
              <select name="gender" class="form-select">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Teaching Level</label>
              <select name="teaching_level" class="form-select">
                <option value="Primary">Primary</option>
                <option value="Middle">Middle</option>
                <option value="High">High</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Subject Specialization</label>
              <input type="text" name="subject" class="form-control" placeholder="e.g. Mathematics, Science">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Qualification</label>
              <input type="text" name="qualification" class="form-control" placeholder="e.g. M.Sc / B.Ed">
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold">Designation</label>
              <input type="text" name="designation" class="form-control" value="Senior Teacher">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Date of Enrolment</label>
              <input type="date" name="date_of_enrolment" class="form-control" value="<?= date('Y-m-d') ?>">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Date of Birth</label>
              <input type="date" name="date_of_birth" class="form-control">
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-semibold">Address</label>
              <input type="text" name="address" class="form-control" placeholder="Residential City / Area">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Teacher Photo</label>
              <input type="file" name="photo" class="form-control" accept="image/*">
            </div>
          </div>

          <div class="mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-primary px-4 py-2 fw-semibold shadow-sm">
              <i class="bi bi-check2-circle me-1"></i> Register Faculty Member
            </button>
          </div>
        </form>
      </div>

      <!-- 3. OTHER STAFF FORM -->
      <div id="form-staff" class="category-form" style="display: <?= $selectedType === 'staff' ? 'block' : 'none' ?>;">
        <h4 class="fw-bold text-dark border-bottom pb-3 mb-4">
          <i class="bi bi-people-fill text-success me-2"></i> Register Support Staff
        </h4>
        <form method="POST" action="universal_add.php?type=staff" enctype="multipart/form-data">
          <?= csrfField() ?>
          <input type="hidden" name="record_category" value="staff">

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Staff Full Name *</label>
              <input type="text" name="full_name" class="form-control" required placeholder="e.g. Bashir Ahmed">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Father's Name</label>
              <input type="text" name="father_name" class="form-control">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Designation *</label>
              <select name="designation" class="form-select">
                <option value="Clerk">Clerk</option>
                <option value="Computer Operator">Computer Operator</option>
                <option value="Security Guard">Security Guard</option>
                <option value="Peon">Peon</option>
                <option value="Mali">Mali</option>
                <option value="PTI">PTI</option>
                <option value="Driver">Driver</option>
                <option value="Canteen Worker">Canteen Worker</option>
                <option value="Sweeper">Sweeper</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Mobile Number *</label>
              <input type="text" name="mobile" class="form-control" required placeholder="0300-1234567">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">CNIC Number</label>
              <input type="text" name="cnic" class="form-control" placeholder="35202-0000000-0">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Monthly Salary (Rs.)</label>
              <input type="number" step="0.01" name="salary" class="form-control" value="25000.00">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Date of Joining</label>
              <input type="date" name="date_of_joining" class="form-control" value="<?= date('Y-m-d') ?>">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Emergency Contact</label>
              <input type="text" name="emergency_contact" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Address</label>
              <input type="text" name="address" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Staff Photo</label>
              <input type="file" name="photo" class="form-control" accept="image/*">
            </div>
          </div>

          <div class="mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-success px-4 py-2 fw-semibold shadow-sm">
              <i class="bi bi-check2-circle me-1"></i> Register Staff Member
            </button>
          </div>
        </form>
      </div>

      <!-- 4. INVENTORY FORM -->
      <div id="form-inventory" class="category-form" style="display: <?= $selectedType === 'inventory' ? 'block' : 'none' ?>;">
        <h4 class="fw-bold text-dark border-bottom pb-3 mb-4">
          <i class="bi bi-box-seam-fill text-info me-2"></i> Add School Asset / Inventory Item
        </h4>
        <form method="POST" action="universal_add.php?type=inventory" enctype="multipart/form-data">
          <?= csrfField() ?>
          <input type="hidden" name="record_category" value="inventory">

          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Item Name *</label>
              <input type="text" name="item_name" class="form-control" required placeholder="e.g. Student Desk & Bench Set">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-semibold">Category</label>
              <select name="item_category" class="form-select">
                <option value="Furniture">Furniture</option>
                <option value="Electronics">Electronics / IT</option>
                <option value="Lab Equipment">Lab Equipment</option>
                <option value="Sports">Sports Equipment</option>
                <option value="Books / Library">Books / Library</option>
                <option value="Stationery">Stationery</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Quantity *</label>
              <input type="number" name="quantity" class="form-control" value="10" min="1" required>
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Unit</label>
              <input type="text" name="unit" class="form-control" value="Pcs">
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Unit Price (Rs.)</label>
              <input type="number" step="0.01" name="purchase_price" class="form-control" value="3500.00">
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold">Condition</label>
              <select name="item_condition" class="form-select">
                <option value="New">New</option>
                <option value="Good" selected>Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Repair Required">Repair Required</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Purchase Date</label>
              <input type="date" name="purchase_date" class="form-control" value="<?= date('Y-m-d') ?>">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Supplier</label>
              <input type="text" name="supplier" class="form-control" placeholder="e.g. Punjab Furniture Mart">
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold">Storage Location</label>
              <input type="text" name="location" class="form-control" value="Hall A / Block 1">
            </div>
            <div class="col-12">
              <label class="form-label small fw-semibold">Description / Remarks</label>
              <textarea name="description" class="form-control" rows="2" placeholder="Specifications, warranty, details..."></textarea>
            </div>
          </div>

          <div class="mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-info text-white px-4 py-2 fw-semibold shadow-sm">
              <i class="bi bi-check2-circle me-1"></i> Save Inventory Item
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</div>

<script>
  function switchCategory(cat) {
    document.querySelectorAll('.category-form').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.category-tab').forEach(el => {
      el.className = 'btn w-100 p-3 text-start shadow-sm border category-tab btn-light text-dark';
    });

    const formEl = document.getElementById('form-' + cat);
    const btnEl = document.getElementById('btn-' + cat);
    if (formEl) formEl.style.display = 'block';

    if (btnEl) {
      if (cat === 'student') btnEl.className = 'btn w-100 p-3 text-start shadow-sm border category-tab btn-warning text-dark border-warning';
      if (cat === 'teacher') btnEl.className = 'btn w-100 p-3 text-start shadow-sm border category-tab btn-primary text-white border-primary';
      if (cat === 'staff') btnEl.className = 'btn w-100 p-3 text-start shadow-sm border category-tab btn-success text-white border-success';
      if (cat === 'inventory') btnEl.className = 'btn w-100 p-3 text-start shadow-sm border category-tab btn-info text-white border-info';
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
