<?php //route[{ADMIN}/edycja-strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<script>
    <?= Theme::preloadThemeSettings() ?>
</script>

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
        <button class="btn subtle undo mla" data-tooltip="Cofnij zmiany"> <i class="fas fa-undo"></i> </button>
        <button class="btn subtle redo" data-tooltip="Ponów zmiany"> <i class="fas fa-redo"></i> </button>
        <button class="btn primary save"> Zapisz <i class="fas fa-save"></i> </button>
    </div>

    <div class="piep_editor_blc_menu"></div>

    <div class="piep_editor_content_wrapper">
        <div class="piep_editor_content_scroll scroll_panel scroll_shadow light">
            <div class="piep_editor_content global_root"></div>
        </div>
    </div>

    <div class="piep_editor_right_menu">
        <button class="btn transparent show_inspector_btn" data-tooltip_position="left">
            <i class="fas fa-stream"></i>
        </button>
        <button class="btn transparent edit_theme_btn" data-tooltip_position="left" data-tooltip="Ustawienia motywu">
            <i class="fas fa-cogs"></i>
        </button>
        <button class="btn transparent edit_seo_btn bold" data-tooltip_position="left" data-tooltip="Optymalizacja pod wyszukiwanie strony">
            SEO
        </button>
    </div>

    <div class="piep_editor_inspector">
        <div class="flex align_center header">
            <div class="medium mra">Drzewko elementów</div>
            <button class="btn transparent grab_inspector_btn small" style="width:29px" data-tooltip="Przemieść">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="btn transparent hide_inspector_btn small" style="width:29px" data-tooltip="Ukryj">
                <i class="fas fa-times" style="font-size:1.1em"></i>
            </button>
        </div>

        <div class="tree scroll_panel scroll_shadow">Drzewko</div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>