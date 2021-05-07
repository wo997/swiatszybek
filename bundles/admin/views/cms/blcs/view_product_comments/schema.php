<?php //hook[event]

EventListener::register("render_module_view_product_comments", function () {
    global $sections;
    return [
        "html" => $sections["view_product_comments"]
    ];
});
