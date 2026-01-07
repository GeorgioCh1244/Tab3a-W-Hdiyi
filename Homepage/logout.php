<?php
session_start();
session_unset();
session_destroy();
echo "<script>
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'Homepage/homepage.html';
</script>";
exit();
?>