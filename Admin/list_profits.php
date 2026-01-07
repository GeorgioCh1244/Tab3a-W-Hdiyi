<?php
include '../database.php';

$month = isset($_GET['month']) ? $_GET['month'] : '';

$sql = "
SELECT 
  o.ORDER_ID,
  o.order_date,
  o.STATUS,
  o.TOTAL_AMOUNT,
  SUM((p.SELL_PRICE - p.BUY_PRICE) * c.QUANTITY) AS PROFIT
FROM orders o
JOIN contains c ON o.ORDER_ID = c.ORDER_ID
JOIN products p ON c.PRODUCT_ID = p.PRODUCT_ID
";

if ($month) {
    $sql .= " WHERE MONTH(o.order_date) = ? ";
}

$sql .= " GROUP BY o.ORDER_ID ORDER BY o.ORDER_ID DESC";

if ($month) {
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $month);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
} else {
    $result = mysqli_query($conn, $sql);
}

$totalProfit = 0;

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $totalProfit += $row['PROFIT'];
        echo "<tr>";
        echo "<td>{$row['ORDER_ID']}</td>";
        echo "<td>{$row['order_date']}</td>";
        echo "<td>{$row['STATUS']}</td>";
        echo "<td>$ {$row['TOTAL_AMOUNT']}</td>";
        echo "<td>$ " . number_format($row['PROFIT'], 2) . "</td>";
        echo "</tr>";
    }
    // ✅ Add summary row
    echo "<tr style='font-weight:bold; background:#f0f0f0;'>
            <td colspan='4'>Total Profits:</td>
            <td>$ " . number_format($totalProfit, 2) . "</td>
          </tr>";
} else {
    echo "<tr><td colspan='5'>No profit data found</td></tr>";
}

mysqli_close($conn);
?>