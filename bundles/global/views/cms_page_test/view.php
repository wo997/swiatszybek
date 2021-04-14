<?php //route[/cms_page_test] 

$v_dom_json = '[{"id":100,"tag":"h1","text":"Dobry frejmwork","styles":{"fontSize":"1.4rem","fontWeight":"700","marginTop":"50px"},"attrs":{},"classes":[]},{"id":101,"tag":"p","text":"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","styles":{"marginTop":"20px","backgroundColor":"#3d3"},"attrs":{},"classes":[]},{"id":102,"tag":"h1","text":"123234234563456","styles":{"fontSize":"1.4rem","fontWeight":"400","color":"#d5d"},"attrs":{},"classes":[]},{"id":103,"tag":"p","text":"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","styles":{"marginTop":"20px"},"attrs":{},"classes":[]},{"id":104,"tag":"h1","text":"Dobry frejmwork aaaaaaaaaa","styles":{"fontSize":"1.4rem","fontWeight":"600","color":"#d5d"},"attrs":{},"classes":[]},{"id":105,"tag":"p","text":"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","styles":{"marginTop":"20px"},"attrs":{},"classes":[]},{"id":169,"tag":"div","styles":{"display":"flex","borderWidth":"1px","borderColor":"#00c","borderStyle":"solid","padding":"10px"},"attrs":{},"classes":[],"children":[{"id":170,"tag":"div","styles":{"display":"flex","borderWidth":"1px","borderColor":"#00c","borderStyle":"solid","padding":"10px","flexDirection":"column"},"attrs":{},"classes":[],"children":[{"id":171,"tag":"p","text":"dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f","styles":{"display":"flex","borderWidth":"1px","borderColor":"#c00","borderStyle":"solid","padding":"10px"},"attrs":{},"classes":[]},{"id":172,"tag":"p","text":"ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS","styles":{"display":"flex","borderWidth":"1px","borderColor":"#0c0","borderStyle":"solid","padding":"10px"},"attrs":{},"classes":[]}]},{"id":173,"tag":"p","text":"dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f","styles":{"display":"flex","borderWidth":"1px","borderColor":"#c00","borderStyle":"solid","padding":"10px"},"attrs":{},"classes":[]},{"id":174,"tag":"p","text":"ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS","styles":{"display":"flex","borderWidth":"1px","borderColor":"#0c0","borderStyle":"solid","padding":"10px"},"attrs":{},"classes":[]}]},{"id":10,"tag":"img","styles":{"width":"50%"},"attrs":{"data-src":"/uploads/-/2021-04-02-19-41-1_559x377.jpg"},"classes":["wo997_img"]},{"id":107,"tag":"p","text":"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","styles":{"marginTop":"20px","fontSize":"30px"},"attrs":{},"classes":[]},{"id":3,"tag":"div","styles":{},"children":[{"id":4,"tag":"p","text":"dziecko 1","styles":{},"attrs":{},"classes":[]},{"id":8,"tag":"p","text":"","styles":{},"attrs":{},"classes":[]},{"id":5,"tag":"p","children":[{"id":6,"tag":"span","text":"dziecko 2.1","styles":{},"attrs":{},"classes":[]},{"id":7,"tag":"span","text":"dziecko 2.2","styles":{},"attrs":{},"classes":[]}],"styles":{},"attrs":{},"classes":[]}],"attrs":{},"classes":[]},{"id":9,"tag":"div","styles":{"backgroundColor":"red","padding":"20px"},"children":[],"attrs":{},"classes":[]}]';
$v_dom = json_decode($v_dom_json, true);

define("SINGLE_HTML_TAGS", ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

function traverseVDom($v_nodes)
{
    $content_html = "";
    $styles_html = "";

    foreach ($v_nodes as $v_node) {
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
            $styles_html .= $sub_data["styles_html"];
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
            $styles_html .= ".$base_class { $node_styles }";
        }
    }

    return [
        "content_html" => $content_html,
        "styles_html" => $styles_html
    ];
};

$dom_data = traverseVDom($v_dom);

?>

<?php startSection("head_content"); ?>

<title>Strony test</title>

<style>
    <?= $dom_data["styles_html"] ?>
</style>

<?php startSection("body_content"); ?>

<div>
    <?= $dom_data["content_html"] ?>
</div>

<?php include "bundles/global/templates/default.php"; ?>