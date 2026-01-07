<?php
session_start();
include("../database.php");

// --------------------
// SIGNUP
// --------------------
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['signup'])) {
    $S_email    = filter_input(INPUT_POST, "S_email", FILTER_SANITIZE_EMAIL);
    $S_username = filter_input(INPUT_POST, "S_username", FILTER_SANITIZE_SPECIAL_CHARS);
    $S_password = filter_input(INPUT_POST, "S_password", FILTER_SANITIZE_SPECIAL_CHARS);

    $S_hash = password_hash($S_password, PASSWORD_DEFAULT);

    // Default signup type = customer
    $sql = "INSERT INTO users (NAME, EMAIL, PASSWORD, TYPE) VALUES (?, ?, ?, 'customer')";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sss", $S_username, $S_email, $S_hash);

    if (mysqli_stmt_execute($stmt)) {
        $_SESSION['username']  = $S_username;
        $_SESSION['email']     = $S_email;
        $_SESSION['logged_in'] = true;
        $_SESSION['type']      = 'customer';

        echo "<script>
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = '../Homepage/homepage.html';
        </script>";
        exit();
    } else {
        echo "Signup failed: " . mysqli_error($conn);
    }
}

// --------------------
// LOGIN
// --------------------
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['email']) && isset($_POST['password'])) {
    $email    = filter_input(INPUT_POST, "email", FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'];

    $sql    = "SELECT * FROM users WHERE EMAIL = ?";
    $stmt   = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($result && mysqli_num_rows($result) === 1) {
        $user = mysqli_fetch_assoc($result);

        if (password_verify($password, $user['PASSWORD'])) {
            $_SESSION['username']  = $user['NAME'];
            $_SESSION['email']     = $user['EMAIL'];
            $_SESSION['user_id']   = $user['USER_ID'];
            $_SESSION['type']      = $user['TYPE']; // 'admin', 'customer', 'delivery'
            $_SESSION['logged_in'] = true;

            // Redirect based on user type
            if ($_SESSION['type'] === 'admin') {
                echo "<script>
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = '../Admin/admin.html';
                </script>";
            } elseif ($_SESSION['type'] === 'delivery') {
                echo "<script>
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = '../delivery/delivery.html';
                </script>";
            } else {
                // Default: customer
                echo "<script>
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = '../Homepage/homepage.html';
                </script>";
            }
            exit();
        } else {
            echo "Incorrect password.";
        }
    } else {
        echo "No user found with that email.";
    }
}

mysqli_close($conn);
?>