<?php
include '../database.php';

// Get distinct year-month values from orders table
$sql = "SELECT DISTINCT DATE_FORMAT(order_date, '%Y-%m') AS ym,
               DATE_FORMAT(order_date, '%M %Y') AS label
        FROM orders
        ORDER BY ym DESC";

$result = mysqli_query($conn, $sql);

echo "<option value=''>All</option>";
if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<option value='{$row['ym']}'>{$row['label']}</option>";
    }
}
mysqli_close($conn);
?>