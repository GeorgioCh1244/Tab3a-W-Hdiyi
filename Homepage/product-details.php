<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

// Initialize cart if not set
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Connect to DB (adjust credentials if needed)
$pdo = new PDO("mysql:host=localhost;dbname=tab3a_hdiyi;charset=utf8mb4", "root", "");

// Determine action
$action = $_POST['action'] ?? $_GET['action'] ?? 'status';

if ($action === 'add') {
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity  = (int)($_POST['quantity'] ?? 1);

    $stmt = $pdo->prepare("SELECT PRODUCT_ID, PRODUCT_NAME, SELL_PRICE, STOCK_QUANTITY 
                           FROM products WHERE PRODUCT_ID = :id LIMIT 1");
    $stmt->execute([':id' => $productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        $existingQty = $_SESSION['cart'][$productId]['quantity'] ?? 0;
        $newQty = $existingQty + $quantity;

        // Enforce stock limit
        if ($product['STOCK_QUANTITY'] > 0) {
            $newQty = min($newQty, (int)$product['STOCK_QUANTITY']);
        }

        $_SESSION['cart'][$productId] = [
            'id'       => $product['PRODUCT_ID'],
            'name'     => $product['PRODUCT_NAME'],
            'price'    => (float)$product['SELL_PRICE'],
            'quantity' => $newQty
        ];
    }
}

if ($action === 'update') {
    $productId = (int)($_POST['product_id'] ?? 0);
    $quantity  = (int)($_POST['quantity'] ?? 1);

    if (isset($_SESSION['cart'][$productId])) {
        $stmt = $pdo->prepare("SELECT STOCK_QUANTITY FROM products WHERE PRODUCT_ID = :id LIMIT 1");
        $stmt->execute([':id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            $maxQty = (int)$product['STOCK_QUANTITY'];
            $quantity = min($quantity, $maxQty);
        }

        $_SESSION['cart'][$productId]['quantity'] = max(1, $quantity);
    }
}

if ($action === 'remove') {
    $productId = (int)($_POST['product_id'] ?? 0);
    if (isset($_SESSION['cart'][$productId])) {
        unset($_SESSION['cart'][$productId]);
    }
}

// Calculate totals
$totalItems = 0;
$totalPrice = 0;
foreach ($_SESSION['cart'] as $item) {
    $totalItems += $item['quantity'];
    $totalPrice += $item['price'] * $item['quantity'];
}

// Output JSON
echo json_encode([
    'total_items' => $totalItems,
    'total_price' => round($totalPrice, 2),
    'cart'        => array_values($_SESSION['cart']),
    'sid'         => session_id() // debug: confirm same session across pages
]);