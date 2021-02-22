<?php //route[{ADMIN}newsletter] 
?>

<?php startSection("head_content"); ?>

<title>Newsletter</title>

<?php startSection("body_content"); ?>

<?php
if (isset($_GET["wyslano"])) {
    echo "<h3 style='text-align:center'>Wysłano newsletter!</h3>";
}
?>

<h1>Newsletter</h1>

<div class="mytable"></div>

<?php include "bundles/admin/templates/default.php"; ?>