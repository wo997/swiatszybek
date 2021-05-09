<?php //route[{ADMIN}/cms/module/render_many]

$v_nodes_rendered = [];
foreach (json_decode($_POST["v_nodes_to_render"], true) as $v_node) {
    $module = def(PiepCMSManager::$modules, $v_node["module_name"]);
    $css_path = def($module, "css_path");
    if ($css_path) {
        $v_node["rendered_css_content"] = @file_get_contents($css_path);
    }
    $render = def($module, "render");
    if ($render) {
        $v_node["rendered_body"] = $render(["v_node" => $v_node]);
    }

    $v_nodes_rendered[] = $v_node;
}
Request::jsonResponse($v_nodes_rendered);
