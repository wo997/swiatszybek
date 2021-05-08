<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "product_list",
    "render" => function ($params) {
        //$google_map_embed_code = def($params, ["v_node", "settings", "google_map_embed_code"]);
        ob_start();
        echo "[lista prod]";
        //include "bundles/global/templates/parts/header/header.php";
        return ob_get_clean();
    },
    "js_path" => BUILDS_PATH . "modules/product_list.js",
    "css_path" => BUILDS_PATH . "modules/product_list.css",
]);
