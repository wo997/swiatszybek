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

<?php include "bundles/admin/templates/default.php"; ?>