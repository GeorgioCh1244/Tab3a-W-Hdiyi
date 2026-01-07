<?php
include '../database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['PRODUCT_ID']);
    $name = $_POST['PRODUCT_NAME'];
    $description = $_POST['DESCRIPTION'];
    $buy_price = $_POST['BUY_PRICE'];
    $sell_price = $_POST['SELL_PRICE'];
    $category = $_POST['CATEGORY'];   // <-- make sure you capture this
    $stock_quantity = $_POST['STOCK_QUANTITY'];
    $is_customizable = $_POST['IS_CUSTOMIZABLE'];

    // Handle image upload if provided
    if (!empty($_FILES['IMAGE']['name'])) {
        $image = file_get_contents($_FILES['IMAGE']['tmp_name']);
        $sql = "UPDATE products 
                SET PRODUCT_NAME=?, DESCRIPTION=?, IMAGE=?, BUY_PRICE=?, SELL_PRICE=?, CATEGORY=?, STOCK_QUANTITY=?, IS_CUSTOMIZABLE=? 
                WHERE PRODUCT_ID=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sssdsssii", $name, $description, $image, $buy_price, $sell_price, $category, $stock_quantity, $is_customizable, $id);
    } else {
        $sql = "UPDATE products 
                SET PRODUCT_NAME=?, DESCRIPTION=?, BUY_PRICE=?, SELL_PRICE=?, CATEGORY=?, STOCK_QUANTITY=?, IS_CUSTOMIZABLE=? 
                WHERE PRODUCT_ID=?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ssddssii", $name, $description, $buy_price, $sell_price, $category, $stock_quantity, $is_customizable, $id);
    }

    mysqli_stmt_execute($stmt);
    mysqli_stmt_close($stmt);

header("Location: ../admin/admin.html");
exit();

}
?>