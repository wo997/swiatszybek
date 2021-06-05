<?php //route[{ADMIN}/strona] 


$page_id = def($_GET, "nr_strony");
$template_id = def($_GET, "nr_szablonu");

$page_data = null;
$template_data = null;
$parent_template_id = -1;
if ($page_id) {
    $page = EntityManager::getEntityById("page", $page_id);
    if ($page) {
        $page_data = $page->getSimpleProps();

        $page_type = $page->getProp("page_type");
        $link_what_id = $page->getProp("link_what_id");
        if ($page_type === "general_product") {
            $general_product = EntityManager::getEntityById("general_product", $link_what_id);
            if ($general_product) {
                $page_data["general_product"] = $general_product->getSimpleProps();
            }
        }

        $parent_template_id = $page->getProp("template_id");
    }
}

if ($template_id) {
    $template = EntityManager::getEntityById("template", $template_id);
    if ($template) {
        $template_data = $template->getSimpleProps();

        $parent_template_id = $template->getProp("parent_template_id");
    }
}

$parent_templates = [];
while ($parent_template_id > 0) {
    $parent_template_data = DB::fetchRow("SELECT template_id, v_dom_json, parent_template_id FROM template WHERE template_id = $parent_template_id");
    if ($parent_template_data) {
        array_unshift($parent_templates, $parent_template_data);
        $parent_template_id = $parent_template_data["parent_template_id"];
    } else {
        $parent_template_id = -1;
    }
}

if ($template_data) {
    $max_vid_inside = 0;
    $travTemplates = function ($template_id) use (&$travTemplates, &$max_vid_inside) {
        $max_vid_from_pages = DB::fetchVal("SELECT MAX(max_vid) FROM page WHERE template_id = $template_id");
        $max_vid_inside = max($max_vid_inside, $max_vid_from_pages);

        $child_templates_data = DB::fetchArr("SELECT template_id, max_vid FROM template WHERE parent_template_id = $template_id");
        foreach ($child_templates_data as $child_template_data) {
            $max_vid_inside = max($max_vid_inside, $child_template_data["max_vid"]);
            $travTemplates($child_template_data["template_id"]);
        }
    };
    $travTemplates($template_id);
    $template_data["max_vid_inside"] = $max_vid_inside;
}

if (!$page_data && !$template_data) {
    Request::redirect(Request::$static_urls["ADMIN"] . "/strony");
}

ob_start();

include "bundles/global/templates/parts/header/header.php";
$modules_html["main_menu_html"] = ob_get_clean();

?>

<?php Templates::startSection("head_content"); ?>

<title>Edytor stron</title>

<script>
    <?= Theme::preloadThemeSettings() ?>
    let page_data = <?= json_encode($page_data) ?>;
    let template_data = <?= json_encode($template_data) ?>;
    let parent_templates = <?= json_encode($parent_templates) ?>;
    let pageable_data = def(page_data, template_data);
    <?= preloadProductCategories() ?>
</script>

<script src="/<?= BUILDS_PATH . "piep_cms_dependencies.js?v=" . version("piep_cms_dependencies") ?>"></script>
<link href="/<?= BUILDS_PATH . "piep_cms_dependencies.css?v=" . version("piep_cms_dependencies") ?>" rel="stylesheet">

<script src="/<?= BUILDS_PATH . "piep_cms.js?v=" . version("piep_cms") ?>"></script>
<link href="/<?= BUILDS_PATH . "piep_cms.css?v=" . version("piep_cms") ?>" rel="stylesheet">

<?php Templates::startSection("admin_page_body"); ?>

<div class="piep_editor">
    <div class="piep_editor_header custom_toolbar">
        <span class="title breadcrumbs mra"></span>

        <div class="page_publish">
            <button class="btn success page_published_btn" data-tooltip="Ukryj">
                <span>Widoczna</span>
                <i class='fas fa-eye'></i>
            </button>
            <button class="btn error page_unpublished_btn" data-tooltip="Pokaż">
                <span>Ukryta</span>
                <i class='fas fa-eye-slash'></i>
            </button>
        </div>

        <button class="btn subtle undo ml1" data-tooltip="Cofnij zmiany"> <i class="fas fa-undo"></i> </button>
        <button class="btn subtle redo ml1" data-tooltip="Ponów zmiany"> <i class="fas fa-redo"></i> </button>
        <button class="btn primary preview ml1" data-tooltip="Otwórz stronę w nowej karcie">
            Podgląd <i class="fas fa-eye"></i>
        </button>
        <button class="btn primary save ml1"> Zapisz <i class="fas fa-save"></i> </button>
    </div>

    <div class="piep_editor_side_menu">
        <div class="filter_blc_menu radio_group hide_checks flex">
            <div class="checkbox_area">
                <div>
                    <p-checkbox data-value="all"></p-checkbox>
                    <i class="fas fa-th-large filter_icon"></i>
                </div>
                <span>Wszystko</span>
            </div>

            <div class="checkbox_area">
                <div>
                    <p-checkbox data-value="appearance"></p-checkbox>
                    <span> <i class="fas fa-palette filter_icon"></i></span>
                </div>
                <span>Wygląd</span>
            </div>

            <div class="checkbox_area">
                <div>
                    <p-checkbox data-value="layout"></p-checkbox>
                    <span> <i class="fas fa-ruler-combined filter_icon"></i> </span>
                </div>
                <span>Układ</span>
            </div>

            <div class="checkbox_area">
                <div>
                    <p-checkbox data-value="advanced"></p-checkbox>
                    <span> <i class="fas fa-cog filter_icon"></i></span>
                </div>
                <span>Więcej</span>
            </div>
        </div>

        <!-- <div class="pa1" style="border-bottom:1px solid #ccc">
				<div class="float_icon">
					<input class="field" placeholder="Filtruj opcje" />
					<i class="fas fa-search"></i>
				</div>
			</div> -->

        <div class="center flex align_center justify_center case_blc_menu_empty">Nie zaznaczono<br />bloku do edycji</div>

        <div class="scroll_panel scroll_shadow panel_padding blc_menu_scroll_panel">
            <!-- place for blc props etc. -->
        </div>

        <div class="pretty_radio semi_bold select_resolution mla mra">
            <div class="checkbox_area" data-tooltip="Komputer">
                <p-checkbox data-value="df"></p-checkbox>
                <span> <i class="fas fa-desktop"></i> </span>
            </div>
            <div class="checkbox_area" data-tooltip="Tablet poziomo">
                <p-checkbox data-value="bg"></p-checkbox>
                <span> <i class="fas fa-tablet-alt" style="transform:rotate(90deg) scale(0.9,1)"></i> </span>
            </div>
            <div class="checkbox_area" data-tooltip="Tablet pionowo">
                <p-checkbox data-value="md"></p-checkbox>
                <span> <i class="fas fa-tablet-alt" style="transform:scale(0.9,1)"></i> </span>
            </div>
            <div class="checkbox_area" data-tooltip="Telefon">
                <p-checkbox data-value="sm"></p-checkbox>
                <span> <i class="fas fa-mobile-alt"></i> </span>
            </div>
        </div>
    </div>

    <div class="piep_editor_center_column">
        <div class="piep_editor_selection_breadcrumbs"></div>
        <div class="piep_editor_content_wrapper">
            <div class="piep_editor_content_scroll scroll_panel">
                <div class="piep_editor_content global_root"></div>
            </div>
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
            <i class="fas fa-paint-brush"></i>
        </button>
        <button class="btn transparent edit_seo_btn bold" data-tooltip_position="left">
            SEO
        </button>


        <div style="flex-grow:1"> </div>
        <button class="btn transparent advanced_mode_btn" data-tooltip_position="left" data-tooltip="Tryb zaawansowany">
            <i class="fas fa-hammer"></i>
        </button>
        <button class="btn transparent delete_pageable_btn">
            <i class="fas fa-trash"></i>
        </button>
    </div>

    <div class="piep_editor_inspector">
        <div class="container">
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
</div>

<?php include "bundles/admin/templates/default.php"; ?>