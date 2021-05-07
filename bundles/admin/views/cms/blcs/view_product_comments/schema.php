<?php //hook[event]

EventListener::register("render_module_view_product_comments", function () {
    global $sections;
    return $sections["view_product_comments"];
});
