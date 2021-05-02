<?php //route[{ADMIN}/strona] 


$page_id = def($_GET, "nr_strony");
$template_id = def($_GET, "nr_szablonu");

$page_data = null;
$template_data = null;
if ($page_id) {
    $page = EntityManager::getEntityById("page", $page_id);
    if ($page) {
        $page_data = $page->getSimpleProps();
    }
}

if ($template_id) {
    $template = EntityManager::getEntityById("template", $template_id);
    if ($template) {
        $template_data = $template->getSimpleProps();
    }
}

if (!$page_data && !$template_data) {
    Request::redirect(Request::$static_urls["ADMIN"] . "/strony");
}

?>

<?php startSection("head_content"); ?>

<title>Strona</title>

<script>
    <?= Theme::preloadThemeSettings() ?>
    let page_data = <?= json_encode($page_data) ?>;
    let template_data = <?= json_encode($template_data) ?>;
</script>

<script src="/<?= BUILDS_PATH . "piep_cms_dependencies.js?v=" . ASSETS_RELEASE ?>"></script>
<link href="/<?= BUILDS_PATH . "piep_cms_dependencies.css?v=" . ASSETS_RELEASE ?>" rel="stylesheet">

<script src="/<?= BUILDS_PATH . "piep_cms.js?v=" . ASSETS_RELEASE ?>"></script>
<link href="/<?= BUILDS_PATH . "piep_cms.css?v=" . ASSETS_RELEASE ?>" rel="stylesheet">

<?php startSection("body_content"); ?>

<div class="piep_editor">
    <div class="piep_editor_header custom_toolbar">
        <span class="title breadcrumbs mr0">
            <a class="btn transparent crumb" href="/admin/strony">
                Strony
            </a>
            <i class="fas fa-chevron-right"></i>
            <div class="crumb">
                Strona xxx
            </div>
            <a class="btn transparent crumb" href="<?= Request::$static_urls["ADMIN"] . "/produkt/117" ?>">(Peszel)</a>
        </span>
        <button class="btn subtle undo mla" data-tooltip="Cofnij zmiany"> <i class="fas fa-undo"></i> </button>
        <button class="btn subtle redo" data-tooltip="Ponów zmiany"> <i class="fas fa-redo"></i> </button>
        <button class="btn primary preview" data-tooltip="Otwórz stronę w nowej karcie">
            Podgląd <i class="fas fa-eye"></i>
        </button>
        <button class="btn primary save"> Zapisz <i class="fas fa-save"></i> </button>
    </div>

    <div class="piep_editor_blc_menu"></div>

    <div class="piep_editor_content_wrapper">
        <div class="piep_editor_content_scroll scroll_panel">
            <div class="piep_editor_content global_root"></div>
        </div>
    </div>

    <div class="piep_editor_right_menu">
        <div class="add_block_btn_wrapper">
            <button class="btn transparent add_block_btn">
                <i class="fas fa-plus"></i>
            </button>
        </div>
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

        <div class="tree scroll_panel scroll_shadow"></div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>