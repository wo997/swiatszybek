<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "main_menu",
    "render" => function () {
        ob_start();
        include "bundles/global/templates/parts/header/header.php";
        return ob_get_clean();
    },
    "js" => BUILDS_PATH . "modules/main_menu.js",
    "css" => BUILDS_PATH . "modules/main_menu.css",
]);
