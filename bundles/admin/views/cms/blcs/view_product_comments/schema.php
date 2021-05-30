<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_comments",
    "render" => function () {
        return def(Templates::$sections, "view_product_comments", "");
    },
]);
