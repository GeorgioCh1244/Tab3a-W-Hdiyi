<?php
include '../database.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "DELETE FROM users WHERE USER_ID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);

    if (mysqli_stmt_execute($stmt)) {
        echo "User #$id deleted successfully.";
    } else {
        echo "Failed to delete user.";
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);
}
?>