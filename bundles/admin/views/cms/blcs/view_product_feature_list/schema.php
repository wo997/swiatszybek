<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_feature_list",
    "render" => function () {
        return def(Templates::$sections, "view_product_feature_list", "");
    },
]);
