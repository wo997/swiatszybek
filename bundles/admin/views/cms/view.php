<?php //route[{ADMIN}/nowe-strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<?php startSection("body_content"); ?>

<div class="piep_editor">
    <div class="piep_editor_content"></div>

    <div class="piep_editor_inspector">
        <div class="medium">Drzewko elementów</div>
        <div class="tree scroll_panel scroll_shadow">Drzewko</div>
    </div>
</div>


<!-- <div>
    <div contenteditable="true">teścik</div>
    <div contenteditable="true">dfghdsfsdfsdfsdf</div>
    <div contenteditable="true">dfghdfg dsfgh dgfdf gds fhghf</div>
    <div contenteditable="true">dfghdfghdfgh</div>
    <div contenteditable="true"></div>
</div> -->

<?php include "bundles/admin/templates/default.php"; ?>