<?php //hook[register]

EventListener::register("get_carrier_img_set", function ($params) {
    if ($params["api_key"] !== "dpd") {
        return;
    }

    $core_images = getSetting(["theme", "core_images"], []);
    $dpd_light = def($core_images, "carrier_dpd_light", "");
    $dpd_dark = def($core_images, "carrier_dpd_dark", "");

    return [
        "light" => $dpd_light,
        "dark" => $dpd_dark,
        "scale" => 0.9,
    ];
});
