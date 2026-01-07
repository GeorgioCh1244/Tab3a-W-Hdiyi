<?php
session_start();
include("../database.php");

header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? 'list';
$productId = (int)($_POST['product_id'] ?? $_GET['product_id'] ?? 0);

if ($action === 'list' && $productId > 0) {
    $sql = "SELECT r.REVIEW_TEXT, r.RATING, r.REVIEW_DATE, u.NAME
            FROM review r
            JOIN users u ON r.USER_ID = u.USER_ID
            WHERE r.PRODUCT_ID = ?
            ORDER BY r.REVIEW_DATE DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $productId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $reviews = [];
    $sum = 0;
    $count = 0;
    while ($row = mysqli_fetch_assoc($result)) {
        $reviews[] = $row;
        $sum += (int)$row['RATING'];
        $count++;
    }

    $average = $count > 0 ? round($sum / $count, 1) : 0;

    echo json_encode([
        "average" => $average,
        "count" => $count,
        "reviews" => $reviews
    ]);
    exit;
}

if ($action === 'add' && $productId > 0) {
    // ✅ Ensure only logged-in customers can add reviews
    if (!isset($_SESSION['user_id']) || $_SESSION['user_id'] <= 0) {
        echo json_encode(["message" => "You must be logged in to add a review."]);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $rating = (int)($_POST['rating'] ?? 0);
    $text   = trim($_POST['text'] ?? '');

    if ($rating < 1 || $rating > 5 || $text === '') {
        echo json_encode(["message" => "Invalid review data."]);
        exit;
    }

    $sql = "INSERT INTO review (USER_ID, PRODUCT_ID, REVIEW_TEXT, RATING, REVIEW_DATE)
            VALUES (?, ?, ?, ?, NOW())";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "iisi", $userId, $productId, $text, $rating);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["message" => "Review added successfully!"]);
    } else {
        echo json_encode(["message" => "Failed to add review."]);
    }
    exit;
}

echo json_encode(["message" => "Invalid action."]);
?>