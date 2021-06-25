<?php //hook[register]

EventListener::register("get_carrier_img_set", function ($params) {
    if ($params["api_key"] !== "inpost") {
        return;
    }

    $core_images = getSetting(["theme", "core_images"], []);
    $inpost_black = def($core_images, "carrier_inpost_black", "");
    $inpost_white = def($core_images, "carrier_inpost_white", "");

    return [
        "light" => $inpost_black,
        "dark" => $inpost_white,
        "scale" => 0.9,
    ];
});
