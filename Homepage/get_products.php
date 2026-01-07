<?php
include '../database.php';

$sql = "SELECT PRODUCT_ID, PRODUCT_NAME, DESCRIPTION, IMAGE, BUY_PRICE, SELL_PRICE, CATEGORY, STOCK_QUANTITY, IS_CUSTOMIZABLE 
        FROM products ORDER BY PRODUCT_ID DESC";

$result = mysqli_query($conn, $sql);

$products = [];

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Detect MIME type for the image
        $mimeType = null;
        if (!empty($row['IMAGE'])) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($row['IMAGE']);
            $row['IMAGE'] = base64_encode($row['IMAGE']);
        }

        $row['mimeType'] = $mimeType;
        $products[] = $row;
    }
}

echo json_encode($products);

mysqli_close($conn);
?>