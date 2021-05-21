<?php //hook[helper]

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function traverseVDom($v_dom, $options = [])
{
    $html_only = def($options, ["html_only"], false);

    $content_html = "";
    $styles_css_responsive = [];
    $styles_css = "";
    $scripts_js = "";
    foreach (Theme::$responsive_breakpoints as $res_name => $width) {
        // we will put concatenated styles in here yay
        $styles_css_responsive[$res_name] = "";
    }

    foreach ($v_dom as $v_node) {
        $body = "";

        $link = def($v_node, ["settings", "link"]);

        $tag = $link ? "a" : $v_node["tag"];

        $base_class = "blc_" . $v_node["id"];
        $classes = $v_node["classes"];
        $classes[] = "blc";
        $classes[] = $base_class;

        if (isset($v_node["text"])) {
            $classes[] = "textable";
            if ($v_node["text"]) {
                $body .= $v_node["text"];
            } else {
                $body .= "<br>";
            }
        } else if (isset($v_node["children"])) {
            $sub_data = traverseVDom($v_node["children"], $options);
            $body .= $sub_data["content_html"];

            foreach (Theme::$responsive_breakpoints as $res_name => $width) {
                // we will put styles in here yay
                $styles_css_responsive[$res_name] .= " " . $sub_data["styles_css_responsive"][$res_name];
            }
        }

        $module_name = def($v_node, ["module_name"]);
        if ($module_name) {
            if ($module_name === "template_hook") {
                $template_hook_id = def($v_node, ["settings", "template_hook_id"]);
                $classes[] = $template_hook_id;
                $hook_contents = def($options, ["hooks", $template_hook_id]);
                if ($hook_contents) {
                    $body = $hook_contents;
                }
            }

            $module = def(PiepCMSManager::$modules, $module_name);
            if ($module) {
                $render = def($module, "render");
                if ($render) {
                    $body = $render(["v_node" => $v_node]);
                }

                if (!$html_only) {
                    $css_path = def($module, "css_path");
                    $js_path = def($module, "js_path");
                    if ($js_path) {
                        $scripts_js .= @file_get_contents($js_path);
                    }
                    if ($css_path) {
                        $styles_css .= @file_get_contents($css_path);
                    }
                }
            }
        }

        $classes_csv = join(" ", $classes);

        $content_html .= "<$tag class=\"$classes_csv\"";

        $attrs = $v_node["attrs"];
        if ($link) {
            $attrs["href"] = $link;
        }
        foreach ($attrs as $key => $val) {
            $content_html .= " $key=\"" . htmlspecialchars($val) . "\"";
        }

        if (in_array($tag, SINGLE_HTML_TAGS)) {
            $content_html .= "/>";
        } else {
            $content_html .= ">$body</$tag>";
        }

        if (!$html_only && isset($v_node["styles"])) {
            foreach ($v_node["styles"] as $res_name => $styles) {
                $node_styles = "";
                foreach ($styles as $prop => $val) {
                    $node_styles .= camelToKebabCase($prop) . ": $val;";
                }
                $node_styles = "#p .$base_class { $node_styles }";

                $styles_css_responsive[$res_name] .= " " . $node_styles;
            }
        }
    }

    return [
        "content_html" => $content_html,
        "styles_css_responsive" => $styles_css_responsive,
        "styles_css" => $styles_css,
        "scripts_js" => $scripts_js,
    ];
};

function getPageCss($styles_css_responsive)
{

    $page_css = "";
    foreach ($styles_css_responsive as $res_name => $styles_css) {
        if ($res_name !== "df") {
            $width = Theme::$responsive_breakpoints[$res_name];
            $page_css .= "@media (max-width: " . ($width - 1) . "px) {";
        }
        $page_css .= $styles_css;
        if ($res_name !== "df") {
            $page_css .= "}";
        }
    }
    return $page_css;
}

function buildPageable($entity_name, $id)
{
    $id_column_name = EntityManager::getEntityIdColumn($entity_name);
    $pageable_data = DB::fetchRow("SELECT * FROM $entity_name WHERE $id_column_name=$id");
    $v_dom = json_decode($pageable_data["v_dom_json"], true);
    if ($v_dom) {
        $dom_data = traverseVDom($v_dom);

        $page_css = $dom_data["styles_css"];
        $page_css .= getPageCss($dom_data["styles_css_responsive"]);
        $page_css_minified = Assets::minifyCss($page_css);
        Files::save(BUILDS_PATH . "/{$entity_name}/css/{$entity_name}_$id.css", $page_css_minified);

        $page_js = $dom_data["scripts_js"];
        $page_js_minified = Assets::minifyJs($page_js);
        Files::save(BUILDS_PATH . "/{$entity_name}/js/{$entity_name}_$id.js", $page_js_minified);

        DB::execute("UPDATE $entity_name SET version = version+1 WHERE $id_column_name=$id");
    }
}

function updatePageableModificationTime($entity_name, $id)
{
    $page = EntityManager::getEntityById($entity_name, $id);
    $page->setProp("modified_at", date("Y-m-d H:i:s"));
}

function updatePageableMetadata($entity_name, $id)
{
    $page = EntityManager::getEntityById($entity_name, $id);
    $v_dom_json = $page->getProp("v_dom_json");
    $v_dom = json_decode($v_dom_json, true);

    //$v_dom_ids = [];
    $max_vid = 0;
    $used_modules = [];

    $travVDom = function (&$base_v_nodes) use (&$travVDom, &$max_vid, &$used_modules) {
        foreach ($base_v_nodes as &$base_v_node) {
            $vid = def($base_v_node, ["id"]);
            //$v_dom_ids[] = $vid;
            if ($vid > $max_vid) {
                $max_vid = $vid;
            }

            $children = def($base_v_node, ["children"]);
            if ($children) {
                $travVDom($children);
                unset($children);
            }

            $module_name = def($base_v_node, ["module_name"]);
            if ($module_name && !in_array($module_name, $used_modules)) {
                $used_modules[] = $module_name;
            }
        }
        unset($base_v_node);
    };

    if ($v_dom) {
        $travVDom($v_dom);
    }

    //$page->setProp("v_dom_ids_csv", join(",", $v_dom_ids));
    $page->setProp("max_vid", $max_vid);
    $page->setProp("used_modules_csv", join(",", $used_modules));
}


function renderPage($page_id)
{
    global $sections;

    $page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = ?", [$page_id]);

    if ($page_data["active"] !== 1 && $page_data["url"] !== "" && !User::getCurrent()->priveleges["backend_access"]) {
        Request::redirect("/");
    }

    $v_dom_json = $page_data["v_dom_json"];

    $preview_params = json_decode(def($_POST, "preview_params", "[]"), true);
    $preview_v_dom_json = def($preview_params, "v_dom_json");

    if ($preview_v_dom_json) {
        $v_dom_json = $preview_v_dom_json;
    }

    $v_dom = def(json_decode($v_dom_json, true), []);

    $parent_template_id = $page_data["template_id"];

    $parent_templates = [];
    while ($parent_template_id > 0) {
        $parent_template_data = DB::fetchRow("SELECT template_id, v_dom_json, parent_template_id, version FROM template WHERE template_id = $parent_template_id");
        if ($parent_template_data) {
            array_unshift($parent_templates, $parent_template_data);
            $parent_template_id = $parent_template_data["parent_template_id"];
        } else {
            $parent_template_id = -1;
        }
    }

    $all_v_doms = [];

    foreach ($parent_templates as $parent_template) {
        $parent_template_v_dom = json_decode($parent_template["v_dom_json"], true);
        $all_v_doms[] = def($parent_template_v_dom, []);
    }

    $all_v_doms[] = $v_dom;

    $count_all_v_doms = count($all_v_doms);

    // glue v_doms from the smallest pieces to the biggest
    for ($i = $count_all_v_doms - 2; $i >= 0; $i--) {
        $base_v_dom = &$all_v_doms[$i];
        $append_v_dom = &$all_v_doms[$i + 1];

        $glueVDom = function (&$base_v_nodes) use (&$glueVDom, &$append_v_dom) {
            foreach ($base_v_nodes as &$base_v_node) {
                $template_hook_id = def($base_v_node, ["settings", "template_hook_id"]);
                if (def($base_v_node, ["module_name"]) === "template_hook" && $template_hook_id) {
                    unset($base_v_node["module_name"]);
                    $base_v_node["classes"][] = "vertical_container";
                    // just remove a class
                    $module_template_hook_index = array_search("module_template_hook", $base_v_node["classes"]);
                    if ($module_template_hook_index !== false) {
                        array_splice($base_v_node["classes"], $module_template_hook_index, 1);
                    }

                    $avn = null;
                    // now glue these, but as u can see the template_hook_id isn't passed by default, just for the last layer
                    if ($append_v_dom) {
                        foreach ($append_v_dom as $append_v_node) {
                            if ($append_v_node["template_hook_id"] === $template_hook_id) {
                                //var_dump($template_hook_id, "<<");
                                $avn = $append_v_node;
                                break;
                            }
                        }
                    }

                    if ($avn) {
                        // copy just the children, styling (like padding) etc is allowed only in the base template
                        $base_v_node["children"] = $avn["children"];
                    } else {
                        $base_v_node["children"] = [];
                    }
                } else if (isset($base_v_node["children"])) {
                    $children = &$base_v_node["children"];
                    if ($children) {
                        $glueVDom($children);
                    }
                    unset($children);
                }
            }
            unset($base_v_node);
        };

        $glueVDom($base_v_dom);

        unset($base_v_dom);
        unset($append_v_dom);
    };

    $full_v_dom = $all_v_doms[0];

    $full_dom_data = traverseVDom($full_v_dom, ["html_only" => true]);

    if ($preview_v_dom_json) {
        $dom_data = traverseVDom($v_dom);
        $preview_css = $dom_data["styles_css"];
        $preview_css .= getPageCss($dom_data["styles_css_responsive"]);
    } else {
        $preview_css = null;
    }

    $shop_name = getShopName();
    $seo_title = $page_data["seo_title"] ? $page_data["seo_title"] : $shop_name;
    $seo_description = $page_data["seo_description"];

    $page_data["seo_image"] = "";
    $seo_image = $page_data["seo_image"];

    $page_release = $page_data["version"];
?>

    <?php startSection("head_content"); ?>

    <title><?= $seo_title ?></title>
    <meta name="description" content="<?= $seo_description ?>">
    <meta property="og:description" content="<?= $seo_description ?>" />
    <meta name="twitter:description" content="<?= $seo_description ?>" />
    <meta property="og:title" content="<?= $seo_title ?>" />
    <meta name="twitter:title" content="<?= $seo_title ?>" />
    <meta name="image" content="<?= $seo_image ?>">
    <meta property="og:image" content="<?= $seo_image ?>">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="<?= $shop_name ?>" />
    <meta name="twitter:card" content="summary" />
    <meta property="og:locale" content="pl_PL" />
    <meta property="og:type" content="website" />

    <?php foreach ($parent_templates as $parent_template) {
        $template_release = $parent_template["version"];
        $template_id = $parent_template["template_id"];
    ?>
        <link href="/<?= BUILDS_PATH . "template/css/template_$template_id.css?v=$template_release" ?>" rel="stylesheet">
    <?php
    }
    ?>

    <?php if ($preview_css) : ?>
        <style>
            <?= $preview_css ?>
        </style>
    <?php else : ?>
        <link href="/<?= BUILDS_PATH . "page/css/page_$page_id.css?v=$page_release" ?>" rel="stylesheet">
    <?php endif ?>

    <?= def($sections, "page_type_specific_head", ""); ?>

    <?php startSection("body"); ?>

    <div class="main_wrapper global_root">
        <?= $full_dom_data["content_html"] ?>

        <?php foreach ($parent_templates as $parent_template) {
            $template_release = $parent_template["version"];
            $template_id = $parent_template["template_id"];
        ?>
            <script src="/<?= BUILDS_PATH . "template/js/template_$template_id.js?v=$template_release" ?>"></script>
        <?php
        }
        ?>

        <script src="/<?= BUILDS_PATH . "page/js/page_$page_id.js?v=$page_release" ?>"></script>
    </div>

    <?php if (!$preview_params && User::getCurrent()->priveleges["backend_access"]) : ?>
        <div class="edit_page_menu">
            <a href="<?= Request::$static_urls["ADMIN"] ?>/strona?nr_strony=<?= $page_id ?>" class="btn transparent small mr1">Edytuj stronę <i class="fas fa-cog"></i></a>
            <button class="btn transparent small mr1 published" data-tooltip="Ukryj">
                Widoczna
                <i class='fas fa-eye'></i>
            </button>
            <button class="btn transparent small mr1 unpublished" data-tooltip="Pokaż">
                Ukryta
                <i class='fas fa-eye-slash'></i>
            </button>
        </div>

        <style>
            .edit_page_menu {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #000;
                padding: 0 5px;
                height: var(--body_padding_top);
                display: flex;
                align-items: stretch;
                z-index: 10000;
                --hover-shadow: none;
            }

            #p .edit_page_menu .btn {
                --btn-font-clr: #fff;
                --hover-shadow: none;
                --brighten-factor: 1;
                font-weight: var(--bold);
            }

            #p .edit_page_menu .btn:not(:hover) {
                opacity: 0.8;
            }

            :root {
                --body_padding_top: 30px;
            }

            .edit_page_menu.published .unpublished,
            .edit_page_menu:not(.published) .published {
                display: none;
            }

            #p .edit_page_menu .published {
                --btn-font-clr: #2d3
            }

            #p .edit_page_menu .unpublished {
                --btn-font-clr: #f34
            }
        </style>

        <script>
            domload(() => {
                $(".edit_page_menu .published").addEventListener("click", () => {
                    doSetPublished(0);
                });

                $(".edit_page_menu .unpublished").addEventListener("click", () => {
                    doSetPublished(1);
                });

                const doSetPublished = (published) => {
                    showLoader();
                    xhr({
                        url: STATIC_URLS["ADMIN"] + "/page/save",
                        params: {
                            page: {
                                page_id: <?= $page_id ?>,
                                active: published
                            },
                        },
                        success: (res) => {
                            hideLoader();
                            setPublished(published);
                        },
                    });
                }

                const setPublished = (published) => {
                    $(".edit_page_menu").classList.toggle("published", published);

                }

                setPublished(<?= $page_data["active"] ?>);
            });
        </script>
    <?php endif ?>

<?php include "bundles/global/templates/blank.php";
}
