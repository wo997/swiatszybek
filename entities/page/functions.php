<?php //hook[helper]

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function traverseVDom($v_dom)
{
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

        $classes_csv = join(" ", $classes);

        $content_html .= "<$tag class=\"$classes_csv\"";
        foreach ($v_node["attrs"] as $key => $val) {
            $content_html .= " $key=\"" . htmlspecialchars($val) . "\"";
        }

        if (in_array($tag, SINGLE_HTML_TAGS)) {
            $content_html .= "/>";
        } else {
            $content_html .= ">" . $body . "</${tag}>";
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

function buildPage($page_id)
{
    $page = EntityManager::getEntityById("page", $page_id);
    $v_dom = json_decode($page->getProp("v_dom_json"), true);

    $dom_data = traverseVDom($v_dom);
    $page_css = getPageCss($dom_data["styles_css_responsive"]);
    $page_css_minified = Assets::minifyCss($page_css);
    Files::save(BUILDS_PATH . "/pages/css/page_$page_id.css", $page_css_minified);

    $page_js_minified = "";
    Files::save(BUILDS_PATH . "/pages/js/page_$page_id.js", $page_js_minified);

    $page->setProp("version", $page->getProp("version") + 1);
}

function updatePageModificationTime($page_id)
{
    $page = EntityManager::getEntityById("page", $page_id);
    $page->setProp("modified_at", date("Y-m-d H:i:s"));
}
