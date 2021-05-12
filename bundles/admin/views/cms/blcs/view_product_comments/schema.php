<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_comments",
    "render" => function () {
        global $sections;
        return def($sections, "view_product_comments", "");
    },
]);
