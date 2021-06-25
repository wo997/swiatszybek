<?php //hook[register]

EventListener::register("get_carrier_img_set", function ($params) {
    if ($params["api_key"] !== "ups") {
        return;
    }

    $core_images = getSetting(["theme", "core_images"], []);
    $ups = def($core_images, "carrier_ups", "");

    return [
        "light" => $ups,
        "dark" => $ups,
        "scale" => 0.5,
    ];
});
