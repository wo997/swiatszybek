<?php //route[{ADMIN}/module_form]

if (isset($_POST["module_name"])) {
    $module_name = $_POST["module_name"];
    ob_start();
    if (isset($link_module_form_path[$module_name])) {
        include $link_module_form_path[$module_name];
        $form = prepareModuleBlock(ob_get_clean(), $module_name);
    } else {
        $form = "";
    }

    $settings_file = MODULE_SETTINGS_PATH . "/$module_name.json";
    if (file_exists($settings_file)) {
        $form_data_json = file_get_contents($settings_file);
    } else {
        $form_data_json = "{}";
    }
    try {
        $form_data = json_decode($form_data_json, true);
    } catch (Exception $e) {
        $form_data = [];
    }

    Request::jsonResponse([
        "form" => $form,
        "form_data" => $form_data,
    ]);
}
