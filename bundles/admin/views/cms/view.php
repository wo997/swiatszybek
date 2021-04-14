<?php //route[{ADMIN}/nowe-strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<?php startSection("body_content"); ?>

<div class="piep_editor">
    <div class="piep_editor_header custom_toolbar">
        <span class="title breadcrumbs mr0">
            <a class="btn transparent crumb" href="/admin/produkty">
                Powrót gdzieś
            </a>
            <i class="fas fa-chevron-right"></i>
            <div class="crumb">
                Edycja jakiejś strony
            </div>
        </span>
        <div class="pretty_radio semi_bold select_resolution ml1 mra">
            <div class="checkbox_area" data-tooltip="Komputer">
                <p-checkbox data-value=""></p-checkbox>
                <span> <i class="fas fa-desktop"></i> </span>
            </div>
            <div class="checkbox_area" data-tooltip="Tablet">
                <p-checkbox data-value="1024x768"></p-checkbox>
                <span> <i class="fas fa-mobile-alt"></i> </span>
            </div>
            <div class="checkbox_area" data-tooltip="Telefon">
                <p-checkbox data-value="414x896"></p-checkbox>
                <span> <i class="fas fa-mobile-alt"></i> </span>
            </div>
        </div>
        <button class="btn subtle undo" data-tooltip="Cofnij zmiany"> <i class="fas fa-undo"></i> </button>
        <button class="btn subtle redo" data-tooltip="Ponów zmiany"> <i class="fas fa-redo"></i> </button>
        <button class="btn primary save"> Zapisz <i class="fas fa-save"></i> </button>
    </div>

    <div class="piep_editor_advanced_menu"></div>

    <div class="piep_editor_content_wrapper">
        <div class="piep_editor_content_scroll scroll_panel scroll_shadow light">
            <div class="piep_editor_content"></div>
        </div>
    </div>

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