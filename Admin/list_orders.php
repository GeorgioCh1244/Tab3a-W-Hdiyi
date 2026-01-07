<?php
include '../database.php';

$month = isset($_GET['month']) ? $_GET['month'] : '';

if ($month) {
    $sql = "SELECT * FROM orders WHERE MONTH(order_date) = ? ORDER BY ORDER_ID DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $month);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
} else {
    $sql = "SELECT * FROM orders ORDER BY ORDER_ID DESC";
    $result = mysqli_query($conn, $sql);
}

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>{$row['ORDER_ID']}</td>";
        echo "<td>{$row['TOTAL_AMOUNT']}</td>";
        echo "<td>{$row['STATUS']}</td>";
        echo "<td>{$row['created_at']}</td>";
        echo "<td>{$row['order_date']}</td>";
        echo "<td>{$row['USER_ID']}</td>";

        // ✅ Actions column
        echo "<td>";
        if ($row['STATUS'] === 'Pending') {
            echo "<button onclick='markOrderReady({$row['ORDER_ID']})'>Ready</button> ";
            echo "<button onclick='deleteOrder({$row['ORDER_ID']})'>Delete</button>";
        } else {
            echo "-";
        }
        echo "</td>";

        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='7'>No orders found</td></tr>";
}

mysqli_close($conn);
?>