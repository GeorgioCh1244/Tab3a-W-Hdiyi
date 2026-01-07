<?php
include '../database.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "SELECT * FROM products WHERE PRODUCT_ID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $product = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit Product</title>
  <!-- Global admin theme -->
  <link rel="stylesheet" href="../admin/admin.css">
  <!-- Page-specific styling -->
  <link rel="stylesheet" href="edit_product.css">
</head>
<body>
  <div class="admin-container">
    <h1 class="page-title">Edit Product</h1>

    <div class="card">
      <form action="update_product.php" method="POST" enctype="multipart/form-data" class="form">
        <input type="hidden" name="PRODUCT_ID" value="<?php echo $product['PRODUCT_ID']; ?>">

        <div class="form-group">
          <label for="PRODUCT_NAME">Product Name</label>
          <input type="text" id="PRODUCT_NAME" name="PRODUCT_NAME" 
                 value="<?php echo htmlspecialchars($product['PRODUCT_NAME']); ?>" required>
        </div>

        <div class="form-group">
          <label for="DESCRIPTION">Description</label>
          <textarea id="DESCRIPTION" name="DESCRIPTION" required><?php echo htmlspecialchars($product['DESCRIPTION']); ?></textarea>
        </div>

        <div class="form-group">
          <label for="IMAGE">Image</label>
          <input type="file" id="IMAGE" name="IMAGE" accept="image/*">
          <small class="form-note">Leave blank to keep current image</small>
        </div>

        <div class="form-group">
          <label for="BUY_PRICE">Buy Price</label>
          <input type="number" step="0.01" id="BUY_PRICE" name="BUY_PRICE" 
                 value="<?php echo $product['BUY_PRICE']; ?>" required>
        </div>

        <div class="form-group">
          <label for="SELL_PRICE">Sell Price</label>
          <input type="number" step="0.01" id="SELL_PRICE" name="SELL_PRICE" 
                 value="<?php echo $product['SELL_PRICE']; ?>" required>
        </div>

        <div class="form-group">
          <label for="CATEGORY">Category</label>
          <select id="CATEGORY" class="form-select" name="CATEGORY" required>
            <option value="Clothing" <?php if($product['CATEGORY'] === 'Clothing') echo 'selected'; ?>>Clothing</option>
            <option value="Mugs" <?php if($product['CATEGORY'] === 'Mugs') echo 'selected'; ?>>Mugs</option>
            <option value="Toys" <?php if($product['CATEGORY'] === 'Toys') echo 'selected'; ?>>Toys</option>
            <option value="Kitchen" <?php if($product['CATEGORY'] === 'Kitchen') echo 'selected'; ?>>Kitchen</option>
            <option value="Accessories" <?php if($product['CATEGORY'] === 'Accessories') echo 'selected'; ?>>Accessories</option>
          </select>
        </div>

        <div class="form-group">
          <label for="STOCK_QUANTITY">Stock Quantity</label>
          <input type="number" id="STOCK_QUANTITY" name="STOCK_QUANTITY" 
                 value="<?php echo $product['STOCK_QUANTITY']; ?>" required>
        </div>

        <div class="form-group">
          <label for="IS_CUSTOMIZABLE">Is Customizable</label>
          <select id="IS_CUSTOMIZABLE" class="form-select" name="IS_CUSTOMIZABLE">
            <option value="0" <?php if(!$product['IS_CUSTOMIZABLE']) echo 'selected'; ?>>No</option>
            <option value="1" <?php if($product['IS_CUSTOMIZABLE']) echo 'selected'; ?>>Yes</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Update Product</button>
          <a href="products_list.php" class="btn btn-secondary">Cancel</a>
        </div>
      </form>
    </div>
  </div>
</body>
</html>