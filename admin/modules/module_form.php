<?php //route[admin/module_form]

if (isset($_POST["module_name"])) {
    $module_name = $_POST["module_name"];
    ob_start();
    if (isset($link_module_form_path[$module_name])) {
        include $link_module_form_path[$module_name];
        $form = prepareModuleBlock(ob_get_clean(), $module_name);
    } else {
        $form = "";
    }
    $form_data = triggerEvent("get_module_form_data", ["module_name" => $module_name]);
    json_response([
        "form" => $form,
        "form_data" => $form_data,
    ]);
}
