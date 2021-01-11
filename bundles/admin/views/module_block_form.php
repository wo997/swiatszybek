<?php //route[{ADMIN}module_block_form]

if (isset($_POST["module_block_name"])) {
    $module_block_name = $_POST["module_block_name"];
    ob_start();
    include $link_module_block_form_path[$module_block_name];
    die(prepareModuleBlock(ob_get_clean(), $module_block_name));
}
