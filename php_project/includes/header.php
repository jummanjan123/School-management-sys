<?php
/**
 * Application Top Header Layout
 */
require_once __DIR__ . '/auth.php';
$schoolName = $currentSchool['name'] ?? 'Smart School';
$urduSlogan = !empty($currentSchool['urdu_slogan']) ? $currentSchool['urdu_slogan'] : 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے';
$sessionName = $currentSchool['academic_session'] ?? '2025-2026';
$logoPath = !empty($currentSchool['logo_path']) ? $currentSchool['logo_path'] : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($schoolName) ?> | Smart School Management System</title>
  
  <!-- Bootstrap 5 CSS & Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  
  <!-- Google Fonts: Plus Jakarta Sans & Noto Nastaliq Urdu -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <style>
    :root {
      --primary-color: #1e40af;
      --primary-dark: #1e3a8a;
      --secondary-color: #0f172a;
      --accent-color: #3b82f6;
      --bg-body: #f8fafc;
      --sidebar-width: 260px;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: var(--bg-body);
      color: #1e293b;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .urdu-font {
      font-family: 'Noto Nastaliq Urdu', 'Amiri', serif;
      direction: rtl;
    }
    .sidebar {
      width: var(--sidebar-width);
      background: #0f172a;
      color: #e2e8f0;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1040;
      overflow-y: auto;
      transition: all 0.3s ease;
    }
    .sidebar .nav-link {
      color: #94a3b8;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      margin: 0.15rem 0.6rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .sidebar .nav-link:hover, .sidebar .nav-link.active {
      color: #ffffff;
      background: #1e293b;
    }
    .sidebar .nav-link.active {
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .main-wrapper {
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin 0.3s ease;
    }
    .top-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.6rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 1020;
    }
    .card-metric {
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      transition: transform 0.2s, box-shadow 0.2s;
      background: #ffffff;
    }
    .card-metric:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.04);
    }
    @media (max-width: 991.98px) {
      .sidebar {
        margin-left: calc(-1 * var(--sidebar-width));
      }
      .sidebar.show {
        margin-left: 0;
      }
      .main-wrapper {
        margin-left: 0;
      }
    }
    @media print {
      .sidebar, .top-header, .no-print, .btn, .breadcrumb {
        display: none !important;
      }
      .main-wrapper {
        margin-left: 0 !important;
        padding: 0 !important;
      }
      body {
        background: #ffffff !important;
      }
    }
  </style>
</head>
<body>

<div class="d-flex w-100 min-vh-100">
  <!-- Include Sidebar -->
  <?php require_once __DIR__ . '/sidebar.php'; ?>

  <!-- Main Content Wrapper -->
  <div class="main-wrapper flex-grow-1 d-flex flex-direction-column">
    
    <!-- Top Branding & Navigation Header -->
    <header class="top-header no-print">
      <div class="container-fluid d-flex align-items-center justify-content-between">
        
        <div class="d-flex align-items-center gap-3">
          <!-- Mobile Sidebar Toggle -->
          <button class="btn btn-light d-lg-none border p-2" id="sidebarToggle" type="button">
            <i class="bi bi-list fs-5"></i>
          </button>
          
          <!-- School Logo & Slogan Header -->
          <div class="d-flex align-items-center gap-3">
            <?php if ($logoPath && file_exists(__DIR__ . '/../' . $logoPath)): ?>
              <img src="<?= e($logoPath) ?>" alt="School Logo" class="rounded-circle shadow-sm" style="width: 46px; height: 46px; object-fit: cover; border: 2px solid #2563eb;">
            <?php else: ?>
              <div style="width: 46px; height: 46px;">
                <?= generateSchoolLogoSvg($schoolName) ?>
              </div>
            <?php endif; ?>
            
            <div>
              <h1 class="h6 mb-0 fw-bold text-dark text-uppercase tracking-wide"><?= e($schoolName) ?></h1>
              <div class="urdu-font text-primary fw-bold" style="font-size: 0.95rem; line-height: 1.3;">
                "<?= e($urduSlogan) ?>"
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side Header Controls -->
        <div class="d-flex align-items-center gap-3">
          <div class="d-none d-md-block text-end">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              <i class="bi bi-calendar3 me-1"></i> Session: <?= e($sessionName) ?>
            </span>
          </div>

          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1" type="button" data-bs-toggle="dropdown">
              <i class="bi bi-person-circle fs-5 text-primary"></i>
              <span class="fw-semibold small d-none d-sm-inline"><?= e($currentUser['full_name']) ?></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm">
              <li><h6 class="dropdown-header">Logged in as: <?= e($currentUser['role']) ?></h6></li>
              <li><a class="dropdown-item" href="settings.php"><i class="bi bi-gear me-2"></i> School Settings</a></li>
              <li><a class="dropdown-item" href="universal_add.php"><i class="bi bi-plus-circle me-2"></i> Universal Add</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="logout.php"><i class="bi bi-box-arrow-right me-2"></i> Log Out</a></li>
            </ul>
          </div>
        </div>

      </div>
    </header>

    <!-- Main Dynamic Content Container -->
    <main class="flex-grow-1 p-3 p-md-4">
