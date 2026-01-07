<?php
include 'database.php';

// Get category from query string
$category = $_GET['category'] ?? '';

if ($category === 'All') {
    $query = "SELECT PRODUCT_ID, PRODUCT_NAME, DESCRIPTION, IMAGE, SELL_PRICE, CATEGORY, 'image/jpeg' AS mimeType FROM products";
    $stmt = $conn->prepare($query);
} else {
    $query = "SELECT PRODUCT_ID, PRODUCT_NAME, DESCRIPTION, IMAGE, SELL_PRICE, CATEGORY, 'image/jpeg' AS mimeType 
              FROM products WHERE CATEGORY = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $category);
}

$stmt->execute();
$result = $stmt->get_result();

$products = [];

while ($row = $result->fetch_assoc()) {
    // Encode image blob to base64 for frontend
    $row['IMAGE'] = base64_encode($row['IMAGE']);
    $products[] = $row;
}

header('Content-Type: application/json');
echo json_encode($products);

$stmt->close();
$conn->close();
?>