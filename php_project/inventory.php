<?php
/**
 * Inventory & School Asset Management
 */
require_once __DIR__ . '/includes/header.php';

$search = trim($_GET['search'] ?? '');
$filterCat = trim($_GET['category'] ?? '');
$filterCond = trim($_GET['condition'] ?? '');

$sql = "SELECT * FROM inventory WHERE school_id = ?";
$params = [$schoolId];

if (!empty($search)) {
    $sql .= " AND (item_name LIKE ? OR item_code LIKE ? OR supplier LIKE ? OR location LIKE ?)";
    $like = "%$search%";
    array_push($params, $like, $like, $like, $like);
}
if (!empty($filterCat)) {
    $sql .= " AND item_category = ?";
    $params[] = $filterCat;
}
if (!empty($filterCond)) {
    $sql .= " AND item_condition = ?";
    $params[] = $filterCond;
}
$sql .= " ORDER BY id DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

// Total Inventory Value
$stmt = $pdo->prepare("SELECT COALESCE(SUM(total_value), 0), COALESCE(SUM(quantity), 0) FROM inventory WHERE school_id = ?");
$stmt->execute([$schoolId]);
list($grandTotalVal, $grandTotalQty) = $stmt->fetch(PDO::FETCH_NUM);

// Handle Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') {
    verifyCsrfToken();
    $deleteId = (int)$_POST['id'];
    $stmt = $pdo->prepare("DELETE FROM inventory WHERE id = ? AND school_id = ?");
    $stmt->execute([$deleteId, $schoolId]);
    logActivity($pdo, $schoolId, $userId, 'Inventory Deleted', 'Inventory', (string)$deleteId, "Deleted inventory item #$deleteId");
    header("Location: inventory.php?msg=deleted");
    exit;
}
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
  <div>
    <h3 class="fw-bold text-dark mb-1">School Inventory & Assets</h3>
    <p class="text-muted small mb-0">Total Asset Valuation: <strong class="text-success"><?= formatCurrency($grandTotalVal) ?></strong> across <?= number_format($grandTotalQty) ?> physical units.</p>
  </div>
  <div class="d-flex gap-2">
    <a href="universal_add.php?type=inventory" class="btn btn-info text-white shadow-sm">
      <i class="bi bi-plus-circle me-1"></i> + Add Item
    </a>
    <button onclick="window.print()" class="btn btn-outline-secondary">
      <i class="bi bi-printer me-1"></i> Inventory Report
    </button>
  </div>
</div>

<!-- Search & Filter Card -->
<div class="card border-0 shadow-sm rounded-3 mb-4 no-print">
  <div class="card-body p-3">
    <form method="GET" action="inventory.php" class="row g-2 align-items-center">
      <div class="col-md-5">
        <div class="input-group">
          <span class="input-group-text bg-light text-muted"><i class="bi bi-search"></i></span>
          <input type="text" name="search" class="form-control bg-light" placeholder="Search by Item name, Code, Supplier..." value="<?= e($search) ?>">
        </div>
      </div>
      <div class="col-sm-3">
        <select name="category" class="form-select bg-light">
          <option value="">All Categories</option>
          <option value="Furniture" <?= $filterCat === 'Furniture' ? 'selected' : '' ?>>Furniture</option>
          <option value="Electronics" <?= $filterCat === 'Electronics' ? 'selected' : '' ?>>Electronics / IT</option>
          <option value="Lab Equipment" <?= $filterCat === 'Lab Equipment' ? 'selected' : '' ?>>Lab Equipment</option>
          <option value="Sports" <?= $filterCat === 'Sports' ? 'selected' : '' ?>>Sports Equipment</option>
          <option value="Books / Library" <?= $filterCat === 'Books / Library' ? 'selected' : '' ?>>Books / Library</option>
        </select>
      </div>
      <div class="col-sm-2">
        <select name="condition" class="form-select bg-light">
          <option value="">All Conditions</option>
          <option value="New" <?= $filterCond === 'New' ? 'selected' : '' ?>>New</option>
          <option value="Good" <?= $filterCond === 'Good' ? 'selected' : '' ?>>Good</option>
          <option value="Damaged" <?= $filterCond === 'Damaged' ? 'selected' : '' ?>>Damaged</option>
          <option value="Repair Required" <?= $filterCond === 'Repair Required' ? 'selected' : '' ?>>Repair Required</option>
        </select>
      </div>
      <div class="col-sm-2 d-flex gap-2">
        <button type="submit" class="btn btn-secondary w-100">Filter</button>
        <?php if (!empty($search) || !empty($filterCat) || !empty($filterCond)): ?>
          <a href="inventory.php" class="btn btn-outline-danger" title="Clear Filters"><i class="bi bi-x-lg"></i></a>
        <?php endif; ?>
      </div>
    </form>
  </div>
</div>

<!-- Inventory Table -->
<div class="card border-0 shadow-sm rounded-4 overflow-hidden">
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light small text-uppercase text-secondary">
        <tr>
          <th class="ps-4">Code</th>
          <th>Item Name & Category</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total Valuation</th>
          <th>Condition</th>
          <th>Location</th>
          <th class="pe-4 text-end no-print">Action</th>
        </tr>
      </thead>
      <tbody>
        <?php if (empty($items)): ?>
          <tr>
            <td colspan="8" class="text-center py-5 text-muted">
              <i class="bi bi-box-seam fs-1 d-block mb-2 text-secondary"></i>
              No inventory records found. <a href="universal_add.php?type=inventory" class="text-info fw-semibold">Add inventory</a>.
            </td>
          </tr>
        <?php else: ?>
          <?php foreach ($items as $it): ?>
            <tr>
              <td class="ps-4 font-monospace fw-semibold text-info"><?= e($it['item_code']) ?></td>
              <td>
                <div class="fw-bold text-dark"><?= e($it['item_name']) ?></div>
                <small class="badge bg-light text-secondary border"><?= e($it['item_category']) ?></small>
              </td>
              <td>
                <span class="fw-bold text-dark"><?= number_format($it['quantity']) ?></span>
                <small class="text-muted"><?= e($it['unit']) ?></small>
              </td>
              <td class="text-muted"><?= formatCurrency($it['purchase_price']) ?></td>
              <td class="fw-bold text-success"><?= formatCurrency($it['total_value']) ?></td>
              <td>
                <?php
                  $badgeClass = 'bg-success';
                  if ($it['item_condition'] === 'Damaged') $badgeClass = 'bg-danger';
                  if ($it['item_condition'] === 'Repair Required') $badgeClass = 'bg-warning text-dark';
                ?>
                <span class="badge <?= $badgeClass ?>"><?= e($it['item_condition']) ?></span>
              </td>
              <td class="small text-muted"><i class="bi bi-geo-alt me-1"></i><?= e($it['location'] ?: 'Store') ?></td>
              <td class="pe-4 text-end no-print">
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="confirmDelete(<?= $it['id'] ?>, '<?= e(addslashes($it['item_name'])) ?>')" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- Hidden Delete Form -->
<form id="deleteInvForm" method="POST" action="inventory.php" style="display:none;">
  <?= csrfField() ?>
  <input type="hidden" name="action" value="delete">
  <input type="hidden" name="id" id="deleteInvId">
</form>

<script>
  function confirmDelete(id, name) {
    if (confirm("Are you sure you want to remove item '" + name + "' from inventory?")) {
      document.getElementById('deleteInvId').value = id;
      document.getElementById('deleteInvForm').submit();
    }
  }
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
