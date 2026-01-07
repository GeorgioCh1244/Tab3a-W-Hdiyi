<?php
include '../database.php';

if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $sql = "SELECT PRODUCT_ID, PRODUCT_NAME, DESCRIPTION, IMAGE, BUY_PRICE, SELL_PRICE, CATEGORY, STOCK_QUANTITY, IS_CUSTOMIZABLE 
            FROM products WHERE PRODUCT_ID = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($row = mysqli_fetch_assoc($result)) {
        // Detect MIME type
        $mimeType = null;
        if (!empty($row['IMAGE'])) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($row['IMAGE']);
            $row['IMAGE'] = base64_encode($row['IMAGE']);
        }

        $row['mimeType'] = $mimeType;
        echo json_encode($row);
    } else {
        echo json_encode(null);
    }

    mysqli_stmt_close($stmt);
}
mysqli_close($conn);
?>