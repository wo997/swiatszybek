<?php //route[{ADMIN}test-view]

?>

<?php startSection("head_content"); ?>

<title>Zaawansowane</title>



<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>


<div class="my_component"></div>

<?php include "admin/page_template.php"; ?>