<?php
session_start();
include("../database.php");

if (!isset($_SESSION['logged_in']) || $_SESSION['type'] !== 'delivery') {
    http_response_code(403);
    echo "Unauthorized";
    exit();
}

$order_id = $_POST['order_id'] ?? 0;
$action   = $_POST['action'] ?? '';

if ($action === 'ready') {
    $sql = "UPDATE orders SET STATUS = 'Ready' WHERE ORDER_ID = ? AND STATUS = 'Pending'";
} elseif ($action === 'confirm') {
    $sql = "UPDATE orders SET STATUS = 'Confirmed' WHERE ORDER_ID = ? AND STATUS = 'Ready'";
} else {
    echo "Invalid action.";
    exit();
}

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $order_id);

if (mysqli_stmt_execute($stmt)) {
    echo "Order #$order_id marked as " . ucfirst($action) . ".";
} else {
    echo "Failed to update order.";
}
?>