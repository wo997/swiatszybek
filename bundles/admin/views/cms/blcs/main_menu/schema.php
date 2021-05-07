<?php //hook[event]

EventListener::register("render_module_main_menu", function () {
    ob_start();
    include "bundles/global/templates/parts/header/header.php";
    return ob_get_clean();
});
