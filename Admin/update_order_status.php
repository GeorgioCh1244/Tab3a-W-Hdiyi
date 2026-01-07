<?php
include '../database.php';

if (isset($_POST['id'])) {
    $id = intval($_POST['id']);
    $sql = "UPDATE orders SET STATUS = 'Ready' WHERE ORDER_ID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (mysqli_stmt_execute($stmt)) {
        echo "Order marked as Ready.";
    } else {
        echo "Error updating order: " . mysqli_error($conn);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
}
?>