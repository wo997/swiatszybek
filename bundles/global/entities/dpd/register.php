<?php //hook[register]

EventListener::register("get_carrier_img_set", function ($params) {
    if ($params["api_key"] !== "dpd") {
        return;
    }

    $core_images = getSetting(["theme", "core_images"], []);
    $dpd = def($core_images, "carrier_dpd", "");

    return [
        "light" => $dpd,
        "dark" => $dpd,
    ];
});
