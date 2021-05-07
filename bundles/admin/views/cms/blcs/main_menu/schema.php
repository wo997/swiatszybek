<?php //hook[event]

EventListener::register("render_module_main_menu", function () {
    ob_start();
    include "bundles/global/templates/parts/header/header.php";
    return [
        "html" => ob_get_clean(),
        "js" => BUILDS_PATH . "modules/main_menu.js",
        "css" => BUILDS_PATH . "modules/main_menu.css",
    ];
});
