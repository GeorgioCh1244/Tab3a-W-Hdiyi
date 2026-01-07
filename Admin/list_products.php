<?php
include '../database.php';

$sql = "SELECT * FROM products ORDER BY PRODUCT_ID DESC";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>{$row['PRODUCT_ID']}</td>";
        echo "<td>{$row['PRODUCT_NAME']}</td>";
        echo "<td>{$row['DESCRIPTION']}</td>";

        // Display image from LONGBLOB with MIME detection
        if (!empty($row['IMAGE'])) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($row['IMAGE']);
            $imgBase64 = base64_encode($row['IMAGE']);
            echo "<td><img src='data:{$mimeType};base64,{$imgBase64}' alt='Product Image' style='width:60px;height:auto;'></td>";
        } else {
            echo "<td>No Image</td>";
        }

        echo "<td>{$row['BUY_PRICE']}</td>";
        echo "<td>{$row['SELL_PRICE']}</td>";
        echo "<td>{$row['CATEGORY']}</td>";
        echo "<td>{$row['STOCK_QUANTITY']}</td>";
        echo "<td>" . ($row['IS_CUSTOMIZABLE'] ? 'Yes' : 'No') . "</td>";

        // Actions column with Edit/Delete
        echo "<td>
                <button onclick='editProduct({$row['PRODUCT_ID']})'>Edit</button>
                <button onclick='deleteProduct({$row['PRODUCT_ID']})'>Delete</button>
              </td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='10'>No products found</td></tr>";
}

mysqli_close($conn);
?>