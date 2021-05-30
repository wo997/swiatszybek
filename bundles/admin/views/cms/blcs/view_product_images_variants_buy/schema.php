<?php //hook[event]

PiepCMSManager::registerModule([
    "name" => "view_product_images_variants_buy",
    "render" => function () {
        return def(Templates::$sections, "view_product_images_variants_buy", "");
    },
]);
