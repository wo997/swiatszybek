<?php //hook[helper]

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);


function getAllPages()
{
    return DB::fetchArr("SELECT * FROM page");
}

function preloadPages()
{
    $pages = json_encode(getAllPages());
    return <<<JS
    pages = $pages;
    loadedPages();
JS;
}

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

        if ($link) {
            $classes[] = "link";
        }

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
            $styles_css .= $sub_data["styles_css"];
            $scripts_js .= $sub_data["scripts_js"];

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

    $page = EntityManager::getEntityById($entity_name, $id);
    if ($page) {
        $v_dom_json = $page->getProp("v_dom_json");
    } else {
        $pageable_data = DB::fetchRow("SELECT * FROM $entity_name WHERE $id_column_name=$id");
        $v_dom_json = $pageable_data["v_dom_json"];
    }

    $v_dom = json_decode($v_dom_json, true);

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


function renderPage($page_id, $data = [])
{
    $page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = ?", [$page_id]);

    if ($page_data["active"] !== 1 && $page_data["url"] !== "" && !User::getCurrent()->priveleges["backend_access"]) {
        Request::notFound();
    }

    $v_dom_json = $page_data["v_dom_json"];

    $preview_params = json_decode(def($_POST, "preview_params", "[]"), true);
    $preview_v_dom_json = def($preview_params, "v_dom_json");

    if ($preview_v_dom_json) {
        $v_dom_json = $preview_v_dom_json;
    }

    $v_dom = def(json_decode($v_dom_json, true), []);
    if (!$v_dom) {
        $v_dom = [];
    }

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
        $preview_js = $dom_data["scripts_js"];
    } else {
        $preview_css = null;
        $preview_js = null;
    }

    $shop_name = getShopName();
    $seo_title = $page_data["seo_title"];
    $seo_description = $page_data["seo_description"];
    if (!$seo_title) {
        if (isset($data["default_seo_title"])) {
            $seo_title = $data["default_seo_title"] . " - " . $shop_name;
        } else {
            $seo_title = $shop_name;
        }
    }

    $page_data["seo_image"] = "";
    $seo_image = $page_data["seo_image"];

    $page_release = $page_data["version"];
?>

    <?php Templates::startSection("head_content"); ?>

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

    <?= def(Templates::$sections, "page_type_specific_head", ""); ?>

    <?php Templates::startSection("body"); ?>

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

        <?php if ($preview_js) : ?>
            <script>
                <?= $preview_js ?>
            </script>
        <?php else : ?>
            <script src="/<?= BUILDS_PATH . "page/js/page_$page_id.js?v=$page_release" ?>"></script>
        <?php endif ?>
    </div>

    <?php if (!$preview_params && User::getCurrent()->priveleges["backend_access"]) : ?>
        <div class="edit_page_menu hidden">
            <button class="mla xbutton page_published_btn" data-tooltip="Ukryj">
                <span>Widoczna</span>
                <i class='fas fa-eye'></i>
            </button>
            <button class="mla xbutton page_unpublished_btn" data-tooltip="Pokaż">
                <span>Ukryta</span>
                <i class='fas fa-eye-slash'></i>
            </button>
            <a href="<?= Request::$static_urls["ADMIN"] ?>/strona?nr_strony=<?= $page_id ?>" class="xbutton">
                <span>Edytuj stronę</span>
                <i class="fas fa-file-alt"></i>
            </a>
            <?= def($data, ["admin_edit_btn"], "")  ?>
        </div>

        <style>
            .no_touch {
                --body_padding_top: 30px;
            }
        </style>

        <script>
            domload(() => {
                $(".edit_page_menu .page_published_btn").addEventListener("click", () => {
                    setPagePublished(<?= $page_id ?>, 0);
                });
                $(".edit_page_menu .page_unpublished_btn").addEventListener("click", () => {
                    setPagePublished(<?= $page_id ?>, 1);
                });

                setPagePublishedCallback(<?= $page_data["active"] ?>);

                $(".edit_page_menu").classList.remove("hidden");
            });
        </script>
    <?php endif ?>

<?php include "bundles/global/templates/blank.php";
}

function generateSitemap()
{
    global $build_info;

    $pages_xml = "";
    $now = date("Y-m-d");

    $pages = DB::fetchArr("SELECT page_id, seo_title, url, page_type, link_what_id FROM page WHERE active = 1");
    foreach ($pages as $page) {
        $page_type = $page["page_type"];
        if ($page_type === "page") {
            $url = "/" . $page["url"];
            if ($url == "/") {
                $prio = 1;
            } else {
                $prio = 1 - 0.2 * (substr_count($url, "/"));
            }
        } else if ($page_type === "general_product") {
            $url = DB::fetchVal("SELECT __url FROM general_product WHERE general_product_id = ?", [$page["link_what_id"]]);
            if (!$url) {
                continue;
            }
            $prio = 0.8;
        } else if ($page_type === "product_category") {
            $product_category = DB::fetchRow("SELECT __url, __level FROM product_category WHERE product_category_id = ?", [$page["link_what_id"]]);
            if (!$product_category) {
                continue;
            }
            $url =  $product_category["__url"];
            $prio = 1 - 0.2 * $product_category["__level"];
        } else {
            continue;
        }

        $url = SITE_URL . $url;

        $pages_xml .= <<<XML
<url>
    <loc>$url</loc>
    <lastmod>$now</lastmod>
    <priority>$prio</priority>
</url>
XML;
    }

    // TODO: categories temporary?
    $product_categories = DB::fetchArr("SELECT product_category_id, __url, __level FROM product_category");
    foreach ($product_categories as $product_category) {
        $url = SITE_URL . $product_category["__url"];
        $prio = 1 - 0.2 * $product_category["__level"];
        $pages_xml .= <<<XML
<url>
    <loc>$url</loc>
    <lastmod>$now</lastmod>
    <priority>$prio</priority>
</url>
XML;
    }

    // looks baaaad dude
    // foreach ($build_info["routes"] as $route => $path) {
    //     foreach (Request::$static_urls as $static_url) {
    //         if (startsWith($route, $static_url)) {
    //             continue 2;
    //         }
    //     }

    //     if (strpos($path, "/actions/") !== false) {
    //         continue;
    //     }

    //     var_dump($route, $path, "<br>");
    // }

    $sitemap = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
$pages_xml
</urlset>
XML;

    Files::save(BUILDS_PATH . "sitemap.xml", $sitemap);
}
