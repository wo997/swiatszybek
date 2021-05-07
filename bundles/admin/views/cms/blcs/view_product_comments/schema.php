<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_comments",
    "render" => function () {
        global $sections;
        return $sections["view_product_comments"];
    },
]);
