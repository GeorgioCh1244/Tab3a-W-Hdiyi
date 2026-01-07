<?php
session_start();
include("../database.php");

// Only allow delivery users
if (!isset($_SESSION['logged_in']) || $_SESSION['type'] !== 'delivery') {
    http_response_code(403);
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}

header('Content-Type: application/json');

// ✅ Include location and phone in the query
$sql = "SELECT ORDER_ID, USER_ID, TOTAL_AMOUNT, STATUS, order_date, location, phone 
        FROM orders ORDER BY ORDER_ID DESC";
$result = mysqli_query($conn, $sql);

$orders = [];
while ($row = mysqli_fetch_assoc($result)) {
    $orders[] = $row;
}

echo json_encode($orders);
?>