<?php //hook[helper]

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function traverseVDom($v_dom)
{
    global $sections;

    $content_html = "";
    $styles_css_responsive = [];
    foreach (Theme::$responsive_breakpoints as $res_name => $width) {
        // we will put concatenated styles in here yay
        $styles_css_responsive[$res_name] = "";
    }

    foreach ($v_dom as $v_node) {
        $body = "";

        $tag = $v_node["tag"];

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
            $sub_data = traverseVDom($v_node["children"]);
            $body .= $sub_data["content_html"];

            foreach (Theme::$responsive_breakpoints as $res_name => $width) {
                // we will put styles in here yay
                $styles_css_responsive[$res_name] .= " " . $sub_data["styles_css_responsive"][$res_name];
            }
        }

        $module_name = def($v_node, ["module_name"]);
        if ($module_name) {
            $res = EventListener::dispatch("render_module_$module_name", ["v_node" => $v_node]);
            if ($res) {
                $body = $res[0];
            }
        }

        $classes_csv = join(" ", $classes);

        $content_html .= "<$tag class=\"$classes_csv\"";
        foreach ($v_node["attrs"] as $key => $val) {
            $content_html .= " $key=\"" . htmlspecialchars($val) . "\"";
        }

        if (in_array($tag, SINGLE_HTML_TAGS)) {
            $content_html .= "/>";
        } else {
            $content_html .= ">$body</$tag>";
        }

        if (isset($v_node["styles"])) {
            foreach ($v_node["styles"] as $res_name => $styles) {
                $node_styles = "";
                foreach ($styles as $prop => $val) {
                    $node_styles .= camelToKebabCase($prop) . ": $val;";
                }
                $node_styles = "#p .$base_class { $node_styles }";

                $styles_css_responsive[$res_name] .= $node_styles;
            }
        }
    }

    return [
        "content_html" => $content_html,
        "styles_css_responsive" => $styles_css_responsive
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
    $page = EntityManager::getEntityById($entity_name, $id);
    $v_dom = json_decode($page->getProp("v_dom_json"), true);

    if ($v_dom) {
        $dom_data = traverseVDom($v_dom);
        $page_css = getPageCss($dom_data["styles_css_responsive"]);
        $page_css_minified = Assets::minifyCss($page_css);
        Files::save(BUILDS_PATH . "/{$entity_name}s/css/{$entity_name}_$id.css", $page_css_minified);

        $page_js_minified = "";
        Files::save(BUILDS_PATH . "/{$entity_name}s/js/{$entity_name}_$id.js", $page_js_minified);

        $page->setProp("version", $page->getProp("version") + 1);
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

    $travVDom = function (&$base_v_nodes) use (&$travVDom, &$max_vid) {
        foreach ($base_v_nodes as &$base_v_node) {
            $vid = def($base_v_node, ["id"]);
            //$v_dom_ids[] = $vid;
            if ($vid > $max_vid) {
                $max_vid = $vid;
            }
            if (isset($base_v_node["children"])) {
                $children = &$base_v_node["children"];
                if ($children) {
                    $travVDom($children);
                }
                unset($children);
            }
        }
        unset($base_v_node);
    };

    if ($v_dom) {
        $travVDom($v_dom);
    }

    //$page->setProp("v_dom_ids_csv", join(",", $v_dom_ids));
    $page->setProp("max_vid", $max_vid);
}


function renderPage($page_id, $data = [])
{
    global $current_page_data, $sections;

    // current_page_data will come from page ;)
    $page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = ?", [$page_id]);

    $page_release = $page_data["version"];

    $v_dom_json = $page_data["v_dom_json"];
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
                    foreach ($append_v_dom as $append_v_node) {
                        if ($append_v_node["template_hook_id"] === $template_hook_id) {
                            //var_dump($template_hook_id, "<<");
                            $avn = $append_v_node;
                            break;
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

    $dom_data = traverseVDom($full_v_dom);

?>

    <?php startSection("head_content"); ?>

    <title>Strony test</title>


    <?php foreach ($parent_templates as $parent_template) {
        $template_release = $parent_template["version"];
        $template_id = $parent_template["template_id"];
    ?>
        <link href="/<?= BUILDS_PATH . "templates/css/template_$template_id.css?v=$template_release" ?>" rel="stylesheet">
    <?php
    }
    ?>

    <link href="/<?= BUILDS_PATH . "pages/css/page_$page_id.css?v=$page_release" ?>" rel="stylesheet">

    <?= def($sections, "head_of_page", ""); ?>

    <?php startSection("body"); ?>
    <div>
        <?= $dom_data["content_html"] ?>
    </div>

    <?php foreach ($parent_templates as $parent_template) {
        $template_release = $parent_template["version"];
        $template_id = $parent_template["template_id"];
    ?>
        <script src="/<?= BUILDS_PATH . "templates/js/template_$template_id.js?v=$template_release" ?>"></script>
    <?php
    }
    ?>

    <script src="/<?= BUILDS_PATH . "pages/js/page_$page_id.js?v=$page_release" ?>"></script>

<?php include "bundles/global/templates/blank.php";
}
