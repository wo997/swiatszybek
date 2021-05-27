<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_feature_list",
    "render" => function () {
        global $sections;
        return def($sections, "view_product_feature_list", "");
    },
]);
