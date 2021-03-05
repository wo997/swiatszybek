<?php //route[/{ADMIN}save_module_settings]

if (isset($_POST["module_name"])) {
    $module_name = $_POST["module_name"];

    $module_settings_path = MODULE_SETTINGS_PATH . "/$module_name.json";

    Files::save($module_settings_path, $_POST["form_data"]);

    triggerEvent("settings_change");
}
