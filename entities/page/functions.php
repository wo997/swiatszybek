<?php //hook[helper]

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function traverseVDom($v_dom)
{
    $content_html = "";
    $styles_css = "";

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
            $styles_css .= $sub_data["styles_css"];
        }

        $classes_csv = join(" ", $classes);

        // does not work!
        //$content_html .= "<a>";

        $content_html .= "<$tag class=\"$classes_csv\"";
        foreach ($v_node["attrs"] as $key => $val) {
            $content_html .= " $key=\"" . htmlspecialchars($val) . "\"";
        }

        if (in_array($tag, SINGLE_HTML_TAGS)) {
            $content_html .= "/>";
        } else {
            $content_html .= ">" . $body . "</${tag}>";
        }

        //$content_html .= "</a>";

        if (isset($v_node["styles"])) {
            $node_styles = "";
            foreach ($v_node["styles"] as $prop => $val) {
                $node_styles .= camelToKebabCase($prop) . ": $val;";
            }
            $styles_css .= ".$base_class { $node_styles }";
        }
    }

    return [
        "content_html" => $content_html,
        "styles_css" => $styles_css
    ];
};

function buildPage($page_id)
{
    $page = EntityManager::getEntityById("page", $page_id);
    $v_dom = json_decode($page->getProp("v_dom_json"), true);

    $dom_data = traverseVDom($v_dom);
    $styles_css = Assets::minifyCss($dom_data["styles_css"]);
    // Files::save() !!!
    //var_dump($dom_data["styles_css"]);
    //var_dump();

    $page->setProp("version", $page->getProp("version") + 1);
}

function updatePageModificationTime($page_id)
{
    $page = EntityManager::getEntityById("page", $page_id);
    $page->setProp("modified_at", date("Y-m-d H:i:s"));
}
