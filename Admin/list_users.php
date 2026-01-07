<?php
include '../database.php';

$sql = "SELECT USER_ID, NAME, EMAIL, TYPE FROM users ORDER BY USER_ID DESC";
$result = mysqli_query($conn, $sql);

if ($result && mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        echo "<tr>";
        echo "<td>{$row['USER_ID']}</td>";
        echo "<td>{$row['NAME']}</td>";
        echo "<td>{$row['EMAIL']}</td>";
        echo "<td>{$row['TYPE']}</td>";
        echo "<td><button onclick='deleteUser({$row['USER_ID']})'>Delete</button></td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='5'>No users found</td></tr>";
}

mysqli_close($conn);
?>