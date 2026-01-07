<?php
include '../database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name   = $_POST['PRODUCT_NAME'];
    $desc   = $_POST['DESCRIPTION'];
    $buy    = $_POST['BUY_PRICE'];
    $sell   = $_POST['SELL_PRICE'];
    $cat    = $_POST['CATEGORY'];
    $stock  = $_POST['STOCK_QUANTITY'];
    $custom = $_POST['IS_CUSTOMIZABLE'];

    $imgData = null;
    if (isset($_FILES['IMAGE']) && $_FILES['IMAGE']['error'] === UPLOAD_ERR_OK) {
        // Validate MIME type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($_FILES['IMAGE']['tmp_name']);

        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($mimeType, $allowedTypes)) {
            die("Error: Only JPEG, PNG, or GIF images are allowed.");
        }

        // Read binary data
        $imgData = file_get_contents($_FILES['IMAGE']['tmp_name']);
    }

    $sql = "INSERT INTO products 
            (PRODUCT_NAME, DESCRIPTION, IMAGE, BUY_PRICE, SELL_PRICE, CATEGORY, STOCK_QUANTITY, IS_CUSTOMIZABLE)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($conn, $sql);
    if (!$stmt) {
        die("Prepare failed: " . mysqli_error($conn));
    }

    // Bind parameters
    mysqli_stmt_bind_param(
        $stmt,
        "ssbddssi",
        $name,
        $desc,
        $imgData,   // blob
        $buy,
        $sell,
        $cat,
        $stock,
        $custom
    );

    // Send blob data
    if ($imgData) {
        mysqli_stmt_send_long_data($stmt, 2, $imgData);
    }

    if (mysqli_stmt_execute($stmt)) {
        header("Location: admin.html");
        exit();
    } else {
        echo "Error: " . mysqli_error($conn);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
}
?>