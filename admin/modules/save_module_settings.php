<?php //route[admin/save_module_settings]

if (isset($_POST["module_name"])) {
    $module_name = $_POST["module_name"];
    if (!isset($link_module_path[$module_name])) {
        die("Module '$module_name' not found!");
    }
    $module_path = $link_module_path[$module_name];
    $module_dir = pathinfo($module_path)["dirname"];
    $module_settings_path = $module_dir . "/settings.json";

    file_put_contents($module_settings_path, $_POST["form_data"]);
}
