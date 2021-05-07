<?php //hook[event]

EventListener::register("render_module_view_product_images_variants_buy", function () {
    global $sections;
    return [
        "html" => $sections["view_product_images_variants_buy"]
    ];
});
