<?php //route[{ADMIN}/nowe-strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<?php startSection("body_content"); ?>

<div class="piep_editor">
    <div class="piep_editor_advanced_menu"></div>

    <div class="piep_editor_content"></div>

    <div class="piep_editor_inspector">
        <button class="btn primary show_inspector_btn" data-tooltip="Otwórz drzewko elementów" data-tooltip_position="left">
            <i class="fas fa-stream"></i>
        </button>
        <div class="flex align_center">
            <div class="medium">Drzewko elementów</div>
            <button class="btn transparent hide_inspector_btn small">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <div class="tree scroll_panel scroll_shadow">Drzewko</div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>