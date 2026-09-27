<?php
/**
 * Application Footer Layout
 */
?>
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-3 bg-white border-top no-print">
      <div class="container-fluid d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted small px-4">
        <div>
          &copy; <?= date('Y') ?> <strong><?= e($currentSchool['name'] ?? 'Smart School') ?></strong>. All rights reserved.
        </div>
        <div class="mt-2 mt-sm-0">
          Academic Session: <span class="fw-semibold text-dark"><?= e($currentSchool['academic_session'] ?? '2025-2026') ?></span> | Hostinger PHP 8+ Production Ready
        </div>
      </div>
    </footer>

  </div>
</div>

<!-- Bootstrap 5 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script>
  // Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const appSidebar = document.getElementById('appSidebar');

  if (sidebarToggle && appSidebar) {
    sidebarToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('show');
    });
  }
  if (sidebarCloseBtn && appSidebar) {
    sidebarCloseBtn.addEventListener('click', () => {
      appSidebar.classList.remove('show');
    });
  }

  // Auto-dismiss alerts after 5 seconds
  setTimeout(() => {
    document.querySelectorAll('.alert-dismissible').forEach(alert => {
      const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    });
  }, 5000);
</script>
</body>
</html>
