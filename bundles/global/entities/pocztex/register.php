<?php //hook[register]

EventListener::register("get_carrier_img_set", function ($params) {
    if ($params["api_key"] !== "pocztex") {
        return;
    }

    $core_images = getSetting(["theme", "core_images"], []);
    $pocztex = def($core_images, "carrier_pocztex", "");

    return [
        "light" => $pocztex,
        "dark" => $pocztex,
    ];
});
