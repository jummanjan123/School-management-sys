<?php
/**
 * Application Sidebar Navigation
 */
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<aside class="sidebar no-print d-flex flex-column" id="appSidebar">
  <!-- Brand Header -->
  <div class="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
    <a href="dashboard.php" class="text-decoration-none d-flex align-items-center gap-2 text-white">
      <div class="bg-primary p-2 rounded-3 text-white d-flex align-items-center justify-content-center">
        <i class="bi bi-mortarboard-fill fs-5"></i>
      </div>
      <div>
        <div class="fw-bold fs-6 lh-1">SMART SCHOOL</div>
        <small class="text-secondary" style="font-size: 0.72rem;">Management System</small>
      </div>
    </a>
    <button class="btn btn-sm btn-link text-white-50 d-lg-none" id="sidebarCloseBtn">
      <i class="bi bi-x-lg fs-5"></i>
    </button>
  </div>

  <!-- Navigation Links -->
  <div class="flex-grow-1 py-3">
    <div class="px-3 pb-2 text-uppercase text-secondary fw-bold" style="font-size: 0.68rem; letter-spacing: 0.05em;">Main Menu</div>

    <a href="dashboard.php" class="nav-link <?= $currentPage === 'dashboard.php' ? 'active' : '' ?>">
      <i class="bi bi-speedometer2"></i>
      <span>Dashboard</span>
    </a>

    <a href="universal_add.php" class="nav-link <?= $currentPage === 'universal_add.php' ? 'active' : '' ?>">
      <i class="bi bi-plus-square-fill text-warning"></i>
      <span>Universal Add</span>
    </a>

    <div class="px-3 pt-3 pb-2 text-uppercase text-secondary fw-bold" style="font-size: 0.68rem; letter-spacing: 0.05em;">People & Records</div>

    <a href="teachers.php" class="nav-link <?= in_array($currentPage, ['teachers.php', 'teacher_add.php', 'teacher_edit.php', 'teacher_view.php']) ? 'active' : '' ?>">
      <i class="bi bi-person-video3 text-primary"></i>
      <span>Teachers</span>
    </a>

    <a href="students.php" class="nav-link <?= in_array($currentPage, ['students.php', 'student_add.php', 'student_edit.php', 'student_view.php']) ? 'active' : '' ?>">
      <i class="bi bi-mortarboard text-warning"></i>
      <span>Students</span>
    </a>

    <a href="staff.php" class="nav-link <?= in_array($currentPage, ['staff.php', 'staff_add.php', 'staff_edit.php', 'staff_view.php']) ? 'active' : '' ?>">
      <i class="bi bi-people-fill text-success"></i>
      <span>Other Staff</span>
    </a>

    <a href="inventory.php" class="nav-link <?= in_array($currentPage, ['inventory.php', 'inventory_add.php', 'inventory_edit.php']) ? 'active' : '' ?>">
      <i class="bi bi-box-seam text-info"></i>
      <span>Inventory</span>
    </a>

    <div class="px-3 pt-3 pb-2 text-uppercase text-secondary fw-bold" style="font-size: 0.68rem; letter-spacing: 0.05em;">Operations</div>

    <div class="nav-item">
      <a class="nav-link <?= in_array($currentPage, ['attendance.php', 'teacher_attendance.php', 'student_attendance.php', 'staff_attendance.php', 'attendance_report.php']) ? 'active' : '' ?>" 
         data-bs-toggle="collapse" href="#attendanceCollapse" role="button">
        <i class="bi bi-calendar-check text-danger"></i>
        <span class="flex-grow-1">Attendance</span>
        <i class="bi bi-chevron-down small"></i>
      </a>
      <div class="collapse <?= in_array($currentPage, ['attendance.php', 'teacher_attendance.php', 'student_attendance.php', 'staff_attendance.php', 'attendance_report.php']) ? 'show' : '' ?>" id="attendanceCollapse">
        <div class="ps-4 pe-2 py-1">
          <a href="student_attendance.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'student_attendance.php' ? 'text-white fw-bold' : '' ?>">• Students</a>
          <a href="teacher_attendance.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'teacher_attendance.php' ? 'text-white fw-bold' : '' ?>">• Teachers</a>
          <a href="staff_attendance.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'staff_attendance.php' ? 'text-white fw-bold' : '' ?>">• Staff</a>
          <a href="attendance_report.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'attendance_report.php' ? 'text-white fw-bold' : '' ?>">• Statistics & Reports</a>
        </div>
      </div>
    </div>

    <div class="nav-item">
      <a class="nav-link <?= in_array($currentPage, ['fees.php', 'collect_fee.php', 'fee_history.php', 'pending_fees.php', 'fee_receipt.php']) ? 'active' : '' ?>" 
         data-bs-toggle="collapse" href="#feeCollapse" role="button">
        <i class="bi bi-cash-stack text-success"></i>
        <span class="flex-grow-1">Fee Management</span>
        <i class="bi bi-chevron-down small"></i>
      </a>
      <div class="collapse <?= in_array($currentPage, ['fees.php', 'collect_fee.php', 'fee_history.php', 'pending_fees.php', 'fee_receipt.php']) ? 'show' : '' ?>" id="feeCollapse">
        <div class="ps-4 pe-2 py-1">
          <a href="collect_fee.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'collect_fee.php' ? 'text-white fw-bold' : '' ?>">• Collect Fee</a>
          <a href="fees.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'fees.php' ? 'text-white fw-bold' : '' ?>">• Class-wise Ledger</a>
          <a href="pending_fees.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'pending_fees.php' ? 'text-white fw-bold' : '' ?>">• Pending Fees</a>
          <a href="fee_history.php" class="nav-link py-1 text-white-50 <?= $currentPage === 'fee_history.php' ? 'text-white fw-bold' : '' ?>">• Payment Receipts</a>
        </div>
      </div>
    </div>

    <div class="px-3 pt-3 pb-2 text-uppercase text-secondary fw-bold" style="font-size: 0.68rem; letter-spacing: 0.05em;">Print & Cards</div>

    <a href="id_cards.php" class="nav-link <?= $currentPage === 'id_cards.php' ? 'active' : '' ?>">
      <i class="bi bi-person-badge text-warning"></i>
      <span>PVC ID Cards</span>
    </a>

    <a href="character_certificate.php" class="nav-link <?= $currentPage === 'character_certificate.php' ? 'active' : '' ?>">
      <i class="bi bi-award text-info"></i>
      <span>Character Certificate</span>
    </a>

    <a href="leaving_certificate.php" class="nav-link <?= $currentPage === 'leaving_certificate.php' ? 'active' : '' ?>">
      <i class="bi bi-file-earmark-text text-danger"></i>
      <span>Leaving Certificate</span>
    </a>

    <a href="reports.php" class="nav-link <?= $currentPage === 'reports.php' ? 'active' : '' ?>">
      <i class="bi bi-bar-chart-line"></i>
      <span>Analytical Reports</span>
    </a>

    <a href="settings.php" class="nav-link <?= $currentPage === 'settings.php' ? 'active' : '' ?>">
      <i class="bi bi-gear-wide-connected"></i>
      <span>Settings & Backup</span>
    </a>
  </div>

  <!-- Logout Section -->
  <div class="p-3 border-top border-secondary border-opacity-25">
    <a href="logout.php" class="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
      <i class="bi bi-power"></i> Log Out
    </a>
  </div>
</aside>
