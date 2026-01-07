<?php
session_start();

// Require login
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: ../login/login.html");
    exit();
}

include '../database.php'; // adjust path if needed

$cart = $_SESSION['cart'] ?? [];
$user_id = $_SESSION['user_id'] ?? 0;

if (empty($cart)) {
    header("Location: homepage.html?order=empty");
    exit();
}

// ✅ Capture location and phone from POST
$location = isset($_POST['location']) ? trim($_POST['location']) : '';
$phone    = isset($_POST['phone']) ? trim($_POST['phone']) : '';

if ($location === '' || $phone === '') {
    header("Location: cart.php?error=missing_info"); // redirect back if missing
    exit();
}

// Calculate subtotal
$subtotal = 0;
foreach ($cart as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

// ✅ Add fixed delivery fee
$delivery_fee = 7.00;
$total_amount = $subtotal + $delivery_fee;

// Insert into orders table
$status = 'Pending';
$created_at = date('Y-m-d H:i:s');
$order_date = date('Y-m-d');

// ✅ Ensure orders table has location and phone columns
$order_sql = "INSERT INTO orders (TOTAL_AMOUNT, STATUS, created_at, order_date, USER_ID, location, phone)
              VALUES (?, ?, ?, ?, ?, ?, ?)";
$order_stmt = mysqli_prepare($conn, $order_sql);
mysqli_stmt_bind_param($order_stmt, "dsssiss", $total_amount, $status, $created_at, $order_date, $user_id, $location, $phone);
mysqli_stmt_execute($order_stmt);
$order_id = mysqli_insert_id($conn);

// Insert each item into contains and deduct stock
foreach ($cart as $item) {
    // Insert into contains table
    $contains_sql = "INSERT INTO contains (ORDER_ID, PRODUCT_ID, QUANTITY, UNIT_PRICE)
                     VALUES (?, ?, ?, ?)";
    $contains_stmt = mysqli_prepare($conn, $contains_sql);
    mysqli_stmt_bind_param($contains_stmt, "iiid", $order_id, $item['id'], $item['quantity'], $item['price']);
    mysqli_stmt_execute($contains_stmt);

    // Deduct stock
    $stock_sql = "UPDATE products SET STOCK_QUANTITY = STOCK_QUANTITY - ? WHERE PRODUCT_ID = ?";
    $stock_stmt = mysqli_prepare($conn, $stock_sql);
    mysqli_stmt_bind_param($stock_stmt, "ii", $item['quantity'], $item['id']);
    mysqli_stmt_execute($stock_stmt);
}

// Clear cart
unset($_SESSION['cart']);

// Redirect to homepage with success flag
header("Location: homepage.html?order=success");
exit;
?>