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


<div class="my_list_controls">controls</div>
<div class="my_list">My list</div>

<?php include "admin/page_template.php"; ?>