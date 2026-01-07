<?php
include '../database.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "DELETE FROM orders WHERE ORDER_ID = ? AND STATUS = 'Pending'";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (mysqli_stmt_execute($stmt)) {
        echo "Order #$id deleted successfully.";
    } else {
        echo "Failed to delete order.";
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
}
?>