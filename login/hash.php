<?php
// Replace with the password you want for your admin
$password = "Chawiche1";

// Generate the hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// Print it out
echo $hash;
?>