<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_images_variants_buy",
    "render" => function () {
        global $sections;
        return def($sections, "view_product_images_variants_buy", "");
    },
]);
