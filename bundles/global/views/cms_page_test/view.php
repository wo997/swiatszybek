<?php //route[/cms_page_test]

$page_id = intval(Request::urlParam(1, -1));

$page_data = DB::fetchRow("SELECT * FROM page WHERE page_id = ?", [$page_id]);

$page_release = $page_data["version"];

$v_dom_json = $page_data["v_dom_json"];
$v_dom = def(json_decode($v_dom_json, true), []);

$parent_template_id = $page_data["template_id"];

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

$all_v_doms = [];

foreach ($parent_templates as $parent_template) {
    $parent_template_v_dom = json_decode($parent_template["v_dom_json"], true);
    $all_v_doms[] = def($parent_template_v_dom, []);
}

$all_v_doms[] = $v_dom;

// glue v_doms from the smallest pieces to the biggest
for ($i = count($all_v_doms) - 2; $i >= 0; $i--) {
    $base_v_dom = &$all_v_doms[$i];
    $append_v_dom = &$all_v_doms[$i + 1];

    $is_top_layer = $i == count($all_v_doms) - 2;

    $traverseVDom = function (&$base_v_nodes) use (&$traverseVDom, &$append_v_dom) {
        foreach ($base_v_nodes as $base_v_node) {
            $template_hook_id = def($base_v_node, ["settings", "template_hook_id"]);
            if ($template_hook_id) {
                $base_v_node["classes"][] = "vertical_container";
                // just remove a class
                $module_template_hook_index = array_search("module_template_hook", $base_v_node["classes"]);
                if ($module_template_hook_index !== false) {
                    array_splice($base_v_node["classes"], $module_template_hook_index, 1);
                }

                // now glue these, but as u can see the template_hook_id isn't passed by default, just for the last layer
                foreach ($append_v_dom as $append_v_node) {
                    if ($append_v_node["template_hook_id"] === $template_hook_id) {
                        $avn = $append_v_node;
                        break;
                    }
                }

                if (isset($avn)) {
                    // copy just the children, styling (like padding) etc is allowed only in the base template
                    $base_v_node["children"] = $avn["children"];
                } else {
                    $base_v_node["children"] = [];
                }
            } else {
                $children = def($base_v_node, ["children"]);
                if ($children) {
                    $traverseVDom($children);
                }
            }
        }
    };

    traverseVDom($base_v_dom);
};

$full_v_dom = $all_v_doms[0];

$dom_data = traverseVDom($full_v_dom);

?>

<?php startSection("head_content"); ?>

<title>Strony test</title>

<link href="/<?= BUILDS_PATH . "/pages/css/page_$page_id.css?v=$page_release" ?>" rel="stylesheet">

<?php startSection("body_content"); ?>

<div>
    <?= $dom_data["content_html"] ?>
</div>

<script src="/<?= BUILDS_PATH . "/pages/js/page_$page_id.js?v=$page_release" ?>"></script>

<?php include "bundles/global/templates/default.php"; ?>